import { button, el, emit } from "../../../platform/ui/dom";
import type { WorkingAuthoringDraft } from "../service";

export class AuthoringNavigation extends HTMLElement {
  private list = el("div");
  private history = el("div");
  private key = "";
  constructor() {
    super();
    this.className = "authoring-navigation";
    this.dataset.testid = "guided-authoring-navigation-region-root";
    this.append(
      button(
        "New template",
        () => emit(this, "authoring-new"),
        "secondary",
        "guided-authoring-navigation-button-new",
      ),
      el("h2", "eyebrow", "Template drafts"),
      this.list,
      el("h2", "eyebrow", "Version history"),
      this.history,
      button(
        "Documents",
        () => emit(this, "open-documents"),
        "secondary",
        "guided-authoring-navigation-button-documents",
      ),
      button(
        "Full Settings",
        () => emit(this, "open-settings"),
        "text-button",
        "guided-authoring-navigation-button-settings",
      ),
    );
  }
  update(
    drafts: WorkingAuthoringDraft[],
    active: WorkingAuthoringDraft | null,
    mode: string,
    inspected: string,
  ): void {
    const visible = drafts
      .filter((draft) => draft.record.revision > 0 || draft.status !== "temporary")
      .sort(
        (a, b) =>
          b.record.updatedAt.localeCompare(a.record.updatedAt) ||
          a.record.id.localeCompare(b.record.id),
      );
    const key = JSON.stringify([
      visible.map((draft) => [draft.record.id, draft.record.title, draft.status, draft.origin]),
      active?.record.id,
      active?.record.checkpoints.map((item) => [item.id, item.createdAt, item.kind, item.label]),
      mode,
      inspected,
    ]);
    if (this.key === key) return;
    this.key = key;
    const focused = document.activeElement;
    const hadFocus = focused instanceof HTMLButtonElement && this.contains(focused);
    const focusedRow = hadFocus ? focused.closest<HTMLElement>("[data-draft-id]") : null;
    const draftId = focusedRow?.dataset.draftId;
    const origin = focusedRow?.dataset.storageMode;
    const checkpointId = hadFocus ? focused.dataset.checkpointId : undefined;
    const action = hadFocus ? focused.dataset.testid : undefined;
    const restoreFocus = () => {
      if (!hadFocus || focused.isConnected || !this.isConnected) return;
      const target = [...this.querySelectorAll<HTMLButtonElement>("button")].find((candidate) => {
        if (candidate.disabled) return false;
        if (checkpointId) return candidate.dataset.checkpointId === checkpointId;
        const row = candidate.closest<HTMLElement>("[data-draft-id]");
        return (
          !!draftId &&
          row?.dataset.draftId === draftId &&
          row.dataset.storageMode === origin &&
          candidate.dataset.testid === action
        );
      });
      (
        target ??
        this.querySelector<HTMLButtonElement>(
          '[data-testid="guided-authoring-navigation-button-new"]',
        )
      )?.focus({ preventScroll: true });
    };
    this.list.replaceChildren(
      ...visible.map((draft) => {
        const row = el("div", "draft-row");
        row.dataset.draftId = draft.record.id;
        row.dataset.storageMode = draft.origin;
        row.dataset.testid = "guided-authoring-navigation-list-item-draft";
        const open = button(
          draft.record.title,
          () => emit(this, "authoring-select", draft),
          "draft-open",
          "guided-authoring-navigation-button-select",
        );
        open.setAttribute("aria-current", String(draft === active));
        const rename = button(
          "Rename",
          () => emit(this, "authoring-rename", draft),
          "text-button",
          "guided-authoring-navigation-button-rename",
        );
        const remove = button(
          "Delete",
          () => emit(this, "authoring-delete", draft),
          "text-button danger",
          "guided-authoring-navigation-button-delete",
        );
        rename.disabled = remove.disabled = draft.origin !== mode;
        row.append(
          open,
          el(
            "span",
            "small muted",
            `${draft.status}${draft.origin !== mode ? ` · ${draft.origin}` : ""}`,
          ),
          el("div", "row-actions", rename, remove),
        );
        return row;
      }),
    );
    if (!visible.length) this.list.append(el("p", "small muted", "No saved template drafts."));
    this.history.replaceChildren();
    if (!active) {
      this.history.append(el("p", "small muted", "Select a template draft."));
      restoreFocus();
      return;
    }
    if (active.origin === "memory")
      this.history.append(el("p", "small muted", "History is session-only in this tab."));
    if (inspected)
      this.history.append(
        button(
          "Back to current",
          () => emit(this, "authoring-current"),
          "secondary",
          "guided-authoring-history-button-current",
        ),
      );
    for (const checkpoint of [...active.record.checkpoints].reverse()) {
      const inspect = button(
        `${checkpoint.label || (checkpoint.kind === "explicit" ? "Checkpoint" : "Pre-restore recovery")} · ${new Date(checkpoint.createdAt).toLocaleString()}`,
        () => emit(this, "authoring-inspect", checkpoint.id),
        "checkpoint",
        "guided-authoring-history-button-inspect",
      );
      inspect.dataset.checkpointId = checkpoint.id;
      inspect.setAttribute("aria-pressed", String(checkpoint.id === inspected));
      this.history.append(inspect);
    }
    if (!active.record.checkpoints.length)
      this.history.append(
        el("p", "small muted", "No checkpoints. Save now records a version when source changes."),
      );
    restoreFocus();
  }
}
customElements.define("gtl-authoring-navigation", AuthoringNavigation);
