/** Independently maintained acceptance examples. Never synchronize from Guided. */
export const projectDescription = {
  template: "Project description",
  style: "Input + processing + output",
  answers: [
    ["input", "pasted JSON"],
    ["result", "a readable formatted version"],
    ["processing", "checks it for syntax errors"],
  ],
  text: "Takes pasted JSON, checks it for syntax errors, and produces a readable formatted version.",
  markdown:
    "Takes pasted JSON, checks it for syntax errors, and produces a readable formatted version\\.",
  htmlFragment:
    "<p>Takes pasted JSON, checks it for syntax errors, and produces a readable formatted version.</p>",
} as const;

export const authoringExamples = {
  greeting: "TEMPLATE: Greeting\nTEXT:\n  Hello {{$name}}.\n$name: Your name?\n  EXAMPLE: Alex",
  greetingWithoutField:
    "TEMPLATE: Greeting\nTEXT:\n  Hello everyone.\n$name: Your name?\n  EXAMPLE: Alex",
  invalid: "TEMPLATE: Broken draft\n\nTEXT:\n  Hello {{$name}\n",
  literal: "TEMPLATE: Independent draft\nTEXT:\n  A locally authored sentence.",
  shared: "TEMPLATE: Shared source\nTEXT:\n  Original text.",
  sharedLatest: "TEMPLATE: Shared source\nTEXT:\n  Updated in the first tab.",
  prototypeAndChoice: [
    "TEMPLATE: Preview types",
    "TEXT:",
    "  {{$constructor}}{{$tone}}.",
    "$constructor OPTIONAL: Add a prefix?",
    "$tone: Choose a tone?",
    "  OPTION warm: A warm message",
  ].join("\n"),
  versionedGreeting: [
    "TEMPLATE: Greeting",
    "VERSION: Friendly",
    "  TEXT:",
    "    Hello {{$name}}.",
    "VERSION: Formal",
    "  TEXT:",
    "    Dear {{$name}}.",
    "$name: Your name?",
    "  EXAMPLE: Alex",
  ].join("\n"),
} as const;
