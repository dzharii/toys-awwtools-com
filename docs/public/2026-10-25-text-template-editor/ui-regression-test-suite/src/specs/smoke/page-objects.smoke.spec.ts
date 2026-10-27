import { test } from "../../framework/guided-test";
import { surfaceRegistry } from "../../framework/surface-registry";
import { runSurfaceSmoke } from "../../framework/surface-smoke";

for (const surface of surfaceRegistry) {
  test(`PO ${surface.id}: ${surface.description}`, async ({ app }, testInfo) => {
    await runSurfaceSmoke(app, surface, testInfo);
  });
}
