import { test } from "../../framework/guided-test";
import { surfaceRegistry } from "../../framework/surface-registry";
import { runSurfaceSmoke } from "../../framework/surface-smoke";
import { screenshotAction } from "../../support/capture-surface";

test.use({ viewport: { width: 1440, height: 1000 } });

for (const surface of surfaceRegistry) {
  test(`Capture ${surface.id}: ${surface.description}`, async ({ app }, testInfo) => {
    await runSurfaceSmoke(app, surface, testInfo, [screenshotAction]);
    if (surface.defaults === "validate") await surface.create(app).expectDefaultState();
  });
}
