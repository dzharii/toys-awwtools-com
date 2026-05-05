// RetroOS UI v001 editable vendored framework source.
// This file may be changed inside this repository, but changes should remain
// generic, reusable, and suitable to merge back into the standalone RetroOS UI
// framework. Do not add this browser extension's feature-specific business
// logic here. Put project-specific integration in an adapter or bridge layer
// outside src/vendor/retroos-ui-v001/.
//
// storybook.js — Component Storybook for RetroOS UI v001
//
// PURPOSE:
//   Developer and agent reference for every component in the framework.
//   Organized into categories (Primitive / Compound / Shell / …), each entry
//   documents the component's purpose, attributes, events, slots, CSS parts,
//   and live renderable examples. Use this file to:
//     • Discover whether the framework has a component that meets your need.
//     • Understand the full API before writing integration code.
//     • See rendered examples of every attribute variant.
//
// HOW TO READ STORIES:
//   - `category` field: indicates reuse level and composition.
//   - `description`: what the component does and when to reach for it.
//   - `usage`: the most important integration note.
//   - `attrs`: all observed HTML attributes (name → {type, default, desc}).
//   - `events`: custom events fired by the component.
//   - `slots`: named slots for injecting content into shadow DOM.
//   - `parts`: CSS ::part() targets for fine-grained style overrides.
//   - `examples`: live HTML strings — each is rendered directly in the page.

import { registerAllComponents } from "../components/register-all.js";
import { TAGS } from "../core/constants.js";
import { showToast } from "../components/toast.js";
import { iconSvg, ICON_NAMES } from "../icons/retro-icons.js";

registerAllComponents();

// ── Helpers ─────────────────────────────────────────────────────────────────

