(function () {
  const App = window.App = window.App || {};

  const caseModes = [
    { value: "lowercase", label: "lowercase" },
    { value: "uppercase", label: "UPPERCASE" },
    { value: "snake", label: "snake_case" },
    { value: "kebab", label: "kebab-case" },
    { value: "camel", label: "camelCase" },
    { value: "pascal", label: "PascalCase" }
  ];

  function splitWords(input) {
    if (!input) {
      return [];
    }
    const withSpaces = input
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_\-]+/g, " ")
      .replace(/[^A-Za-z0-9]+/g, " ");
    const parts = withSpaces.trim().split(/\s+/).filter(Boolean);
    return parts;
  }

  function toTitle(word) {
    if (!word) {
      return "";
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  function applyCaseTransform(input, config) {
    const mode = config && config.mode ? config.mode : "lowercase";
    if (mode === "lowercase") {
      return input.toLowerCase();
    }
    if (mode === "uppercase") {
      return input.toUpperCase();
    }
    const words = splitWords(input);
    if (!words.length) {
      return "";
    }
    if (mode === "snake") {
      return words.map((word) => word.toLowerCase()).join("_");
    }
    if (mode === "kebab") {
      return words.map((word) => word.toLowerCase()).join("-");
    }
    if (mode === "camel") {
      return (
        words[0].toLowerCase() +
        words.slice(1).map(toTitle).join("")
      );
    }
    if (mode === "pascal") {
      return words.map(toTitle).join("");
    }
    return input;
  }

  function applyTrim(input, config) {
    if (!input) {
      return "";
    }
    const trimmed = input.trim();
    if (config && config.collapseWhitespace) {
      return trimmed.replace(/\s+/g, " ");
    }
    return trimmed;
  }

  function applyTemplateWrap(input, config) {
    const template = (config && config.template) ? config.template : "${value}";
    const jsonValue = JSON.stringify(input);
    return template
      .replace(/\$\{json\}/g, jsonValue)
      .replace(/\$\{value\}/g, input);
  }

  const templatePresets = [
    { label: ", ${value}", value: ", ${value}" },
    { label: "'${value}'", value: "'${value}'" },
    { label: "\"${value}\"", value: "\"${value}\"" },
    { label: ", ${json}", value: ", ${json}" }
  ];

  const catalog = [
    {
      type: "trim",
      label: "Trim",
      createDefaultConfig: function () {
        return { collapseWhitespace: false };
      },
      apply: applyTrim
    },
    {
      type: "case",
      label: "Case transform",
      createDefaultConfig: function () {
        return { mode: "lowercase" };
      },
      apply: applyCaseTransform
    },
    {
      type: "template",
      label: "Template wrap",
      createDefaultConfig: function () {
        return { template: "${value}" };
      },
      apply: applyTemplateWrap,
      presets: templatePresets
    }
  ];

  const profiles = [
    {
      id: "sql-comma-prefix",
      name: "SQL comma prefix",
      description: "Prefix each paste with a comma and space.",
      insertionModeId: "delimiterPrefix",
      insertionConfig: { delimiter: ", " },
      pipeline: [
        { type: "trim", config: { collapseWhitespace: false } }
      ]
    },
    {
      id: "json-string-item",
      name: "JSON string item",
      description: "Wrap each paste as a JSON string on its own line.",
      insertionModeId: "insertOnNewLineAtCursor",
      pipeline: [
        { type: "template", config: { template: "${json}" } }
      ]
    },
    {
      id: "simple-case-snake",
      name: "Snake case",
      description: "Convert words into snake_case.",
      insertionModeId: "insertAtCursor",
      pipeline: [
        { type: "case", config: { mode: "snake" } }
      ]
    }
  ];

  function clonePipeline(steps) {
    return steps.map((step) => ({
      type: step.type,
      config: Object.assign({}, step.config || {})
    }));
  }

  function getStepDefinition(type) {
    return catalog.find((step) => step.type === type) || null;
  }

  function runPipeline(steps, input) {
    let output = input;
    steps.forEach((step) => {
      const definition = getStepDefinition(step.type);
      if (!definition) {
        throw new Error("Unknown step type: " + step.type);
      }
      output = definition.apply(output, step.config || {});
    });
    return output;
  }

  App.pipeline = {
    getCatalog: function () {
      return catalog.slice();
    },
    getProfiles: function () {
      return profiles.slice();
    },
    getCaseModes: function () {
      return caseModes.slice();
    },
    getStepDefinition: getStepDefinition,
    runPipeline: runPipeline,
    clonePipeline: clonePipeline
  };
})();
