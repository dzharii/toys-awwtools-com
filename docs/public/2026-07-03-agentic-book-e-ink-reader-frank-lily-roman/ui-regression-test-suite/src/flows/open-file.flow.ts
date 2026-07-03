import type { EinkReaderApp } from "../framework/app/automation-app.js";
import type { FixtureName } from "../framework/support/fixtures.js";
import { agentAutoCapture } from "../framework/agentic/agent-step.js";

/**
 * Open a fixture through the file picker and wait until the reader is ready with
 * the fixture's marker visible. Reused by many specs so the "open a file" path
 * is expressed once.
 */
export async function openFileByPickerFlow(
  app: EinkReaderApp,
  name: FixtureName,
  marker?: string,
): Promise<void> {
  await app.openScreen().expectReady();
  await app.openScreen().openByPicker(name);
  await app.busy().waitHidden();
  await app.reader().expectReady();
  if (marker) await app.reader().waitForMarker(marker);
  await agentAutoCapture(app, `open-file-picker-${name}`);
}

/**
 * Open a fixture through drag-and-drop and wait until the reader is ready.
 */
export async function openFileByDropFlow(
  app: EinkReaderApp,
  name: FixtureName,
  marker?: string,
): Promise<void> {
  await app.openScreen().expectReady();
  await app.openScreen().dropFile(name);
  await app.busy().waitHidden();
  await app.reader().expectReady();
  if (marker) await app.reader().waitForMarker(marker);
  await agentAutoCapture(app, `open-file-drop-${name}`);
}