function esc(html) {
  return String(html)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tag(name) {
  return `awwbookmarklet-${name}`;
}

// ── Story data ───────────────────────────────────────────────────────────────

// Category badge type: "primitive" | "compound" | "shell" | "overlay" | "feedback" | "utility"
// Each story object:
// {
//   id: string                          — used as URL hash target
//   name: string                        — display name
//   tag: string                         — custom element tag
//   category: string                    — badge label
//   description: string                 — what it does (1–3 sentences)
//   usage: string                       — most important integration note
//   attrs: [{name, type, default?, values?, desc}]
//   events: [{name, desc}]
//   slots: [{name, desc}]  — use "" for default slot
//   parts: [{name, desc}]
//   examples: [{label, html, layout?, note?}]
//     layout: "row" (default) | "block" | "col"
// }

const CATEGORIES = [
  {
    id: "primitives",
    label: "Primitive Controls",
    stories: [

      // ── Button ──────────────────────────────────────────────────────────
      {
        id: "button",
        name: "Button",
        tag: tag("button"),
        category: "primitive",
        description: "A pressable control that fires a native click event and optionally dispatches a command request. Covers all use cases that a plain HTML button covers — form submission, dialog actions, toolbar actions — while staying themed by framework tokens.",
        usage: "Compose inside `awwbookmarklet-toolbar` or dialog footer slots. Use `variant='primary'` for the one dominant action per surface. Use `tone` only when semantic meaning (danger, warning, success) helps the user.",
        attrs: [
          { name: "variant", type: "string", default: "(default)", values: "primary | ghost | link", desc: "Visual weight. `primary` = filled; `ghost` = borderless; `link` = text-style." },
          { name: "tone", type: "string", values: "danger | warning | success", desc: "Semantic tint on the default variant. Affects border and text color." },
          { name: "disabled", type: "boolean", desc: "Prevents interaction and dims the control." },
          { name: "busy", type: "boolean", desc: "Shows progress cursor; suppresses clicks until cleared." },
          { name: "pressed", type: "boolean", desc: "Toggles aria-pressed and sunken-button visual state for toggle buttons." },
          { name: "command", type: "string", desc: "When set, clicking dispatches `awwbookmarklet-command-request` with this command ID bubbling up to a command registry listener." }
        ],
        events: [
          { name: "click", desc: "Native click re-dispatched as bubbling + composed. Blocked when disabled or busy." },
          { name: "awwbookmarklet-command-request", desc: "Bubbles when `command` attribute is set. `detail: { commandId, source }`." }
        ],
        slots: [{ name: "", desc: "Button label content (text or icon+text)." }],
        parts: [{ name: "control", desc: "The inner `<button>` element for padding/radius overrides." }],
        examples: [
          {
            label: "Variants",
            html: `<${tag("button")} variant="primary">Primary</${tag("button")}><${tag("button")}>Default</${tag("button")}><${tag("button")} variant="ghost">Ghost</${tag("button")}><${tag("button")} variant="link">Link</${tag("button")}>`
          },
          {
            label: "Tones",
            html: `<${tag("button")} tone="danger">Danger</${tag("button")}><${tag("button")} tone="warning">Warning</${tag("button")}><${tag("button")} tone="success">Success</${tag("button")}>`
          },
          {
            label: "States",
            html: `<${tag("button")} disabled>Disabled</${tag("button")}><${tag("button")} busy>Busy…</${tag("button")}><${tag("button")} pressed>Pressed</${tag("button")}>`
          }
        ]
      },

      // ── Icon Button ──────────────────────────────────────────────────────
      {
        id: "icon-button",
        name: "Icon Button",
        tag: tag("icon-button"),
        category: "primitive",
        description: "A square icon-only button with an accessible label. Used in toolbars, titlebars, and browser toolbars. The inner SVG content is provided via slot; the `label` attribute becomes the aria-label.",
        usage: "Always provide `label` — it is the accessible name. Do not use icon buttons where a labelled text button is more appropriate. Use `pressed` for toggle actions (e.g., bold, fullscreen).",
        attrs: [
          { name: "label", type: "string", desc: "(required) Accessible label announced by screen readers." },
          { name: "disabled", type: "boolean", desc: "Prevents interaction." },
          { name: "pressed", type: "boolean", desc: "Toggles pressed/depressed visual state for toggles." },
          { name: "command", type: "string", desc: "Dispatches `awwbookmarklet-command-request` on click." }
        ],
        events: [
          { name: "click", desc: "Bubbling click. Blocked when disabled." },
          { name: "awwbookmarklet-command-request", desc: "Fires when `command` attribute is set." }
        ],
        slots: [{ name: "", desc: "SVG icon or icon component." }],
        parts: [{ name: "control", desc: "The inner `<button>` element." }],
        examples: [
          {
            label: "Default, pressed, disabled",
            html: `<${tag("icon-button")} label="Refresh">${iconSvg("refresh")}</${tag("icon-button")}><${tag("icon-button")} label="Star" pressed>${iconSvg("star")}</${tag("icon-button")}><${tag("icon-button")} label="Close" disabled>${iconSvg("close")}</${tag("icon-button")}>`
          }
        ]
      },

      // ── Input ────────────────────────────────────────────────────────────
      {
        id: "input",
        name: "Input",
        tag: tag("input"),
        category: "primitive",
        description: "A single-line text input. Wraps a native `<input>` in Shadow DOM so it inherits framework tokens (height, border, padding, colors). Mirrors most native input attributes. Use `wide` to fill a field container.",
        usage: "Always wrap in `awwbookmarklet-field` when you need a visible label. Read `value` from the component property or listen to `input`/`change` events. Use `type='number'` or `type='password'` as with native inputs.",
        attrs: [
          { name: "value", type: "string", desc: "Current field value." },
          { name: "placeholder", type: "string", desc: "Placeholder text." },
          { name: "type", type: "string", default: "text", desc: "Any native input type (text, number, password, email, url, etc.)." },
          { name: "disabled", type: "boolean", desc: "Disables the control." },
          { name: "required", type: "boolean", desc: "Marks the field as required." },
          { name: "wide", type: "boolean", desc: "Switches to block display, fills parent width." },
          { name: "maxlength", type: "number", desc: "Maximum character count." },
          { name: "minlength", type: "number", desc: "Minimum character count." },
          { name: "min", type: "string", desc: "Minimum value (for numeric/date types)." },
          { name: "max", type: "string", desc: "Maximum value." },
          { name: "step", type: "string", desc: "Step increment (for numeric types)." },
          { name: "autocomplete", type: "string", desc: "Passed through to native input." },
          { name: "list", type: "string", desc: "ID of a `<datalist>` element for suggestions." }
        ],
        events: [
          { name: "input", desc: "Fires on every keystroke (value change). Bubbling + composed." },
          { name: "change", desc: "Fires on blur/commit. Bubbling + composed." }
        ],
        slots: [],
        parts: [{ name: "control", desc: "The inner `<input>` element." }],
        examples: [
          {
            label: "Text and placeholder",
            html: `<${tag("input")} value="hello" /><${tag("input")} placeholder="Enter URL…" type="url" />`
          },
          {
            label: "Number and disabled",
            html: `<${tag("input")} type="number" value="42" min="0" max="100" /><${tag("input")} value="read-only" disabled />`
          },
          {
            label: "Wide (fill container)",
            layout: "block",
            html: `<${tag("input")} wide placeholder="Full-width input…" />`
          }
        ]
      },

      // ── Textarea ─────────────────────────────────────────────────────────
      {
        id: "textarea",
        name: "Textarea",
        tag: tag("textarea"),
        category: "primitive",
        description: "A multi-line text input. Mirrors native `<textarea>` attributes. Use `rows` to control visible height. Use `wide` to fill its container.",
        usage: "Pair with `awwbookmarklet-field` for labels. The `value` property reflects the current content; listen to `input` events for live changes.",
        attrs: [
          { name: "value", type: "string", desc: "Current text content." },
          { name: "placeholder", type: "string", desc: "Placeholder text." },
          { name: "rows", type: "number", default: "3", desc: "Visible row count." },
          { name: "disabled", type: "boolean", desc: "Disables the control." },
          { name: "required", type: "boolean", desc: "Marks field as required." },
          { name: "wide", type: "boolean", desc: "Block display, fills parent width." },
          { name: "maxlength", type: "number", desc: "Maximum character count." },
          { name: "minlength", type: "number", desc: "Minimum character count." }
        ],
        events: [
          { name: "input", desc: "Fires on every keystroke." },
          { name: "change", desc: "Fires on blur/commit." }
        ],
        slots: [],
        parts: [{ name: "control", desc: "The inner `<textarea>` element." }],
        examples: [
          {
            label: "Basic",
            html: `<${tag("textarea")} rows="3" placeholder="Enter notes…" />`
          },
          {
            label: "Wide + pre-filled",
            layout: "block",
            html: `<${tag("textarea")} wide rows="4" value="Multi-line\ncontent here" />`
          }
        ]
      },

      // ── Select ───────────────────────────────────────────────────────────
      {
        id: "select",
        name: "Select",
        tag: tag("select"),
        category: "primitive",
        description: "A styled dropdown select. Options are provided as child `<option>` elements (light DOM) — the component uses a MutationObserver to keep them in sync with the shadow `<select>`. Use `wide` to fill the container.",
        usage: "Listen for `change` events (not `input`) to detect selection. Reading `value` from the component property returns the selected option's value. Provide `<option>` children directly inside the element.",
        attrs: [
          { name: "value", type: "string", desc: "Currently selected value." },
          { name: "disabled", type: "boolean", desc: "Disables the dropdown." },
          { name: "required", type: "boolean", desc: "Marks field as required." },
          { name: "wide", type: "boolean", desc: "Block display, fills parent width." },
          { name: "name", type: "string", desc: "Field name for form submission." }
        ],
        events: [
          { name: "change", desc: "Fires when selection changes. Bubbling + composed." }
        ],
        slots: [],
        parts: [{ name: "control", desc: "The inner `<select>` element." }],
        examples: [
          {
            label: "Basic dropdown",
            html: `<${tag("select")}><option>Preview</option><option>Capture</option><option>Export</option></${tag("select")}>`
          },
          {
            label: "Wide + disabled",
            layout: "block",
            html: `<${tag("select")} wide disabled><option>Disabled option</option></${tag("select")}>`
          }
        ]
      },

      // ── Checkbox ─────────────────────────────────────────────────────────
      {
        id: "checkbox",
        name: "Checkbox",
        tag: tag("checkbox"),
        category: "primitive",
        description: "A styled checkbox with an inline label. The label text is slotted inside the element. Mirrors native `checked`, `disabled`, `name`, `value` attributes.",
        usage: "Use the `checked` attribute/property to control state programmatically. Listen to `change` events. For groups of checkboxes, wrap in `awwbookmarklet-group`.",
        attrs: [
          { name: "checked", type: "boolean", desc: "Checked state." },
          { name: "disabled", type: "boolean", desc: "Disables the control." },
          { name: "name", type: "string", desc: "Field name for form grouping." },
          { name: "value", type: "string", default: "on", desc: "Submitted value when checked." }
        ],
        events: [{ name: "change", desc: "Fires on check/uncheck. Bubbling + composed." }],
        slots: [{ name: "", desc: "Label text or content." }],
        parts: [{ name: "control", desc: "The inner `<input type='checkbox'>`." }, { name: "label", desc: "The label text span." }],
        examples: [
          {
            label: "Checked, unchecked, disabled",
            html: `<${tag("checkbox")} checked>Capture metadata</${tag("checkbox")}><${tag("checkbox")}>Include timestamps</${tag("checkbox")}><${tag("checkbox")} disabled>Unavailable option</${tag("checkbox")}>`
          }
        ]
      },

      // ── Radio ────────────────────────────────────────────────────────────
      {
        id: "radio",
        name: "Radio",
        tag: tag("radio"),
        category: "primitive",
        description: "A styled radio button with an inline label. Same API as `awwbookmarklet-checkbox` but renders as a radio input. Group multiple radios by giving them the same `name` attribute.",
        usage: "Give all options in a group the same `name`. Listen to `change` events on each radio or delegate to a parent element. Use `awwbookmarklet-group` to visually wrap the group.",
        attrs: [
          { name: "checked", type: "boolean", desc: "Selected state." },
          { name: "disabled", type: "boolean", desc: "Disables this radio." },
          { name: "name", type: "string", desc: "(required) Group name — must match across all options." },
          { name: "value", type: "string", desc: "The value associated with this option." }
        ],
        events: [{ name: "change", desc: "Fires when this radio is selected." }],
        slots: [{ name: "", desc: "Label text." }],
        parts: [{ name: "control", desc: "The inner `<input type='radio'>`." }, { name: "label", desc: "The label text span." }],
        examples: [
          {
            label: "Radio group",
            layout: "col",
            html: `<${tag("radio")} name="mode" value="visible" checked>Visible viewport</${tag("radio")}><${tag("radio")} name="mode" value="full">Full page</${tag("radio")}><${tag("radio")} name="mode" value="selection">Selection only</${tag("radio")}>`
          }
        ]
      },

      // ── Range ────────────────────────────────────────────────────────────
      {
        id: "range",
        name: "Range",
        tag: tag("range"),
        category: "primitive",
        description: "A slider control for numeric ranges. Wraps a native `<input type='range'>` with framework accent color applied. Use `min`, `max`, `step` for constraint.",
        usage: "Listen to `input` for live updates as the user drags. Listen to `change` for the committed value. Pair with a value readout `<span>` updated via JS.",
        attrs: [
          { name: "value", type: "string", desc: "Current numeric value as string." },
          { name: "min", type: "string", default: "0", desc: "Minimum value." },
          { name: "max", type: "string", default: "100", desc: "Maximum value." },
          { name: "step", type: "string", default: "1", desc: "Step increment." },
          { name: "disabled", type: "boolean", desc: "Disables the slider." },
          { name: "name", type: "string", desc: "Field name." }
        ],
        events: [
          { name: "input", desc: "Fires on every drag move." },
          { name: "change", desc: "Fires on release/commit." }
        ],
        slots: [],
        parts: [{ name: "control", desc: "The inner `<input type='range'>`." }],
        examples: [
          {
            label: "Basic range",
            layout: "block",
            html: `<${tag("range")} value="60" min="0" max="100" />`
          }
        ]
      },

      // ── Progress ─────────────────────────────────────────────────────────
      {
        id: "progress",
        name: "Progress",
        tag: tag("progress"),
        category: "primitive",
        description: "A progress bar component. Wraps a native `<progress>` element with framework styling. Use for determinate (with `value`/`max`) or indeterminate (without `value`) progress.",
        usage: "For short operations, show the bar inline. For longer background work, show inside a dialog or status bar. Use `value` and `max` attributes to reflect completion percentage.",
        attrs: [
          { name: "value", type: "number", desc: "Current progress value. Omit for indeterminate." },
          { name: "max", type: "number", default: "100", desc: "Total value representing 100% completion." }
        ],
        events: [],
        slots: [],
        parts: [{ name: "control", desc: "The inner `<progress>` element." }],
        examples: [
          {
            label: "Determinate and indeterminate",
            layout: "col",
            html: `<${tag("progress")} value="68" max="100"></${tag("progress")}><${tag("progress")}></${tag("progress")}>`
          }
        ]
      }
    ]
  },

  // ── Form Composition ───────────────────────────────────────────────────────
  {
    id: "form",
    label: "Form Composition",
    stories: [

      // ── Field ────────────────────────────────────────────────────────────
      {
        id: "field",
        name: "Field",
        tag: tag("field"),
        category: "compound",
        description: "A form field wrapper that pairs a label with any control component. Manages aria-labelledby, aria-describedby, aria-invalid, required/disabled propagation automatically. Supports vertical (default), horizontal, and inline layout orientations. The message row (help/error text) is hidden by default and only takes space when content is active.",
        usage: "Place any `awwbookmarklet-*` control or native input as the default slot child. Use `label` attribute for the text label, `help` for description, `error` to show validation messages. Add `wide` to both the field and the inner control to fill the container.",
        attrs: [
          { name: "label", type: "string", desc: "Label text (rendered in a `<label>` element)." },
          { name: "help", type: "string", desc: "Hint text shown below the control." },
          { name: "error", type: "string", desc: "Validation error message. Sets `aria-invalid` on the slotted control." },
          { name: "required", type: "boolean", desc: "Appends ` *` to label; mirrors `required` to slotted control." },
          { name: "disabled", type: "boolean", desc: "Dims field and mirrors `disabled` to slotted control." },
          { name: "orientation", type: "string", default: "vertical", values: "vertical | horizontal | inline", desc: "Layout of label vs control. `horizontal` uses a two-column grid; `inline` uses flex." },
          { name: "wide", type: "boolean", desc: "Block display, fills container width." },
          { name: "tone", type: "string", values: "info | success | warning | danger", desc: "Manual tone override (independent of `error`)." }
        ],
        events: [],
        slots: [
          { name: "", desc: "The main control (input, select, etc.)." },
          { name: "label", desc: "Override for label content (rich HTML labels)." },
          { name: "prefix", desc: "Content placed before the control in the control row." },
          { name: "suffix", desc: "Content placed after the control in the control row." },
          { name: "actions", desc: "Action buttons aligned to the far right of the control row." },
          { name: "help", desc: "Rich HTML help content (alternative to `help` attribute)." },
          { name: "error", desc: "Rich HTML error content (alternative to `error` attribute)." }
        ],
        parts: [
          { name: "field", desc: "The outer `<label>` element." },
          { name: "label", desc: "The label text span." },
          { name: "main", desc: "Grid wrapping control-row + message." },
          { name: "control-row", desc: "Flex row containing prefix, control, suffix, actions." },
          { name: "message", desc: "Help/error message container." }
        ],
        examples: [
          {
            label: "Vertical (default) with help text",
            layout: "block",
            html: `<${tag("field")} label="Page title" help="Used as the exported filename."><${tag("input")} wide value="Research notes" /></${tag("field")}>`
          },
          {
            label: "With error message",
            layout: "block",
            html: `<${tag("field")} label="Timeout (seconds)" error="Value must be between 1 and 60."><${tag("input")} wide type="number" value="120" /></${tag("field")}>`
          },
          {
            label: "Horizontal orientation",
            layout: "block",
            html: `<${tag("field")} label="Capture mode" orientation="horizontal" wide><${tag("select")} wide><option>Visible viewport</option><option>Full page</option></${tag("select")}></${tag("field")}><${tag("field")} label="URL" orientation="horizontal" wide><${tag("input")} wide placeholder="https://…" /></${tag("field")}>`
          },
          {
            label: "Required + disabled",
            layout: "block",
            html: `<${tag("field")} label="Export name" required wide><${tag("input")} wide value="session_2026" /></${tag("field")}><${tag("field")} label="System path" disabled wide><${tag("input")} wide value="/tmp/exports" /></${tag("field")}>`
          }
        ]
      },

      // ── Group ─────────────────────────────────────────────────────────────
      {
        id: "group",
        name: "Group",
        tag: tag("group"),
        category: "compound",
        description: "A visual grouping container for related form fields or controls. Renders a titled section box with optional border and spacing. Use to organise a form into logical sections (e.g., 'Capture options', 'Export settings').",
        usage: "Place `awwbookmarklet-field` elements or any content inside. Set `label` for the group heading. Nest groups sparingly — one level of nesting is usually enough.",
        attrs: [
          { name: "label", type: "string", desc: "Section heading text." }
        ],
        events: [],
        slots: [
          { name: "", desc: "Fields and controls inside the group." },
          { name: "title", desc: "Rich HTML group title (alternative to `label` attribute)." }
        ],
        parts: [
          { name: "group", desc: "The outer element." },
          { name: "title", desc: "The heading element." },
          { name: "body", desc: "The content area." }
        ],
        examples: [
          {
            label: "Group with fields",
            layout: "block",
            html: `<${tag("group")} label="Capture settings"><${tag("field")} label="Mode"><${tag("select")}><option>Visible viewport</option><option>Full page</option></${tag("select")}></${tag("field")}><${tag("field")} label="Include images"><${tag("checkbox")} checked>Yes</${tag("checkbox")}></${tag("field")}></${tag("group")}>`
          }
        ]
      }
    ]
  },

  // ── Feedback & Status ──────────────────────────────────────────────────────
  {
    id: "feedback",
    label: "Feedback & Status",
    stories: [

      // ── Alert ────────────────────────────────────────────────────────────
      {
        id: "alert",
        name: "Alert",
        tag: tag("alert"),
        category: "feedback",
        description: "An inline feedback banner for info, success, warning, or danger messages. Visible by default (`open` attribute set on connect). Supports optional dismiss button and a slot for action buttons.",
        usage: "Use `tone` to match the severity. Use `dismissible` to let the user clear transient messages. Listen to `awwbookmarklet-alert-dismiss` if you need to react when dismissed (e.g., re-enable a button).",
        attrs: [
          { name: "tone", type: "string", default: "info", values: "info | success | warning | danger", desc: "Color and semantic tone of the alert." },
          { name: "title", type: "string", desc: "Bold heading text shown above the message." },
          { name: "dismissible", type: "boolean", desc: "Shows an × close button." },
          { name: "open", type: "boolean", default: "true", desc: "Visibility. Auto-set to `open` on `connectedCallback`. Remove to hide." },
          { name: "compact", type: "boolean", desc: "Reduces internal padding." }
        ],
        events: [
          { name: "awwbookmarklet-alert-dismiss", desc: "Dispatched (cancelable) when dismiss button is clicked. Prevent default to keep the alert open." }
        ],
        slots: [
          { name: "", desc: "Message body text or rich HTML." },
          { name: "title", desc: "Rich HTML title override." },
          { name: "icon", desc: "Custom icon override." },
          { name: "actions", desc: "Inline buttons below the message." }
        ],
        parts: [
          { name: "alert", desc: "The outer container." },
          { name: "icon", desc: "Tone indicator icon area." },
          { name: "content", desc: "Title + message + actions wrapper." },
          { name: "title", desc: "Heading element." },
          { name: "message", desc: "Body text container." },
          { name: "close-button", desc: "The dismiss button." }
        ],
        examples: [
          {
            label: "All tones",
            layout: "col",
            html: `<${tag("alert")} tone="info" title="Note">Preview mode is active.</${tag("alert")}><${tag("alert")} tone="success" title="Exported">34 blocks written to /exports.</${tag("alert")}><${tag("alert")} tone="warning" title="Draft restored">A previous draft was restored.</${tag("alert")}><${tag("alert")} tone="danger" title="Upload failed">Policy blocked the request.</${tag("alert")}>`
          },
          {
            label: "Dismissible",
            layout: "block",
            html: `<${tag("alert")} tone="info" title="Tip" dismissible>Select content on the page before capturing.</${tag("alert")}>`
          }
        ]
      },

      // ── Status Line ───────────────────────────────────────────────────────
      {
        id: "status-line",
        name: "Status Line",
        tag: tag("status-line"),
        category: "feedback",
        description: "A compact single-line status message with a leading tone indicator. Lighter-weight than `awwbookmarklet-alert` — no title, no actions, no dismiss. Good for inline form feedback, panel footers, or status summaries.",
        usage: "Use inside panels, dialogs, or list items where a full alert would be too heavy. Prefer `alert` when the message needs a title or action buttons.",
        attrs: [
          { name: "tone", type: "string", default: "info", values: "info | success | warning | danger | neutral", desc: "Semantic color tone." }
        ],
        events: [],
        slots: [{ name: "", desc: "Status message text." }],
        parts: [{ name: "line", desc: "The outer container." }],
        examples: [
          {
            label: "All tones",
            layout: "col",
            html: `<${tag("status-line")} tone="info">Preview available</${tag("status-line")}><${tag("status-line")} tone="success">Export completed</${tag("status-line")}><${tag("status-line")} tone="warning">Connection unstable</${tag("status-line")}><${tag("status-line")} tone="danger">Permission denied</${tag("status-line")}><${tag("status-line")} tone="neutral">Idle</${tag("status-line")}>`
          }
        ]
      },

      // ── Toast / showToast ─────────────────────────────────────────────────
      {
        id: "toast",
        name: "Toast / showToast()",
        tag: tag("toast"),
        category: "feedback",
        description: "A non-blocking notification that appears in the bottom-right corner and auto-dismisses. The recommended way to show toasts is via the exported `showToast()` function rather than creating elements manually. `showToast` manages a per-key singleton (updating an existing toast instead of stacking duplicates).",
        usage: "Import `showToast` from the framework bundle. Call `showToast({ message, tone, timeout, key })`. Use `key` to avoid duplicate toast stacks for the same event category. Hovering the toast pauses the auto-dismiss timer.",
        attrs: [
          { name: "tone", type: "string", default: "info", values: "info | success | warning | danger", desc: "Color and semantic tone." },
          { name: "timeout", type: "number", default: "2800", desc: "Auto-dismiss delay in milliseconds. Set to 0 to disable auto-dismiss." }
        ],
        events: [],
        slots: [{ name: "", desc: "Toast message content." }],
        parts: [{ name: "toast", desc: "The outer container." }],
        examples: [
          {
            label: "Trigger toasts via showToast()",
            note: "Click the buttons to see toasts appear in the corner",
            layout: "row",
            html: `<button class="sb-demo-toast" data-tone="info" data-msg="Preview loaded">Info toast</button><button class="sb-demo-toast" data-tone="success" data-msg="Export completed">Success toast</button><button class="sb-demo-toast" data-tone="warning" data-msg="Draft restored">Warning toast</button><button class="sb-demo-toast" data-tone="danger" data-msg="Upload failed">Danger toast</button>`
          }
        ]
      },

      // ── Empty State ───────────────────────────────────────────────────────
      {
        id: "empty-state",
        name: "Empty State",
        tag: tag("empty-state"),
        category: "feedback",
        description: "A centred placeholder shown when a content area has no items. Accepts an icon, a heading, supporting text, and an optional action button. Use to communicate zero-data conditions rather than leaving a blank surface.",
        usage: "Show inside list areas, panels, or tab panels when there is nothing to display. Pair with a call-to-action button in the `actions` slot.",
        attrs: [
          { name: "icon", type: "string", desc: "Icon name from the icon set (displayed as SVG)." },
          { name: "title", type: "string", desc: "Primary heading text." }
        ],
        events: [],
        slots: [
          { name: "", desc: "Supporting description text." },
          { name: "actions", desc: "Call-to-action buttons." }
        ],
        parts: [{ name: "empty", desc: "The container element." }],
        examples: [
          {
            label: "No captures yet",
            layout: "block",
            html: `<${tag("empty-state")} icon="noResults" title="No captures yet">Start by selecting content on the page.</${tag("empty-state")}>`
          }
        ]
      },

      // ── State Overlay ─────────────────────────────────────────────────────
      {
        id: "state-overlay",
        name: "State Overlay",
        tag: tag("state-overlay"),
        category: "feedback",
        description: "An overlay layer that sits on top of a content area to show loading spinners, error states, or blocked-content messages without removing the underlying DOM. Useful when content takes time to load or is temporarily unavailable.",
        usage: "Wrap the target content in a `position: relative` container, then place `awwbookmarklet-state-overlay` as a sibling. Use `tone` and `title` to describe the state.",
        attrs: [
          { name: "active", type: "boolean", desc: "Shows the overlay when present." },
          { name: "tone", type: "string", default: "info", values: "info | warning | danger | neutral", desc: "Visual tone of the overlay message." },
          { name: "title", type: "string", desc: "Heading text in the overlay." }
        ],
        events: [],
        slots: [
          { name: "", desc: "Description or action content shown in the overlay." }
        ],
        parts: [{ name: "overlay", desc: "The positioned overlay container." }],
        examples: [
          {
            label: "Loading and error overlays",
            layout: "col",
            html: `<${tag("state-overlay")} active tone="info" title="Loading…">Fetching content from the page.</${tag("state-overlay")}><${tag("state-overlay")} active tone="danger" title="Access blocked">The frame refused to load.</${tag("state-overlay")}>`
          }
        ]
      }
    ]
  },

  // ── Layout & Navigation ───────────────────────────────────────────────────
  {
    id: "layout",
    label: "Layout & Navigation",
    stories: [

      // ── Panel ─────────────────────────────────────────────────────────────
      {
        id: "panel",
        name: "Panel",
        tag: tag("panel"),
        category: "compound",
        description: "A content surface with optional title, subtitle, action buttons, and footer. The header row appears only when at least one of `title`, `subtitle`, or `actions` slots have content. The footer row appears only when the `footer` slot has content.",
        usage: "Use as the primary content container inside windows and dialogs. Group related fields and controls inside panels for visual separation. Stack multiple panels vertically inside an app shell.",
        attrs: [],
        events: [],
        slots: [
          { name: "", desc: "Body content (fields, lists, etc.)." },
          { name: "title", desc: "Panel heading text." },
          { name: "subtitle", desc: "Secondary heading text." },
          { name: "actions", desc: "Action buttons aligned to the right of the header." },
          { name: "footer", desc: "Footer content below the body." }
        ],
        parts: [
          { name: "panel", desc: "The outer `<section>`." },
          { name: "header", desc: "Title row." },
          { name: "heading", desc: "Title + subtitle wrapper." },
          { name: "title", desc: "Title element." },
          { name: "subtitle", desc: "Subtitle element." },
          { name: "body", desc: "Content area." },
          { name: "footer", desc: "Footer area." }
        ],
        examples: [
          {
            label: "Panel with title and body",
            layout: "block",
            html: `<${tag("panel")}><span slot="title">Capture settings</span><${tag("field")} label="Mode"><${tag("select")}><option>Visible viewport</option><option>Full page</option></${tag("select")}></${tag("field")}><${tag("field")} label="Include images"><${tag("checkbox")} checked>Yes</${tag("checkbox")}></${tag("field")}></${tag("panel")}>`
          },
          {
            label: "Panel with actions + footer",
            layout: "block",
            html: `<${tag("panel")}><span slot="title">Results</span><${tag("button")} slot="actions" variant="ghost">Refresh</${tag("button")}><p style="margin:0;color:var(--awwbookmarklet-text-muted,#586272)">3 items found</p><${tag("status-line")} slot="footer" tone="success">All captures valid</${tag("status-line")}></${tag("panel")}>`
          }
        ]
      },

      // ── Tabs ──────────────────────────────────────────────────────────────
      {
        id: "tabs",
        name: "Tabs + Tab Panel",
        tag: `${tag("tabs")} / ${tag("tab-panel")}`,
        category: "compound",
        description: "A tab bar for switching between named content panels. `awwbookmarklet-tabs` is the container; each `awwbookmarklet-tab-panel` child provides `label` (tab button text) and `selected` (initially active tab). Keyboard-navigable (Arrow Left/Right, Home, End).",
        usage: "Place `awwbookmarklet-tab-panel` elements as direct children of `awwbookmarklet-tabs`. Set `selected` on the initially active panel. The component observes child mutations — add/remove panels dynamically and the tab list updates.",
        attrs: [
          { name: "— on awwbookmarklet-tab-panel —", type: "", desc: "" },
          { name: "label", type: "string", desc: "Text shown in the tab button." },
          { name: "selected", type: "boolean", desc: "Marks this panel as the initially active tab." }
        ],
        events: [],
        slots: [
          { name: "— on awwbookmarklet-tab-panel —", desc: "" },
          { name: "", desc: "Content of this tab panel." }
        ],
        parts: [
          { name: "tablist", desc: "The tab button row." },
          { name: "panels", desc: "The panel area." }
        ],
        examples: [
          {
            label: "Three tabs",
            layout: "block",
            html: `<${tag("tabs")}><${tag("tab-panel")} label="Preview" selected><p style="margin:0">Preview content goes here.</p></${tag("tab-panel")}><${tag("tab-panel")} label="Metadata"><p style="margin:0">Page title, URL, timestamp.</p></${tag("tab-panel")}><${tag("tab-panel")} label="Log"><p style="margin:0">Capture events and errors.</p></${tag("tab-panel")}></${tag("tabs")}>`
          }
        ]
      },

      // ── Toolbar ───────────────────────────────────────────────────────────
      {
        id: "toolbar",
        name: "Toolbar",
        tag: tag("toolbar"),
        category: "compound",
        description: "A horizontal strip for grouping action buttons, icon buttons, and controls. Supports `wrap` (allow line-wrapping) and `align` (end-aligns the content). Often placed in a window's `toolbar` slot or a dialog's footer slot.",
        usage: "Put `awwbookmarklet-button` and `awwbookmarklet-icon-button` elements inside. Use `align='end'` in dialog footers to right-align action buttons. Use `wrap` in wider toolbars that may overflow on small viewports.",
        attrs: [
          { name: "wrap", type: "boolean", desc: "Allows toolbar content to wrap to a second line." },
          { name: "align", type: "string", values: "start | end", desc: "Aligns content. `end` right-aligns buttons (useful for dialog footers)." }
        ],
        events: [],
        slots: [{ name: "", desc: "Buttons and controls." }],
        parts: [{ name: "bar", desc: "The inner flex container." }],
        examples: [
          {
            label: "Toolbar with buttons",
            html: `<${tag("toolbar")}><${tag("button")} variant="primary">Save</${tag("button")}><${tag("button")}>Preview</${tag("button")}><${tag("icon-button")} label="Refresh">${iconSvg("refresh")}</${tag("icon-button")}></${tag("toolbar")}>`
          },
          {
            label: "Right-aligned footer toolbar",
            html: `<${tag("toolbar")} align="end"><${tag("button")}>Cancel</${tag("button")}><${tag("button")} variant="primary">Confirm</${tag("button")}></${tag("toolbar")}>`
          }
        ]
      },

      // ── List ──────────────────────────────────────────────────────────────
      {
        id: "list",
        name: "List + List Item",
        tag: `${tag("list")} / ${tag("list-item")}`,
        category: "compound",
        description: "`awwbookmarklet-list` is a container for a vertical list of `awwbookmarklet-list-item` rows. Each item can have a leading icon, primary text, secondary text, and trailing actions. Used for result lists, activity logs, and settings entries.",
        usage: "Use `awwbookmarklet-list-item` children for structured rows. For a simple un-styled list, use plain HTML `<ul>` instead. Use `selected` on an item to highlight the active entry.",
        attrs: [
          { name: "— on awwbookmarklet-list-item —", type: "", desc: "" },
          { name: "selected", type: "boolean", desc: "Highlights this row as the active/selected item." },
          { name: "disabled", type: "boolean", desc: "Dims and prevents interaction on the row." }
        ],
        events: [],
        slots: [
          { name: "— on awwbookmarklet-list-item —", desc: "" },
          { name: "", desc: "Primary row content (text)." },
          { name: "start", desc: "Leading content (icon or avatar)." },
          { name: "end", desc: "Trailing content (actions or metadata)." },
          { name: "secondary", desc: "Secondary text line below the primary." }
        ],
        parts: [],
        examples: [
          {
            label: "Basic list",
            layout: "block",
            html: `<${tag("list")}><${tag("list-item")} selected><span slot="start">${iconSvg("capture")}</span>Session Capture Console<span slot="secondary">Last opened 2m ago</span></${tag("list-item")}><${tag("list-item")}><span slot="start">${iconSvg("bookmark")}</span>Bookmark Manager<span slot="secondary">34 bookmarks</span></${tag("list-item")}><${tag("list-item")} disabled><span slot="start">${iconSvg("blocked")}</span>Screenshot Tool (unavailable)</${tag("list-item")}></${tag("list")}>`
          }
        ]
      },

      // ── Card ──────────────────────────────────────────────────────────────
      {
        id: "card",
        name: "Card",
        tag: tag("card"),
        category: "compound",
        description: "A bordered surface for displaying structured item data — title, metadata, and optional selection. Use in grid or list layouts to represent selectable content items, search results, or settings categories.",
        usage: "Use `selected` to highlight the active item. For a group of selectable cards, manage selection state in parent JS and toggle `selected` on the chosen card.",
        attrs: [
          { name: "selected", type: "boolean", desc: "Highlights the card as the selected/active item." }
        ],
        events: [],
        slots: [
          { name: "", desc: "Card body content." },
          { name: "title", desc: "Card heading." },
          { name: "meta", desc: "Secondary metadata (date, type, etc.)." },
          { name: "actions", desc: "Action buttons shown on the card." }
        ],
        parts: [{ name: "card", desc: "The outer container." }],
        examples: [
          {
            label: "Cards (one selected)",
            layout: "col",
            html: `<${tag("card")} selected><span slot="title">Research notes 2026-04</span><span slot="meta">Captured 3m ago · 12 blocks</span>Summary of quarterly research findings.</${tag("card")}><${tag("card")}><span slot="title">Market analysis draft</span><span slot="meta">Last edited 1h ago · 8 blocks</span>Working draft for review.</${tag("card")}>`
          }
        ]
      },

      // ── Listbox ───────────────────────────────────────────────────────────
      {
        id: "listbox",
        name: "Listbox",
        tag: tag("listbox"),
        category: "compound",
        description: "A keyboard-navigable listbox for single or multi-selection from a set of options. More accessible than a `<select>` for complex option content (icons, secondary text). Fires selection events for easy integration.",
        usage: "Use instead of a `<select>` when options need richer display (icons, descriptions). Each `<option>` or custom item child receives ARIA `role=option` automatically.",
        attrs: [
          { name: "value", type: "string", desc: "Currently selected option value." },
          { name: "disabled", type: "boolean", desc: "Disables the entire listbox." }
        ],
        events: [
          { name: "change", desc: "Fires when selection changes." }
        ],
        slots: [{ name: "", desc: "`<option>` elements or custom item elements." }],
        parts: [],
        examples: [
          {
            label: "Listbox selection",
            layout: "block",
            html: `<${tag("listbox")}><option value="preview" selected>Preview mode</option><option value="capture">Capture mode</option><option value="export">Export mode</option></${tag("listbox")}>`
          }
        ]
      }
    ]
  },

  // ── Command Surfaces ──────────────────────────────────────────────────────
  {
    id: "commands",
    label: "Command Surfaces",
    stories: [

      // ── Menubar + Menu ────────────────────────────────────────────────────
      {
        id: "menubar",
        name: "Menubar + Menu",
        tag: `${tag("menubar")} / ${tag("menu")}`,
        category: "compound",
        description: "`awwbookmarklet-menubar` is a horizontal menu strip placed in a window's `menubar` slot. Each `<button>` child with `data-menu` triggers the corresponding `awwbookmarklet-menu[name]`. Menus portal to the overlay layer and close on Escape or outside click.",
        usage: "Place button triggers inside `awwbookmarklet-menubar`. Give each button a `data-menu` matching the `name` attribute of its `awwbookmarklet-menu`. Menu item buttons should have `data-command` to integrate with the command registry.",
        attrs: [
          { name: "— on awwbookmarklet-menu —", type: "", desc: "" },
          { name: "name", type: "string", desc: "Identifier matching the `data-menu` attribute on the trigger button." }
        ],
        events: [
          { name: "awwbookmarklet-menu-open", desc: "Fires when a menu opens." },
          { name: "awwbookmarklet-menu-close", desc: "Fires when a menu closes." }
        ],
        slots: [
          { name: "— on awwbookmarklet-menubar —", desc: "" },
          { name: "", desc: "Trigger buttons (each with `data-menu`)." },
          { name: "— on awwbookmarklet-menu —", desc: "" },
          { name: "", desc: "Menu item buttons (with `data-command` or click listeners)." }
        ],
        parts: [],
        examples: [
          {
            label: "Menubar with two menus",
            layout: "block",
            html: `<div style="border:1px solid var(--awwbookmarklet-border-strong,#232a33);padding:2px 6px;background:var(--awwbookmarklet-panel-bg,#f8fafc)"><${tag("menubar")}><button type="button" data-menu="file">File</button><button type="button" data-menu="view">View</button><${tag("menu")} name="file"><button type="button" data-command="file.new">New capture</button><button type="button" data-command="file.export">Export…</button><button type="button" data-command="file.settings">Settings</button></${tag("menu")}><${tag("menu")} name="view"><button type="button" data-command="view.preview">Toggle preview</button><button type="button" data-command="view.fullscreen">Fullscreen</button></${tag("menu")}></${tag("menubar")}></div>`
          }
        ]
      },

      // ── Command Palette ───────────────────────────────────────────────────
      {
        id: "command-palette",
        name: "Command Palette",
        tag: tag("command-palette"),
        category: "compound",
        description: "A keyboard-first command search overlay. Type to filter commands, Arrow keys to navigate, Enter to execute, Escape to close. Commands are provided as an array via the `commands` property. Often triggered by Ctrl+K.",
        usage: "Set `commandPalette.commands = [...items]` in JS where each item has `{ id, title, description, keys? }`. Open with `.open()` and close with `.close()`. Listen to `awwbookmarklet-command-execute` to act on the selected command.",
        attrs: [
          { name: "open", type: "boolean", desc: "Shows/hides the palette." },
          { name: "placeholder", type: "string", desc: "Search input placeholder text." }
        ],
        events: [
          { name: "awwbookmarklet-command-execute", desc: "`detail: { commandId }` — fired when the user selects a command." }
        ],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Note: requires JS initialization",
            note: "Use .commands = [...] and .open() in JS",
            layout: "block",
            html: `<p style="margin:0;font-size:12px;color:var(--awwbookmarklet-text-muted,#586272)">Use <code>commandPalette.commands = [...]</code> then <code>commandPalette.open()</code> to show the palette programmatically.</p>`
          }
        ]
      },

      // ── URL Picker ────────────────────────────────────────────────────────
      {
        id: "url-picker",
        name: "URL Picker",
        tag: tag("url-picker"),
        category: "compound",
        description: "A URL input with a dropdown suggestion list. Shows recent/relevant URLs as the user types. Built for bookmarklet tools where the user needs to pick from a set of page URLs, history, or search results.",
        usage: "Set `urlPicker.suggestions = [...items]` in JS where each item has `{ url, title, kind }`. Listen to `awwbookmarklet-url-select` for the chosen URL. The input emits normal `input` events for live filtering.",
        attrs: [
          { name: "value", type: "string", desc: "Current input value." },
          { name: "placeholder", type: "string", desc: "Input placeholder text." }
        ],
        events: [
          { name: "awwbookmarklet-url-select", desc: "`detail: { url }` — fires when a suggestion is selected." }
        ],
        slots: [],
        parts: [],
        examples: [
          {
            label: "URL picker (JS required for suggestions)",
            layout: "block",
            html: `<${tag("url-picker")} value="https://example.com/research"></${tag("url-picker")}>`
          }
        ]
      },

      // ── Shortcut Help ─────────────────────────────────────────────────────
      {
        id: "shortcut-help",
        name: "Shortcut Help",
        tag: tag("shortcut-help"),
        category: "compound",
        description: "A keyboard shortcuts reference panel. Renders a structured list of key combinations and their descriptions. Set `shortcuts` property in JS to provide the list. Used in help dialogs and settings panels.",
        usage: "Set `shortcutHelp.shortcuts = [{ keys: ['Ctrl', 'K'], desc: 'Open command palette' }, ...]`. Optionally group shortcuts by category.",
        attrs: [],
        events: [],
        slots: [{ name: "", desc: "Fallback content or static shortcut list." }],
        parts: [],
        examples: [
          {
            label: "Rendered via JS property",
            note: "Set .shortcuts = [...] in JS",
            layout: "block",
            html: `<p style="margin:0;font-size:12px;color:var(--awwbookmarklet-text-muted,#586272)">Set <code>el.shortcuts = [{ keys: ['Ctrl', 'K'], desc: 'Open command palette' }]</code>.</p>`
          }
        ]
      }
    ]
  },

  // ── Data Display ──────────────────────────────────────────────────────────
  {
    id: "data",
    label: "Data Display",
    stories: [

      // ── Rich Preview ──────────────────────────────────────────────────────
      {
        id: "rich-preview",
        name: "Rich Preview",
        tag: tag("rich-preview"),
        category: "compound",
        description: "A structured link/content preview card showing URL, title, and optional image. Used in capture results, bookmark entries, and link-hover previews.",
        usage: "Set `url`, `title`, `description`, and optionally `image` as attributes or properties. The component handles layout and image loading.",
        attrs: [
          { name: "url", type: "string", desc: "The target URL." },
          { name: "title", type: "string", desc: "Preview title." },
          { name: "description", type: "string", desc: "Short description or excerpt." },
          { name: "image", type: "string", desc: "URL of the preview thumbnail." }
        ],
        events: [],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Basic rich preview",
            layout: "block",
            html: `<${tag("rich-preview")} url="https://example.com/article" title="Understanding constrained environments" description="A guide to writing resilient bookmarklet tools."></${tag("rich-preview")}>`
          }
        ]
      },

      // ── Metric Card ───────────────────────────────────────────────────────
      {
        id: "metric-card",
        name: "Metric Card",
        tag: tag("metric-card"),
        category: "compound",
        description: "A compact status register tile showing a label, primary numeric value, and supporting detail. Used in dashboards and status areas. Replaces ad-hoc 'KPI card' patterns with a consistent, token-driven component.",
        usage: "Use multiple metric cards in a CSS grid for a status register overview. Set `label`, `value`, and `detail` attributes.",
        attrs: [
          { name: "label", type: "string", desc: "Metric name." },
          { name: "value", type: "string", desc: "Primary value (shown large)." },
          { name: "detail", type: "string", desc: "Supporting context (e.g. '+4 this hour')." },
          { name: "tone", type: "string", values: "info | success | warning | danger | neutral", desc: "Color accent for the value." }
        ],
        events: [],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Metric cards",
            html: `<${tag("metric-card")} label="Captures" value="24" detail="+6 this hour"></${tag("metric-card")}><${tag("metric-card")} label="Errors" value="0" detail="No change" tone="success"></${tag("metric-card")}>`
          }
        ]
      },

      // ── Segment Strip ─────────────────────────────────────────────────────
      {
        id: "segment-strip",
        name: "Segment Strip",
        tag: tag("segment-strip"),
        category: "compound",
        description: "A compact one-line renderer for structured context segments — key-value pairs with optional tone, copyable values, and separator marks. Used as a building block for context bars and status strips. Segments are supplied via the `segments` property as an array.",
        usage: "Set `el.segments = [{key, label, value, tone, copyable, copyValue, kind}]`. Or use the `value` attribute with pipe-delimited shorthand: `value='App | Segment | Status'`. Listen to `awwbookmarklet-segment-copy` to handle clipboard events.",
        attrs: [
          { name: "value", type: "string", desc: "Pipe-delimited segment shorthand: `'App | PR #42 | CI passing'`." }
        ],
        events: [
          { name: "awwbookmarklet-segment-copy", desc: "`detail: { key, copyValue }` — fires when a copyable segment is clicked." },
          { name: "awwbookmarklet-segment-activate", desc: "Fires when a segment is activated (click/Enter)." },
          { name: "awwbookmarklet-segment-menu-request", desc: "Fires when a segment requests a context menu." }
        ],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Shorthand value",
            layout: "block",
            html: `<${tag("segment-strip")} value="GitHub | PR #1824 | feature/context-bar | CI passing"></${tag("segment-strip")}>`
          }
        ]
      },

      // ── Context Bar ───────────────────────────────────────────────────────
      {
        id: "context-bar",
        name: "Context Bar",
        tag: tag("context-bar"),
        category: "compound",
        description: "A top context surface combining a segment strip with optional leading/trailing slots, a busy indicator, and a quiet progress strip. Placed at the top of tool windows to show page context (app, object, status) at a glance.",
        usage: "Set `el.segments = [...]` (same format as `awwbookmarklet-segment-strip`) or use the `value` shorthand. Use `busy` to show an indeterminate progress indicator. Use `progress='68'` for a determinate strip.",
        attrs: [
          { name: "value", type: "string", desc: "Pipe-delimited segment shorthand." },
          { name: "busy", type: "boolean", desc: "Shows an indeterminate progress strip." },
          { name: "progress", type: "number", desc: "0–100 for a determinate progress strip." }
        ],
        events: [
          { name: "awwbookmarklet-segment-copy", desc: "Propagated from inner segment strip." }
        ],
        slots: [
          { name: "leading", desc: "Content placed before the segments (e.g., app icon)." },
          { name: "actions", desc: "Content placed after the segments (e.g., icon buttons)." }
        ],
        parts: [],
        examples: [
          {
            label: "Context bar with progress",
            layout: "block",
            html: `<${tag("context-bar")} value="GitHub | PR #1824 | feature/context-bar | CI passing" progress="68"></${tag("context-bar")}>`
          }
        ]
      },

      // ── Status Strip ──────────────────────────────────────────────────────
      {
        id: "status-strip",
        name: "Status Strip",
        tag: tag("status-strip"),
        category: "compound",
        description: "A quieter variant of the context bar for footer/status regions. Shows the same segment data but with reduced visual weight — no busy indicator, no actions slot. Use at the bottom of panels or tool areas to display secondary status.",
        usage: "Use `value` shorthand or set `el.segments = [...]` for structured data. Prefer `status-strip` in footers; prefer `context-bar` in headers.",
        attrs: [
          { name: "value", type: "string", desc: "Pipe-delimited segment shorthand." }
        ],
        events: [
          { name: "awwbookmarklet-segment-copy", desc: "Propagated from inner segment strip." }
        ],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Status strip in footer",
            layout: "block",
            html: `<${tag("status-strip")} value="Review ready | 0 missing | Read-only | Saved 30s ago"></${tag("status-strip")}>`
          }
        ]
      },

      // ── Titlebar ──────────────────────────────────────────────────────────
      {
        id: "titlebar",
        name: "Titlebar",
        tag: tag("titlebar"),
        category: "compound",
        description: "A standalone titlebar surface that can render a title and optional segment data. Exposes a `drag-region` CSS part for future window integration. Used as a header strip in panels, dialogs, or custom windows outside the full window system.",
        usage: "Use when you need a title surface without the full `awwbookmarklet-window` system. Set `label` for the title text, `value` for segment data.",
        attrs: [
          { name: "label", type: "string", desc: "Title text." },
          { name: "value", type: "string", desc: "Pipe-delimited segment shorthand (shown alongside the title)." }
        ],
        events: [],
        slots: [
          { name: "", desc: "Custom titlebar content." },
          { name: "actions", desc: "Trailing action buttons." }
        ],
        parts: [{ name: "drag-region", desc: "The draggable portion of the titlebar." }],
        examples: [
          {
            label: "Standalone titlebar",
            layout: "block",
            html: `<${tag("titlebar")} label="Capture Console" value="Session active | 14 items"></${tag("titlebar")}>`
          }
        ]
      },

      // ── Context Panel ─────────────────────────────────────────────────────
      {
        id: "context-panel",
        name: "Context Panel",
        tag: tag("context-panel"),
        category: "compound",
        description: "An expanded label-value layout for the same segment data used by `awwbookmarklet-context-bar` and `awwbookmarklet-segment-strip`. Displays each segment on its own line with a label column and a value column — useful for detail sidebars and inspect panels.",
        usage: "Set `el.segments = [...]` (same schema as other context components). Do not use the `value` shorthand for this component — structured segments are required for the two-column layout.",
        attrs: [
          { name: "value", type: "string", desc: "Pipe-delimited segment shorthand (basic mode)." }
        ],
        events: [
          { name: "awwbookmarklet-segment-copy", desc: "Fires when a copyable segment value is clicked." }
        ],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Context panel (structured data via JS)",
            note: "Set el.segments = [...] for label-value layout",
            layout: "block",
            html: `<${tag("context-panel")} value="Customer: Acme | Tenant: 918273 | Environment: Production"></${tag("context-panel")}>`
          }
        ]
      }
    ]
  },

  // ── Overlays ──────────────────────────────────────────────────────────────
  {
    id: "overlays",
    label: "Overlays",
    stories: [

      // ── Dialog ────────────────────────────────────────────────────────────
      {
        id: "dialog",
        name: "Dialog",
        tag: tag("dialog"),
        category: "overlay",
        description: "A modal/non-modal dialog overlay. When opened, the element portals to `.awwbookmarklet-overlay-layer` (outside normal DOM flow) so it is unaffected by parent stacking contexts. CSS variables from ancestor elements do NOT cascade into the portaled dialog — use CSS custom properties set directly on the dialog element or `::part()` overrides for styling.",
        usage: "Call `.show()` to open, `.close(reason)` to close. Listen for `awwbookmarklet-dialog-close` to react to all close paths (button, Escape, backdrop, `.close()`). Set `close-on-backdrop` for light-dismiss. Set `modal` to trap Tab focus inside.",
        attrs: [
          { name: "open", type: "boolean", desc: "Controls visibility. Use `.show()` / `.close()` rather than setting this directly." },
          { name: "label", type: "string", default: "Dialog", desc: "Accessible name (`aria-label`) for the dialog panel." },
          { name: "modal", type: "boolean", desc: "Traps Tab focus inside the dialog." },
          { name: "close-on-backdrop", type: "boolean", desc: "Clicking the backdrop calls `.close('backdrop')`." },
          { name: "close-on-escape", type: "string", default: "(true)", desc: "Set to `'false'` to disable Escape key closing." }
        ],
        events: [
          { name: "awwbookmarklet-dialog-open", desc: "Fires after the dialog opens." },
          { name: "awwbookmarklet-dialog-cancel", desc: "Cancelable — fires before closing. Prevent default to keep open." },
          { name: "awwbookmarklet-dialog-close", desc: "`detail: { reason }` — fires after dialog closes. `reason` is 'button' | 'backdrop' | 'escape' | 'api'." }
        ],
        slots: [
          { name: "", desc: "Dialog body content." },
          { name: "title", desc: "Dialog title bar content." },
          { name: "footer", desc: "Footer area (typically a `awwbookmarklet-toolbar` with action buttons)." }
        ],
        parts: [
          { name: "panel", desc: "The dialog panel container (width/height overrides go here)." },
          { name: "header", desc: "Title bar row." },
          { name: "title", desc: "Title text area." },
          { name: "body", desc: "Scrollable content area." },
          { name: "footer", desc: "Footer slot container." },
          { name: "backdrop", desc: "The dim backdrop layer." },
          { name: "close-button", desc: "The × button in the header." }
        ],
        examples: [
          {
            label: "Open dialog via button",
            note: "Click button to open the dialog",
            layout: "row",
            html: `<button class="sb-open-dialog" data-dialog-id="sb-example-dialog">Open dialog</button><${tag("dialog")} id="sb-example-dialog" modal label="Example dialog" close-on-backdrop><span slot="title">Edit settings</span><${tag("field")} label="Capture name" wide style="margin-bottom:8px"><${tag("input")} wide value="Session 2026" /></${tag("field")}><${tag("field")} label="Mode" wide><${tag("select")} wide><option>Visible viewport</option><option>Full page</option></${tag("select")}></${tag("field")}><${tag("toolbar")} slot="footer" align="end"><${tag("button")}>Cancel</${tag("button")}><${tag("button")} class="sb-close-dialog" variant="primary" data-dialog-id="sb-example-dialog">Save</${tag("button")}></${tag("toolbar")}></${tag("dialog")}>`
          }
        ]
      }
    ]
  },

  // ── Application Shell ─────────────────────────────────────────────────────
  {
    id: "shell",
    label: "Application Shell",
    stories: [

      // ── Window ────────────────────────────────────────────────────────────
      {
        id: "window",
        name: "Window",
        tag: tag("window"),
        category: "shell",
        description: "A movable, resizable floating window with titlebar, optional menubar, toolbar, scrollable body, and statusbar. The core shell of every bookmarklet tool. Created via `createWindow({title, content})` and mounted via `mountWindow(win, {ownerPrefix, theme})` from the framework API.",
        usage: "Do not manage the desktop root or overlay layers manually. Use `createWindow()` + `mountWindow()` from `bookmarklet/index.js`. Listen for `awwbookmarklet-window-closed` to clean up. Set `win.setRect({x, y, width, height})` before mounting for initial position.",
        attrs: [
          { name: "title", type: "string", desc: "Window titlebar text." },
          { name: "active", type: "boolean", desc: "Auto-managed by the window manager — marks the focused window." }
        ],
        events: [
          { name: "awwbookmarklet-window-closed", desc: "Fires when the user closes the window. Clean up desktop root ownership here." },
          { name: "awwbookmarklet-window-focused", desc: "Fires when the window gains focus." }
        ],
        slots: [
          { name: "", desc: "Body content (panels, lists, etc.)." },
          { name: "menubar", desc: "An `awwbookmarklet-menubar` element." },
          { name: "toolbar", desc: "An `awwbookmarklet-toolbar` element." },
          { name: "statusbar", desc: "An `awwbookmarklet-statusbar` element." }
        ],
        parts: [
          { name: "titlebar", desc: "The title row." },
          { name: "body", desc: "Scrollable content area." }
        ],
        examples: [
          {
            label: "Open a window (live demo)",
            note: "Click the button to launch a floating window",
            layout: "row",
            html: `<button class="sb-open-window">Launch sample window</button>`
          }
        ]
      },

      // ── Desktop Root ──────────────────────────────────────────────────────
      {
        id: "desktop-root",
        name: "Desktop Root",
        tag: tag("desktop-root"),
        category: "shell",
        description: "The host element that provides the shared overlay surface for all floating windows. Managed automatically by `acquireDesktopRoot(ownerKey)` and `releaseDesktopRoot(ownerKey)`. Multiple tools can share one desktop root via the global owner registry — the root is removed only when the last owner releases it.",
        usage: "Never create `awwbookmarklet-desktop-root` manually. Use `acquireDesktopRoot(ownerKey)` to get or create the shared root. Call `releaseDesktopRoot(ownerKey)` in cleanup. Use `mountWindow(win, { ownerPrefix })` to associate windows with an owner.",
        attrs: [],
        events: [],
        slots: [],
        parts: [],
        examples: [
          {
            label: "Managed automatically — no direct HTML usage",
            note: "Use acquireDesktopRoot() / releaseDesktopRoot() from the framework API",
            layout: "block",
            html: `<pre style="margin:0;font-size:12px;padding:8px;background:var(--code-bg,#1e2330);color:var(--code-fg,#cdd6f4)">import { acquireDesktopRoot, releaseDesktopRoot, mountWindow } from "./bookmarklet/index.js";

const record = acquireDesktopRoot("my-tool");
mountWindow(win, { ownerPrefix: "my-tool" });
win.addEventListener("awwbookmarklet-window-closed",
  () => releaseDesktopRoot("my-tool"), { once: true });</pre>`
          }
        ]
      },

      // ── App Shell ─────────────────────────────────────────────────────────
      {
        id: "app-shell",
        name: "App Shell",
        tag: tag("app-shell"),
        category: "shell",
        description: "A structured content area inside a window body. Provides a title, optional subtitle, an inset content region, and optional toolbar/actions slots. Use `awwbookmarklet-app-shell` as the primary layout component inside a window — it handles padding, scrolling, and heading structure.",
        usage: "Place inside an `awwbookmarklet-window`'s body. Use `title` and `subtitle` slots for the section heading. Nest `awwbookmarklet-panel` or form content in the default slot.",
        attrs: [],
        events: [],
        slots: [
          { name: "", desc: "Main content (panels, forms, lists)." },
          { name: "title", desc: "Section heading." },
          { name: "subtitle", desc: "Section subheading." },
          { name: "toolbar", desc: "An inline toolbar placed below the heading." },
          { name: "actions", desc: "Action buttons aligned to the right of the heading." }
        ],
        parts: [
          { name: "shell", desc: "The outer container." },
          { name: "header", desc: "Heading area." },
          { name: "body", desc: "Content area." }
        ],
        examples: [
          {
            label: "App shell with content",
            layout: "block",
            html: `<${tag("app-shell")}><span slot="title">Capture options</span><span slot="subtitle">Configure how content is captured from the current page.</span><${tag("panel")}><${tag("field")} label="Mode" wide><${tag("select")} wide><option>Visible viewport</option><option>Full page</option></${tag("select")}></${tag("field")}></${tag("panel")}></${tag("app-shell")}>`
          }
        ]
      },

      // ── Statusbar ─────────────────────────────────────────────────────────
      {
        id: "statusbar",
        name: "Statusbar",
        tag: tag("statusbar"),
        category: "shell",
        description: "A horizontal status bar for the bottom of a window. Each direct `<span>` child becomes a separated status cell. Use for concise status information: document state, selection count, connection status, etc.",
        usage: "Place in the `statusbar` slot of an `awwbookmarklet-window`. Use `<span>` children for individual cells — the first cell is typically the primary status, subsequent cells are secondary.",
        attrs: [],
        events: [],
        slots: [{ name: "", desc: "`<span>` elements, each rendered as a separated status cell." }],
        parts: [{ name: "bar", desc: "The statusbar container." }],
        examples: [
          {
            label: "Statusbar",
            layout: "block",
            html: `<${tag("statusbar")}><span>Ready</span><span>1,842 DOM nodes</span><span>Injection: active</span><span>Policy: limited</span></${tag("statusbar")}>`
          }
        ]
      },

      // ── Browser Panel ─────────────────────────────────────────────────────
      {
        id: "browser-panel",
        name: "Browser Panel",
        tag: tag("browser-panel"),
        category: "shell",
        description: "A panel that represents browser content with address bar, navigation controls, and a content area. Used in tools that display or control a web view — captures page state, shows blocked/error content, and exposes page action shortcuts.",
        usage: "Set `url` for the displayed address. Set `status` for the content state. Listen for navigation events from the toolbar controls. Use as a sub-panel inside an app shell.",
        attrs: [
          { name: "url", type: "string", desc: "Currently displayed URL in the address bar." },
          { name: "status", type: "string", values: "loading | ready | error | blocked", desc: "Content area state." },
          { name: "title", type: "string", desc: "Page title shown in the bar." }
        ],
        events: [
          { name: "awwbookmarklet-browser-navigate", desc: "`detail: { url }` — fires when the user submits a URL." }
        ],
        slots: [
          { name: "", desc: "Content to display inside the browser panel." },
          { name: "actions", desc: "Extra action buttons in the toolbar." }
        ],
        parts: [],
        examples: [
          {
            label: "Browser panel",
            layout: "block",
            html: `<${tag("browser-panel")} url="https://example.com/research" status="ready" title="Research workspace"><p style="margin:0;padding:8px;color:var(--awwbookmarklet-text-muted,#586272)">Page content appears here.</p></${tag("browser-panel")}>`
          }
        ]
      },

      // ── Manual Copy ───────────────────────────────────────────────────────
      {
        id: "manual-copy",
        name: "Manual Copy",
        tag: tag("manual-copy"),
        category: "shell",
        description: "A structured fallback copy panel for when automatic clipboard or capture APIs are unavailable. Presents a clear manual copy workflow: select → copy → paste. Treats the manual path as a resilient workflow, not a panic state.",
        usage: "Show when `navigator.clipboard.writeText()` fails or when the extension context is blocked. Set `value` to the text the user should copy. Use `label` to describe what is being copied.",
        attrs: [
          { name: "value", type: "string", desc: "The text content to be manually copied." },
          { name: "label", type: "string", desc: "Description of what this content is." }
        ],
        events: [
          { name: "awwbookmarklet-manual-copy-attempt", desc: "Fires when user clicks the copy button." }
        ],
        slots: [
          { name: "", desc: "Instructions or additional context." }
        ],
        parts: [],
        examples: [
          {
            label: "Manual copy fallback",
            layout: "block",
            html: `<${tag("manual-copy")} label="Markdown export" value="# Research Notes\n\nYour captured content here.">Automatic copy is not available. Select the text below and press Ctrl+C to copy it manually.</${tag("manual-copy")}>`
          }
        ]
      }
    ]
  }
];

