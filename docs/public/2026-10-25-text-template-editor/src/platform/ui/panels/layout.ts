import { isRecord } from "../../errors";

export type WorkspaceContext = "document" | "authoring";
export type PanelId = "documents" | "history" | "field" | "issues" | "settings";
export type Placement = "floating" | "left" | "right";
export type Visibility = "expanded" | "collapsed" | "closed";
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface PanelState {
  placement: Placement;
  visibility: Visibility;
  rect: Rect;
  dockWidth: number;
  userGeometry: boolean;
}
export interface WorkspaceLayout {
  panels: Record<PanelId, PanelState>;
  active: { left: PanelId; right: PanelId };
}
export interface LayoutDocument {
  schemaVersion: 1;
  workspaces: Record<WorkspaceContext, WorkspaceLayout>;
}
export const panelIds: PanelId[] = ["documents", "history", "field", "issues", "settings"];
export const panelTitles: Record<PanelId, string> = {
  documents: "Documents",
  history: "Template drafts",
  field: "Field editor",
  issues: "Issues",
  settings: "Settings",
};
export const layoutKey = "gtl.workspace-layout.v1";
export function defaults(context: WorkspaceContext): WorkspaceLayout {
  const state = (width: number, height = 480): PanelState => ({
    placement: "floating",
    visibility: "closed",
    rect: { x: 850, y: 94, width, height },
    dockWidth: width,
    userGeometry: false,
  });
  return {
    panels: {
      documents: {
        ...state(248),
        placement: "left",
        visibility: context === "document" ? "expanded" : "closed",
      },
      history: {
        ...state(280),
        placement: "left",
        visibility: context === "authoring" ? "expanded" : "closed",
      },
      field: state(360, 560),
      issues: state(340, 400),
      settings: state(350, 500),
    },
    active: { left: context === "document" ? "documents" : "history", right: "field" },
  };
}
export function defaultLayout(): LayoutDocument {
  return {
    schemaVersion: 1,
    workspaces: { document: defaults("document"), authoring: defaults("authoring") },
  };
}
function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
export function decodeLayout(value: unknown): LayoutDocument {
  const result = defaultLayout();
  if (!isRecord(value) || value.schemaVersion !== 1 || !isRecord(value.workspaces)) return result;
  for (const context of ["document", "authoring"] as const) {
    const workspace = value.workspaces[context];
    if (!isRecord(workspace) || !isRecord(workspace.panels)) continue;
    for (const id of panelIds) {
      const item = workspace.panels[id];
      if (
        !isRecord(item) ||
        !["floating", "left", "right"].includes(String(item.placement)) ||
        !["expanded", "collapsed", "closed"].includes(String(item.visibility)) ||
        !isRecord(item.rect) ||
        !finite(item.rect.x) ||
        !finite(item.rect.y) ||
        !finite(item.rect.width) ||
        !finite(item.rect.height) ||
        item.rect.width <= 0 ||
        item.rect.height <= 0 ||
        !finite(item.dockWidth) ||
        item.dockWidth <= 0 ||
        typeof item.userGeometry !== "boolean"
      )
        continue;
      result.workspaces[context].panels[id] = {
        placement: item.placement as Placement,
        visibility: item.visibility as Visibility,
        rect: {
          x: Math.max(-100000, Math.min(100000, item.rect.x)),
          y: Math.max(-100000, Math.min(100000, item.rect.y)),
          width: Math.max(240, Math.min(2000, item.rect.width)),
          height: Math.max(160, Math.min(2000, item.rect.height)),
        },
        dockWidth: Math.max(220, Math.min(700, item.dockWidth)),
        userGeometry: item.userGeometry,
      };
    }
    if (isRecord(workspace.active))
      for (const edge of ["left", "right"] as const)
        if (panelIds.includes(workspace.active[edge] as PanelId))
          result.workspaces[context].active[edge] = workspace.active[edge] as PanelId;
  }
  return result;
}
export function clampRect(rect: Rect, bounds: Rect, collapsed = false): Rect {
  const width = Math.min(Math.max(240, rect.width), bounds.width);
  const height = collapsed ? 44 : Math.min(Math.max(160, rect.height), bounds.height);
  return {
    width,
    height,
    x: Math.max(bounds.x, Math.min(rect.x, bounds.x + bounds.width - width)),
    y: Math.max(bounds.y, Math.min(rect.y, bounds.y + bounds.height - height)),
  };
}
export function initialRect(anchor: Rect | undefined, rect: Rect, bounds: Rect): Rect {
  if (anchor) {
    const candidates = [
      {
        x: anchor.x + anchor.width + 16,
        y: Math.max(bounds.y, Math.min(anchor.y, bounds.y + bounds.height - rect.height)),
      },
      {
        x: anchor.x - rect.width - 16,
        y: Math.max(bounds.y, Math.min(anchor.y, bounds.y + bounds.height - rect.height)),
      },
      { x: anchor.x, y: anchor.y - rect.height - 16 },
      { x: anchor.x, y: anchor.y + anchor.height + 16 },
    ];
    const candidate = candidates.find(
      (item) =>
        item.x >= bounds.x &&
        item.y >= bounds.y &&
        item.x + rect.width <= bounds.x + bounds.width &&
        item.y + rect.height <= bounds.y + bounds.height,
    );
    if (candidate) return { ...rect, ...candidate };
  }
  return clampRect({ ...rect, x: bounds.x + bounds.width - rect.width, y: bounds.y + 16 }, bounds);
}
export function initialFieldRect(active: boolean, anchor: Rect | undefined, bounds: Rect): Rect {
  const rect = { x: bounds.x, y: bounds.y, width: active ? 380 : 320, height: active ? 600 : 180 };
  return active
    ? initialRect(anchor, rect, bounds)
    : clampRect(
        {
          ...rect,
          x: bounds.x + bounds.width - rect.width,
          y: bounds.y + bounds.height - rect.height,
        },
        bounds,
      );
}
export function dockAllocation(
  layout: WorkspaceLayout,
  applicable: PanelId[],
  width: number,
): { left: number; right: number } {
  const result = { left: 0, right: 0 };
  if (width < 900) return result;
  for (const edge of ["left", "right"] as const) {
    const expanded = applicable.filter(
      (id) => layout.panels[id].placement === edge && layout.panels[id].visibility === "expanded",
    );
    if (expanded.length)
      result[edge] = Math.max(...expanded.map((id) => layout.panels[id].dockWidth));
  }
  const available = Math.max(0, width - 520);
  if (result.left + result.right > available) {
    const scale = available / (result.left + result.right);
    result.left = result.left * scale >= 220 ? Math.floor(result.left * scale) : 0;
    result.right = result.right * scale >= 220 ? Math.floor(result.right * scale) : 0;
  }
  return result;
}
