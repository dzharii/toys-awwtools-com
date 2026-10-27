import type { Page, TestInfo } from "@playwright/test";
import type { SurfaceAction } from "../framework/surface-smoke";

/**
 * Full-page capture does not expand internally scrolling panels. OutputPath
 * isolates parallel artifacts; no product state is prepared by this action.
 */
export async function captureSurface(
  page: Pick<Page, "screenshot">,
  surfaceId: string,
  testInfo: Pick<TestInfo, "outputPath" | "attach">,
): Promise<void> {
  const path = testInfo.outputPath(`${surfaceId}.png`);
  await page.screenshot({ path, type: "png", fullPage: true, animations: "disabled" });
  await testInfo.attach(`${surfaceId}.png`, { path, contentType: "image/png" });
}

export const screenshotAction: SurfaceAction = {
  id: "full-page-screenshot",
  run: ({ app, surface, testInfo }) => captureSurface(app.context.page, surface.id, testInfo),
};
