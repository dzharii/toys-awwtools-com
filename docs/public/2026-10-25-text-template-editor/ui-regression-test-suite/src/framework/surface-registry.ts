import type { GuidedApp } from "./guided-app";
import type { PageObject } from "./page-object";
import { DocumentWorkspacePage } from "../page-objects/document-workspace.page";
import { FieldEditorPage } from "../page-objects/field-editor.page";
import { NavigationPage } from "../page-objects/navigation.page";
import { SettingsPage } from "../page-objects/settings.page";
import { TemplateAuthoringPage } from "../page-objects/template-authoring.page";
import { TemplateCatalogPage } from "../page-objects/template-catalog.page";
import { WorkspacePanelsPage } from "../page-objects/workspace-panels.page";

export interface SurfaceDefinition {
  readonly id: string;
  readonly description: string;
  readonly pageObject: abstract new (...args: never[]) => PageObject;
  readonly defaults: "validate" | "not-applicable";
  readonly create: (app: GuidedApp) => PageObject;
}

/**
 * The explicit inventory is also checked by the compiler-based completeness audit.
 * Class metadata is never instantiated; factories reuse the current app's graph.
 */
export const surfaceRegistry = [
  {
    id: "document-workspace",
    description: "Guided document and generated result",
    pageObject: DocumentWorkspacePage,
    defaults: "not-applicable",
    create: (app) => app.documents(),
  },
  {
    id: "document-navigation",
    description: "Document history and workspace navigation",
    pageObject: NavigationPage,
    defaults: "not-applicable",
    create: (app) => app.navigation(),
  },
  {
    id: "template-catalog",
    description: "Bundled template discovery",
    pageObject: TemplateCatalogPage,
    defaults: "not-applicable",
    create: (app) => app.templates(),
  },
  {
    id: "workspace-panels",
    description: "Neutral guidance shell and panel access",
    pageObject: WorkspacePanelsPage,
    defaults: "not-applicable",
    create: (app) => app.panels(),
  },
  {
    id: "field-editor",
    description: "An active editable field and guidance",
    pageObject: FieldEditorPage,
    defaults: "validate",
    create: (app) => app.fieldEditor(),
  },
  {
    id: "template-authoring",
    description: "Current native GTL source editor",
    pageObject: TemplateAuthoringPage,
    defaults: "validate",
    create: (app) => app.authoring(),
  },
  {
    id: "settings",
    description: "Full settings workspace",
    pageObject: SettingsPage,
    defaults: "validate",
    create: (app) => app.settings(),
  },
] satisfies readonly SurfaceDefinition[];

export function assertValidSurfaces(surfaces: readonly SurfaceDefinition[]): void {
  if (!surfaces.length) throw new Error("The Page Object registry is empty.");
  const ids = new Set<string>();
  const classes = new Set<SurfaceDefinition["pageObject"]>();
  for (const surface of surfaces) {
    if (
      !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(surface.id) ||
      surface.id.length > 80 ||
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(surface.id)
    )
      throw new Error(`Unsafe surface ID: ${surface.id}`);
    if (!surface.description.trim()) throw new Error(`${surface.id}: missing description.`);
    if (ids.has(surface.id)) throw new Error(`Duplicate surface ID: ${surface.id}`);
    if (classes.has(surface.pageObject))
      throw new Error(`${surface.id}: duplicate Page Object class.`);
    ids.add(surface.id);
    classes.add(surface.pageObject);
  }
}

assertValidSurfaces(surfaceRegistry);
