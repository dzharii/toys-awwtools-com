/**
 * Heading panel. Shows current heading breadcrumb, nearby headings with
 * per-section reading progress, and click-to-heading navigation. A secondary
 * control jumps to the last reading segment inside a section.
 */

import { el, clearChildren } from "../utils/dom.js";

export function createHeadingPanel(actions) {
  const element = el("div", { class: "rn-section" });
  const title = el("p", { class: "rn-section-title", text: "Heading context" });
  const breadcrumb = el("div", { class: "rn-heading-path" });
  const list = el("div", { class: "rn-heading-list" });
  element.appendChild(title);
  element.appendChild(breadcrumb);
  element.appendChild(list);

  function renderBreadcrumb(path) {
    clearChildren(breadcrumb);
    if (!path || !path.length) {
      breadcrumb.appendChild(el("span", { class: "rn-crumb", text: "No current heading" }));
      return;
    }
    path.forEach((text, i) => {
      const isLast = i === path.length - 1;
      breadcrumb.appendChild(
        el("span", { class: isLast ? "rn-crumb-current" : "rn-crumb", text })
      );
      if (!isLast) breadcrumb.appendChild(document.createTextNode(" › "));
    });
  }

  function renderRow(row) {
    const jump = el("button", {
      class: "rn-heading-jump" + (row.isCurrent ? " rn-current" : ""),
      type: "button",
      title: "Jump to: " + row.text,
      onClick: () => actions.jumpToHeading(row.id),
    });
    jump.appendChild(el("span", { class: "rn-lvl", text: "H" + row.level }));
    jump.appendChild(el("span", { class: "rn-heading-text", text: row.text }));

    const bar = el("div", { class: "rn-progressbar", title: row.progressPercent + "% probably read" });
    const fill = el("i");
    fill.style.width = row.progressPercent + "%";
    bar.appendChild(fill);
    jump.appendChild(bar);

    const flags = el("span", { class: "rn-section-flags" });
    if (row.hasLastFocus) flags.appendChild(el("span", { class: "rn-dot rn-lf", title: "Last reading position in this section" }));
    if (row.hasManualMark) flags.appendChild(el("span", { class: "rn-dot rn-mk", title: "Marked spot in this section" }));

    const rowEl = el("div", { class: "rn-heading-row" }, [jump, flags]);

    if (row.hasLastFocus || row.hasReadableContent) {
      const jumpLast = el("button", {
        class: "rn-iconbtn",
        type: "button",
        text: "⤓",
        title: "Jump to last read spot in this section",
        style: { color: "var(--rn-muted)" },
        onClick: (e) => {
          e.stopPropagation();
          actions.jumpToLastInSection(row.id);
        },
      });
      rowEl.appendChild(jumpLast);
    }
    return rowEl;
  }

  function update(vm) {
    const ctx = vm.headingContext || {};
    renderBreadcrumb(ctx.path);
    clearChildren(list);
    if (!ctx.rows || !ctx.rows.length) {
      list.appendChild(el("div", { class: "rn-empty-state", text: ctx.emptyMessage || "No headings found on this page." }));
      return;
    }
    for (const row of ctx.rows) {
      list.appendChild(renderRow(row));
    }
  }

  return { element, update };
}
