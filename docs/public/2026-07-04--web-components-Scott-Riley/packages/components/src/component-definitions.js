export const componentDefinitions = [
  {
    tagName: "my-button",
    className: "MyButton",
    displayName: "Button",
    status: "ready",
    description:
      "A standard action component that renders either a semantic button or an anchor when `href` is provided.",
    modulePath: "./components/button.js",
    props: [
      { name: "variant", type: '"default" | "primary" | "danger" | "success"', default: "default", description: "Visual intent of the action." },
      { name: "size", type: '"sm" | "md" | "lg"', default: "md", description: "Control density and text size." },
      { name: "href", type: "string", default: "", description: "When present, renders the component as a link." },
      { name: "target", type: "string", default: "", description: "Anchor target used only when `href` is set." },
      { name: "rel", type: "string", default: "", description: "Anchor relationship used only when `href` is set." },
      { name: "type", type: '"button" | "submit" | "reset"', default: "button", description: "Native button type used when no `href` is set." },
      { name: "disabled", type: "boolean", default: "false", description: "Prevents interaction for temporarily unavailable actions." },
      { name: "loading", type: "boolean", default: "false", description: "Shows a busy state and prevents repeated activation." },
      { name: "icon", type: '"check" | "close" | "info" | "warning" | "arrow-right" | ""', default: "", description: "Optional leading icon name." },
      { name: "icon-only", type: "boolean", default: "false", description: "Marks the control as icon-only; pair it with `aria-label`." },
      { name: "aria-label", type: "string", default: "", description: "Accessible label used when the visible label is not enough, especially for icon-only buttons." }
    ]
  },
  {
    tagName: "my-badge",
    className: "MyBadge",
    displayName: "Badge",
    status: "ready",
    description: "A compact label for status, metadata, or categorical information.",
    modulePath: "./components/badge.js",
    props: [
      { name: "variant", type: '"neutral" | "primary" | "danger" | "success" | "warning"', default: "neutral", description: "Semantic badge color." }
    ]
  },
  {
    tagName: "my-card",
    className: "MyCard",
    displayName: "Card",
    status: "ready",
    description: "A low-decoration content container for grouping related interface content.",
    modulePath: "./components/card.js",
    props: [
      { name: "tone", type: '"default" | "subtle"', default: "default", description: "Surface treatment for the card." }
    ]
  },
  {
    tagName: "my-icon",
    className: "MyIcon",
    displayName: "Icon",
    status: "ready",
    description: "A small controlled icon component for decorative or labelled UI symbols.",
    modulePath: "./components/icon.js",
    props: [
      { name: "name", type: '"check" | "close" | "info" | "warning" | "arrow-right"', default: "info", description: "Icon glyph to render." },
      { name: "label", type: "string", default: "", description: "Accessible label; omit for decorative icons." }
    ]
  },
  {
    tagName: "my-input",
    className: "MyInput",
    displayName: "Input",
    status: "ready",
    description: "A labelled text input with hint, error, required, and disabled states.",
    modulePath: "./components/input.js",
    props: [
      { name: "label", type: "string", default: "", description: "Visible field label." },
      { name: "name", type: "string", default: "", description: "Native input name." },
      { name: "value", type: "string", default: "", description: "Current input value." },
      { name: "placeholder", type: "string", default: "", description: "Placeholder text for examples only; labels remain required." },
      { name: "hint", type: "string", default: "", description: "Helpful text shown below the field." },
      { name: "error", type: "string", default: "", description: "Validation message shown below the field." },
      { name: "required", type: "boolean", default: "false", description: "Marks the input as required." },
      { name: "disabled", type: "boolean", default: "false", description: "Prevents editing." }
    ]
  },
  {
    tagName: "my-alert",
    className: "MyAlert",
    displayName: "Alert",
    status: "ready",
    description: "A status message for success, warning, error, or informational feedback.",
    modulePath: "./components/alert.js",
    props: [
      { name: "variant", type: '"info" | "success" | "warning" | "danger"', default: "info", description: "Message intent." },
      { name: "heading", type: "string", default: "", description: "Optional alert heading." }
    ]
  },
  {
    tagName: "my-spinner",
    className: "MySpinner",
    displayName: "Spinner",
    status: "ready",
    description: "A compact loading indicator that respects reduced-motion preferences.",
    modulePath: "./components/spinner.js",
    props: [
      { name: "label", type: "string", default: "Loading", description: "Accessible loading label." },
      { name: "size", type: '"sm" | "md" | "lg"', default: "md", description: "Spinner size." }
    ]
  },
  {
    tagName: "my-disclosure",
    className: "MyDisclosure",
    displayName: "Disclosure",
    status: "ready",
    description: "A composite component that enhances slotted content into a keyboard-accessible disclosure.",
    modulePath: "./components/disclosure.js",
    props: [
      { name: "summary", type: "string", default: "Details", description: "Text used for the disclosure trigger." },
      { name: "open", type: "boolean", default: "false", description: "Whether the panel is expanded." }
    ]
  },
  {
    tagName: "my-field",
    className: "MyField",
    displayName: "Field",
    status: "ready",
    description: "A composite field wrapper for labels, hints, errors, and slotted form controls.",
    modulePath: "./components/field.js",
    props: [
      { name: "label", type: "string", default: "", description: "Field label text." },
      { name: "hint", type: "string", default: "", description: "Helpful text shown before errors." },
      { name: "error", type: "string", default: "", description: "Validation message." },
      { name: "required", type: "boolean", default: "false", description: "Marks the field label as required." }
    ]
  }
];
