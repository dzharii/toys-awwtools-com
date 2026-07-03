import type { EinkReaderApp } from "../framework/app/automation-app.js";
import { agentAutoCapture } from "../framework/agentic/agent-step.js";

/**
 * Switch the reader between paged and scroll modes through the settings UI and
 * wait until the reader reflects the new mode. Used by navigation and pairwise
 * specs that exercise both surfaces.
 */
export async function switchModeFlow(app: EinkReaderApp, mode: "paged" | "scroll"): Promise<void> {
  const reader = app.reader();
  await reader.openSettings();
  await app.settings().expectReady();
  await app.settings().setMode(mode);
  await app.settings().close();
  await app.busy().waitHidden();
  await app.timeouts.waitUntil(async () => (await reader.currentMode()) === mode, {
    timeoutMs: app.timeouts.normal,
    description: `reader to switch to ${mode} mode`,
  });
  await agentAutoCapture(app, `switch-mode-${mode}`);
}
