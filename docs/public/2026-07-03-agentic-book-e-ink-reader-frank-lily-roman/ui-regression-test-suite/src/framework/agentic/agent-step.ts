import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "@playwright/test";

import {
  getAgenticEnv,
  ensureArtifactDirs,
  nextStepId,
  isAgenticAnalysis,
  type AgenticEnv,
} from "./agentic-context.js";
import {
  captureScreenshot,
  captureLayout,
  captureVisibleElements,
  captureDomSummary,
  captureA11y,
} from "./capture.js";

/**
 * Step instrumentation for Agentic Analysis Mode.
 *
 *  - In normal mode (EINK_AGENTIC_ANALYSIS unset) every export here is a
 *    zero-cost no-op: the action runs, nothing is written, nothing is captured.
 *  - In agentic mode, meaningful actions are wrapped so the runner can correlate
 *    a screenshot + layout + visible-elements + DOM summary + accessibility
 *    snapshot with each step, per test id and step id.
 *
 * Capture is best-effort telemetry: it is wrapped so a capture failure never
 * fails the underlying test.
 */

export interface StepRecord {
  id: string;
  label: string;
  startedAt: string;
  durationMs: number;
  status: "passed" | "failed";
  error: string | null;
  screenshots: string[];
  layout: string | null;
  visibleElements: string | null;
  dom: string | null;
  accessibility: string | null;
}

const steps: StepRecord[] = [];

export interface AgentStepOptions {
  /** Capture a "before" screenshot in addition to the default "after" state. */
  captureBefore?: boolean;
  /** Full-page screenshot instead of viewport (default false). */
  fullPage?: boolean;
  /** Also take a screenshot with animations enabled (E Ink transition studies). */
  captureDuringTransition?: boolean;
}

/** Minimal context needed to capture: any object exposing a Playwright Page. */
interface HasPage {
  readonly page: Page;
}

async function writeArtifacts(
  env: AgenticEnv,
  page: Page,
  stepId: string,
  phase: "before" | "after",
): Promise<{ screenshot: string | null; layout: string | null; visible: string | null; dom: string | null; a11y: string | null }> {
  const dirs = ensureArtifactDirs(env);
  const result = { screenshot: null as string | null, layout: null as string | null, visible: null as string | null, dom: null as string | null, a11y: null as string | null };
  const rel = (base: string, name: string): string => `${base}/${name}`;

  if (env.capture.screenshots) {
    const name = `${stepId}-${phase}.png`;
    const ok = await captureScreenshot(page, join(dirs.screenshots, name), { fullPage: false });
    if (ok) result.screenshot = rel("screenshots", name);
  }
  if (env.capture.layout) {
    const layout = await captureLayout(page);
    if (layout) {
      const name = `${stepId}-${phase}-layout.json`;
      writeFileSync(join(dirs.snapshots, name), JSON.stringify(layout, null, 2));
      result.layout = rel("snapshots", name);
    }
  }
  if (env.capture.visibleElements) {
    const visible = await captureVisibleElements(page);
    if (visible) {
      const name = `${stepId}-${phase}-visible-elements.json`;
      writeFileSync(join(dirs.snapshots, name), JSON.stringify(visible, null, 2));
      result.visible = rel("snapshots", name);
    }
  }
  if (env.capture.domSnapshots) {
    const dom = await captureDomSummary(page, env.capture.fullDom);
    if (dom) {
      const name = `${stepId}-${phase}.json`;
      writeFileSync(join(dirs.dom, name), JSON.stringify(dom, null, 2));
      result.dom = rel("dom", name);
    }
  }
  if (env.capture.a11ySnapshots) {
    const a11y = await captureA11y(page);
    if (a11y) {
      const name = `${stepId}-${phase}-accessibility.json`;
      writeFileSync(join(dirs.snapshots, name), JSON.stringify(a11y, null, 2));
      result.a11y = rel("snapshots", name);
    }
  }
  return result;
}

/**
 * Lightweight choke-point capture. Call after a meaningful UI action (file
 * open, settings change, mode change, page turn, error). No-op in normal mode.
 */
export async function agentAutoCapture(ctx: HasPage, label: string): Promise<void> {
  const env = getAgenticEnv();
  if (!env) return;
  const stepId = nextStepId(label);
  const started = Date.now();
  try {
    const arts = await writeArtifacts(env, ctx.page, stepId, "after");
    steps.push({
      id: stepId,
      label,
      startedAt: new Date(started).toISOString(),
      durationMs: Date.now() - started,
      status: "passed",
      error: null,
      screenshots: arts.screenshot ? [arts.screenshot] : [],
      layout: arts.layout,
      visibleElements: arts.visible,
      dom: arts.dom,
      accessibility: arts.a11y,
    });
  } catch {
    /* capture is best-effort; never fail the test */
  }
}

/**
 * Explicit, richer step wrapper (K00). Records before/after artifacts around an
 * action and reports the step status. No-op wrapper in normal mode (just runs
 * the action).
 */
export async function agentStep(
  ctx: HasPage,
  _testId: string,
  label: string,
  action: () => Promise<void>,
  options: AgentStepOptions = {},
): Promise<void> {
  const env = getAgenticEnv();
  if (!env) {
    await action();
    return;
  }
  const stepId = nextStepId(label);
  const started = Date.now();
  const screenshots: string[] = [];
  let layout: string | null = null;
  let visible: string | null = null;
  let dom: string | null = null;
  let a11y: string | null = null;

  if (options.captureBefore) {
    const before = await writeArtifacts(env, ctx.page, stepId, "before").catch(() => null);
    if (before?.screenshot) screenshots.push(before.screenshot);
  }

  let status: "passed" | "failed" = "passed";
  let error: string | null = null;
  try {
    await action();
  } catch (e) {
    status = "failed";
    error = e instanceof Error ? e.message : String(e);
    // Capture the failure state before rethrowing.
    await writeArtifacts(env, ctx.page, stepId, "after").catch(() => null);
    steps.push({ id: stepId, label, startedAt: new Date(started).toISOString(), durationMs: Date.now() - started, status, error, screenshots, layout, visibleElements: visible, dom, accessibility: a11y });
    throw e;
  }

  const after = await writeArtifacts(env, ctx.page, stepId, "after").catch(() => null);
  if (after) {
    if (after.screenshot) screenshots.push(after.screenshot);
    layout = after.layout;
    visible = after.visible;
    dom = after.dom;
    a11y = after.a11y;
  }
  steps.push({ id: stepId, label, startedAt: new Date(started).toISOString(), durationMs: Date.now() - started, status, error, screenshots, layout, visibleElements: visible, dom, accessibility: a11y });
}

/** Snapshot of all recorded steps for this process. */
export function getRecordedSteps(): StepRecord[] {
  return steps.slice();
}

/** Write steps.json into the test artifact folder (called by the final capture). */
export function flushSteps(env: AgenticEnv): void {
  if (steps.length === 0) return;
  const dirs = ensureArtifactDirs(env);
  writeFileSync(join(dirs.base, "steps.json"), JSON.stringify(steps, null, 2));
}

export { isAgenticAnalysis };
