import type { EinkReaderApp } from "../framework/app/automation-app.js";
import { agentAutoCapture } from "../framework/agentic/agent-step.js";

/**
 * Apply a set of preferences through the settings UI in the deterministic order
 * defined by the manual plan (N00), so pairwise runs are reproducible and a
 * later-failing setting can be diagnosed with all earlier values known.
 *
 * The panel is opened once, all requested settings are applied, then closed.
 */
export interface PreferencePatch {
  mode?: "paged" | "scroll";
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  measure?: number;
  paraSpacing?: number;
  align?: "left" | "justify";
  theme?: string;
  contrast?: "soft" | "normal";
  textureStrength?: number;
  margin?: number;
  einkIntensity?: "off" | "reduced" | "balanced" | "strong";
  refreshStyle?: string;
  motion?: "system" | "reduced" | "full";
  showProgress?: boolean;
}

export async function applyPreferencesFlow(app: EinkReaderApp, patch: PreferencePatch): Promise<void> {
  const reader = app.reader();
  const settings = app.settings();

  await reader.openSettings();
  await settings.expectReady();

  // Deterministic order: mode -> font -> size -> line height -> measure ->
  // paragraph spacing -> align -> theme -> contrast -> texture -> margin ->
  // eink -> refresh -> motion -> progress.
  if (patch.mode !== undefined) await settings.setMode(patch.mode);
  if (patch.fontFamily !== undefined) await settings.setFont(patch.fontFamily);
  if (patch.fontSize !== undefined) await settings.setFontSize(patch.fontSize);
  if (patch.lineHeight !== undefined) await settings.setLineHeight(patch.lineHeight);
  if (patch.measure !== undefined) await settings.setMeasure(patch.measure);
  if (patch.paraSpacing !== undefined) await settings.setParaSpacing(patch.paraSpacing);
  if (patch.align !== undefined) await settings.setAlign(patch.align);
  if (patch.theme !== undefined) await settings.setTheme(patch.theme);
  if (patch.contrast !== undefined) await settings.setContrast(patch.contrast);
  if (patch.textureStrength !== undefined) await settings.setTextureStrength(patch.textureStrength);
  if (patch.margin !== undefined) await settings.setMargin(patch.margin);
  if (patch.einkIntensity !== undefined) await settings.setEinkIntensity(patch.einkIntensity);
  if (patch.refreshStyle !== undefined) await settings.setRefreshStyle(patch.refreshStyle);
  if (patch.motion !== undefined) await settings.setMotion(patch.motion);
  if (patch.showProgress !== undefined) await settings.setShowProgress(patch.showProgress);

  await settings.close();
  await app.busy().waitHidden();
  await agentAutoCapture(app, "apply-preferences");
}