// ── Render helpers ───────────────────────────────────────────────────────────

function renderAttrsTable(attrs) {
  if (!attrs || attrs.length === 0) return `<p class="sb-note">No observed attributes.</p>`;
  return `<table class="sb-table">
    <thead><tr><th>Attribute</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
    <tbody>${attrs.map((a) => a.name.startsWith("—") ? `<tr><td colspan="4" style="background:var(--surface-inset);font-size:11px;font-weight:700;color:var(--text-subtle)">${esc(a.name)}</td></tr>` : `<tr>
      <td class="sb-attr-name">${esc(a.name)}</td>
      <td class="sb-attr-type">${a.values ? a.values.split(" | ").map((v) => `<span style="white-space:nowrap">${esc(v)}</span>`).join(" | ") : esc(a.type || "")}</td>
      <td class="sb-attr-default">${esc(a.default || "")}</td>
      <td>${esc(a.desc)}</td>
    </tr>`).join("")}</tbody>
  </table>`;
}

function renderEventsTable(events) {
  if (!events || events.length === 0) return `<p class="sb-note">No custom events.</p>`;
  return `<table class="sb-table">
    <thead><tr><th>Event</th><th>Description</th></tr></thead>
    <tbody>${events.map((e) => `<tr><td class="sb-attr-name">${esc(e.name)}</td><td>${esc(e.desc)}</td></tr>`).join("")}</tbody>
  </table>`;
}

