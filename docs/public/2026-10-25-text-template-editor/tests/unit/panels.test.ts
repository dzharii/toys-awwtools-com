import { expect, test } from "bun:test";
import {
  clampRect,
  decodeLayout,
  defaultLayout,
  dockAllocation,
  initialRect,
} from "../../src/platform/ui/panels/layout";

test("layout validation isolates corrupt entries and unsupported versions", () => {
  const value = defaultLayout();
  value.workspaces.document.panels.field.rect.width = Number.NaN;
  value.workspaces.document.panels.issues.placement = "right";
  expect(decodeLayout(value).workspaces.document.panels.field.rect.width).toBe(360);
  expect(decodeLayout(value).workspaces.document.panels.issues.placement).toBe("right");
  expect(decodeLayout({ schemaVersion: 99 })).toEqual(defaultLayout());
});
test("clamping keeps titlebars reachable without mutating desired rectangles", () => {
  const rect = { x: 99999, y: -9000, width: 1200, height: 800 };
  expect(clampRect(rect, { x: 8, y: 72, width: 304, height: 400 })).toEqual({
    x: 8,
    y: 72,
    width: 304,
    height: 400,
  });
  expect(rect.width).toBe(1200);
  expect(clampRect(rect, { x: 8, y: 72, width: 304, height: 400 }, true).height).toBe(44);
});
test("context placement prefers right then left and uses a safe fallback", () => {
  const bounds = { x: 0, y: 64, width: 1366, height: 700 };
  const rect = { x: 0, y: 0, width: 300, height: 300 };
  expect(initialRect({ x: 500, y: 100, width: 100, height: 30 }, rect, bounds).x).toBe(616);
  expect(initialRect({ x: 1100, y: 100, width: 100, height: 30 }, rect, bounds).x).toBe(784);
  expect(initialRect(undefined, rect, bounds).y).toBeGreaterThanOrEqual(64);
});
test("same-edge docks share width and the last collapse recovers all center space", () => {
  const layout = defaultLayout().workspaces.document;
  layout.panels.field.placement = "left";
  layout.panels.field.visibility = "expanded";
  expect(dockAllocation(layout, ["documents", "field"], 1366)).toEqual({ left: 360, right: 0 });
  layout.panels.documents.visibility = "collapsed";
  layout.panels.field.visibility = "collapsed";
  expect(dockAllocation(layout, ["documents", "field"], 1366)).toEqual({ left: 0, right: 0 });
});
test("responsive allocation preserves desktop intent and minimum center", () => {
  const layout = defaultLayout().workspaces.document;
  layout.panels.field.placement = "right";
  layout.panels.field.visibility = "expanded";
  expect(dockAllocation(layout, ["documents", "field"], 768)).toEqual({ left: 0, right: 0 });
  const docks = dockAllocation(layout, ["documents", "field"], 1000);
  expect(1000 - docks.left - docks.right).toBeGreaterThanOrEqual(520);
  expect(layout.panels.documents.visibility).toBe("expanded");
});