function renderSlotsTable(slots) {
  if (!slots || slots.length === 0) return `<p class="sb-note">No slots.</p>`;
  return `<table class="sb-table">
    <thead><tr><th>Slot</th><th>Description</th></tr></thead>
    <tbody>${slots.map((s) => s.name.startsWith("—") ? `<tr><td colspan="2" style="background:var(--surface-inset);font-size:11px;font-weight:700;color:var(--text-subtle)">${esc(s.name)}</td></tr>` : `<tr>
      <td class="sb-attr-name">${s.name === "" ? `<em style="color:var(--text-subtle)">(default)</em>` : esc(s.name)}</td>
      <td>${esc(s.desc)}</td>
    </tr>`).join("")}</tbody>
  </table>`;
}

function renderPartsTable(parts) {
  if (!parts || parts.length === 0) return `<p class="sb-note">No CSS parts.</p>`;
  return `<table class="sb-table">
    <thead><tr><th>Part</th><th>Description</th></tr></thead>
    <tbody>${parts.map((p) => `<tr><td class="sb-attr-name">::part(${esc(p.name)})</td><td>${esc(p.desc)}</td></tr>`).join("")}</tbody>
  </table>`;
}

function escapeHtml(html) {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderExamples(examples) {
  if (!examples || examples.length === 0) return "";
  return `<div class="sb-examples-grid">
    ${examples.map((ex) => `
      <div class="sb-example">
        <div class="sb-example-label">
          <span>${esc(ex.label)}</span>
          ${ex.note ? `<span class="sb-example-note">${esc(ex.note)}</span>` : ""}
        </div>
        <div class="sb-preview${ex.layout === "block" ? " block" : ex.layout === "col" ? " col" : ""}">${ex.html}</div>
        <details class="sb-code-toggle">
          <summary>HTML</summary>
          <pre class="sb-code">${escapeHtml(ex.html.trim())}</pre>
        </details>
      </div>
    `).join("")}
  </div>`;
}

function renderStory(story) {
  return `<div class="sb-story" id="story-${esc(story.id)}" data-story="${esc(story.id)}">
    <div class="sb-story-header">
      <h2 class="sb-story-name">${esc(story.name)}</h2>
      <code class="sb-story-tag">&lt;${esc(story.tag)}&gt;</code>
      <span class="sb-story-badge ${esc(story.category)}">${esc(story.category)}</span>
    </div>
    <div class="sb-story-body">
      <p class="sb-description">${esc(story.description)}</p>
      ${story.usage ? `<div class="sb-usage-note"><strong>Usage:</strong> ${esc(story.usage)}</div>` : ""}

      <div class="sb-section-title">Examples</div>
      ${renderExamples(story.examples)}

      <div class="sb-section-title">Attributes</div>
      ${renderAttrsTable(story.attrs)}

      <div class="sb-section-title">Events</div>
      ${renderEventsTable(story.events)}

      <div class="sb-section-title">Slots</div>
      ${renderSlotsTable(story.slots)}

      <div class="sb-section-title">CSS Parts (::part)</div>
      ${renderPartsTable(story.parts)}
    </div>
  </div>`;
}

// ── Welcome screen ───────────────────────────────────────────────────────────

function countAllStories() {
  return CATEGORIES.reduce((sum, cat) => sum + cat.stories.length, 0);
}

function countByCategory(catId) {
  const cat = CATEGORIES.find((c) => c.id === catId);
  return cat ? cat.stories.length : 0;
}

function renderWelcome() {
  const total = countAllStories();
  return `<div class="sb-welcome">
    <h1>${iconSvg("logo")} RetroOS UI — Component Storybook</h1>
    <p>
      Developer and agent reference for every component in the framework.
      Select a component from the sidebar to view its description, API, and live examples.
    </p>
    <p>
      <strong>How to use this storybook:</strong> Each entry documents the component's
      purpose, all observed attributes, custom events, slots, and CSS parts.
      Live examples render directly in the page using the real web components.
      Code snippets are expandable below each example.
    </p>
    <p>
      <strong>Framework note:</strong> This is an editable vendored copy.
      The code lives at <code>src/vendor/retroos-ui-v001/</code> and belongs to this project.
      Agents and developers may extend, fix, or improve any component when the change
      is generic and reusable.
    </p>
    <div class="sb-welcome-grid">
      <div class="sb-stat-card"><strong>${total}</strong><span>Total components</span></div>
      <div class="sb-stat-card"><strong>${ICON_NAMES.length}</strong><span>Icon names</span></div>
      <div class="sb-stat-card"><strong>${CATEGORIES.length}</strong><span>Categories</span></div>
    </div>
    <div class="sb-welcome-grid" style="margin-top:8px">
      ${CATEGORIES.map((cat) => `<div class="sb-stat-card"><strong>${cat.stories.length}</strong><span>${cat.label}</span></div>`).join("")}
    </div>
  </div>`;
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function renderSidebar(navTree) {
  let html = "";
  for (const cat of CATEGORIES) {
    html += `<div class="sb-cat-header" data-category="${cat.id}">${cat.label}</div>`;
    for (const story of cat.stories) {
      const badge = story.category;
      html += `<button class="sb-nav-item" data-story="${story.id}" aria-selected="false">
        ${esc(story.name)}
        <span class="sb-nav-badge">${esc(badge)}</span>
      </button>`;
    }
  }
  navTree.innerHTML = html;
}

// ── Navigation ───────────────────────────────────────────────────────────────

function findStory(id) {
  for (const cat of CATEGORIES) {
    const s = cat.stories.find((s) => s.id === id);
    if (s) return s;
  }
  return null;
}

function showStory(id, content, navTree) {
  const story = findStory(id);
  if (!story) return;

  content.innerHTML = renderStory(story);
  content.scrollTop = 0;

  // Update sidebar selection
  navTree.querySelectorAll(".sb-nav-item").forEach((btn) => {
    btn.setAttribute("aria-selected", btn.dataset.story === id ? "true" : "false");
  });

  // Update URL hash
  history.replaceState(null, "", `#${id}`);

  // Wire demo interactions
  wireExampleInteractions(content);
}

function showWelcome(content, navTree) {
  content.innerHTML = renderWelcome();
  navTree.querySelectorAll(".sb-nav-item").forEach((btn) => {
    btn.setAttribute("aria-selected", "false");
  });
  history.replaceState(null, "", "#");
}

// ── Example interactions ──────────────────────────────────────────────────────

function wireExampleInteractions(root) {
  // Toast demo buttons
  root.querySelectorAll(".sb-demo-toast").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tone = btn.dataset.tone || "info";
      const msg = btn.dataset.msg || "Demo toast";
      showToast({ message: msg, tone, timeout: 2500, key: `sb-toast-${tone}` });
    });
  });

  // Dialog open buttons
  root.querySelectorAll(".sb-open-dialog").forEach((btn) => {
    const dialogId = btn.dataset.dialogId;
    if (!dialogId) return;
    const dialog = root.querySelector(`#${dialogId}`);
    if (!dialog) return;
    btn.addEventListener("click", () => dialog.show());
  });

  // Dialog close buttons inside dialogs
  root.querySelectorAll(".sb-close-dialog").forEach((btn) => {
    const dialogId = btn.dataset.dialogId;
    if (!dialogId) return;
    const dialog = root.closest(`#${dialogId}`) || document.getElementById(dialogId);
    if (dialog) btn.addEventListener("click", () => dialog.close("button"));
  });

  // Window demo
  root.querySelectorAll(".sb-open-window").forEach((btn) => {
    btn.addEventListener("click", () => openSampleWindow());
  });
}

// ── Sample window ─────────────────────────────────────────────────────────────

import { acquireDesktopRoot, releaseDesktopRoot } from "../core/runtime.js";
import { applyThemePatch } from "../core/theme.js";

let windowSerial = 0;

function openSampleWindow() {
  windowSerial += 1;
  const owner = `storybook-win-${windowSerial}`;
  const record = acquireDesktopRoot(owner);

  const win = document.createElement(TAGS.window);
  win.setAttribute("title", "Sample Window");

  win.innerHTML = `
    <${TAGS.toolbar} slot="toolbar">
      <${TAGS.button} variant="primary">Capture</${TAGS.button}>
      <${TAGS.button}>Preview</${TAGS.button}>
      <${TAGS.iconButton} label="Refresh">${iconSvg("refresh")}</${TAGS.iconButton}>
    </${TAGS.toolbar}>
    <${TAGS.appShell}>
      <span slot="title">Session Capture</span>
      <span slot="subtitle">Launched from the storybook window demo.</span>
      <${TAGS.panel}>
        <span slot="title">Settings</span>
        <${TAGS.field} label="Capture name" wide><${TAGS.input} wide value="session_2026" /></${TAGS.field}>
        <${TAGS.field} label="Mode" wide><${TAGS.select} wide><option>Visible viewport</option><option>Full page</option></${TAGS.select}></${TAGS.field}>
        <${TAGS.field} label="Include images"><${TAGS.checkbox} checked>Yes</${TAGS.checkbox}></${TAGS.field}>
      </${TAGS.panel}>
    </${TAGS.appShell}>
    <${TAGS.statusbar} slot="statusbar"><span>Ready</span><span>Storybook demo</span><span>Mode: preview</${TAGS.statusbar}>
  `;

  win.setRect({ x: 80 + windowSerial * 24, y: 80 + windowSerial * 24, width: 480, height: 380 });
  record.root.append(win);
  win.addEventListener("awwbookmarklet-window-closed", () => releaseDesktopRoot(owner), { once: true });
}

// ── Filter ────────────────────────────────────────────────────────────────────

function filterSidebar(query, navTree) {
  const q = query.toLowerCase().trim();
  navTree.querySelectorAll(".sb-nav-item").forEach((btn) => {
    const name = (btn.textContent || "").toLowerCase();
    btn.hidden = q.length > 0 && !name.includes(q);
  });
  // Show/hide category headers
  navTree.querySelectorAll(".sb-cat-header").forEach((header) => {
    const catId = header.dataset.category;
    const hasVisible = [...navTree.querySelectorAll(`.sb-nav-item[data-story]`)].some((btn) => {
      const story = findStory(btn.dataset.story);
      const cat = CATEGORIES.find((c) => c.stories.includes(story));
      return cat && cat.id === catId && !btn.hidden;
    });
    header.hidden = q.length > 0 && !hasVisible;
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initStorybook() {
  const navTree = document.getElementById("sb-nav-tree");
  const content = document.getElementById("sb-content");
  const search = document.getElementById("sb-search");
  const countEl = document.getElementById("sb-component-count");

  if (!navTree || !content) return;

  renderSidebar(navTree);

  const total = countAllStories();
  if (countEl) countEl.textContent = `${total} components`;

  // Navigation clicks
  navTree.addEventListener("click", (e) => {
    const btn = e.target.closest(".sb-nav-item[data-story]");
    if (btn) showStory(btn.dataset.story, content, navTree);
  });

  // Keyboard navigation in sidebar
  navTree.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const btn = e.target.closest(".sb-nav-item[data-story]");
      if (btn) { e.preventDefault(); showStory(btn.dataset.story, content, navTree); }
    }
  });

  // Search/filter
  search?.addEventListener("input", () => filterSidebar(search.value, navTree));

  // Hash routing on load
  const hash = window.location.hash.slice(1);
  if (hash && findStory(hash)) {
    showStory(hash, content, navTree);
  } else {
    showWelcome(content, navTree);
  }

  // Hash change
  window.addEventListener("hashchange", () => {
    const h = window.location.hash.slice(1);
    if (h && findStory(h)) showStory(h, content, navTree);
    else showWelcome(content, navTree);
  });
}

initStorybook();
