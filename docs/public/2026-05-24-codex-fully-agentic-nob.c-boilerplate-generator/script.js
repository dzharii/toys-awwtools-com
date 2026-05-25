(function () {
  "use strict";

  const compilerCommands = {
    cc: "cc",
    gcc: "gcc",
    clang: "clang",
    tcc: "tcc",
  };

  const buildFlags = {
    debug: ["-g", "-O0"],
    release: ["-O2"],
  };

  const warningFlags = {
    basic: ["-Wall", "-Wextra"],
    strict: ["-Wall", "-Wextra", "-Wpedantic"],
    none: [],
  };

  const platformSuffix = {
    linux: "",
    macos: "",
    "windows-mingw": ".exe",
  };

  const defaultConfig = Object.freeze({
    projectName: "hello-nob",
    targetName: "hello",
    outputDir: "build",
    compilerProfile: "cc",
    platform: "linux",
    buildProfile: "debug",
    warningProfile: "basic",
    sources: "src/main.c",
    includePaths: "",
    libraries: "",
    selfRebuild: true,
    commentMode: "normal",
  });

  const fields = [
    "projectName",
    "targetName",
    "outputDir",
    "compilerProfile",
    "platform",
    "buildProfile",
    "warningProfile",
    "sources",
    "includePaths",
    "libraries",
    "selfRebuild",
    "commentMode",
  ];

  const elements = {};
  let currentModel = null;

  function splitLines(value) {
    return String(value || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function hasControlChars(value) {
    return /[\u0000-\u001f\u007f]/.test(value);
  }

  function cString(value) {
    return String(value).replace(/\\/g, "\\\\");
  }

  function validateTextField(label, value, messages, options = {}) {
    const trimmed = String(value || "").trim();
    if (options.required && !trimmed) {
      messages.errors.push(`${label} is required.`);
    }
    if (trimmed.includes('"')) {
      messages.errors.push(`${label} cannot contain double quotes in V1.`);
    }
    if (hasControlChars(trimmed)) {
      messages.errors.push(`${label} cannot contain control characters.`);
    }
    if (options.noSlash && /[\\/]/.test(trimmed)) {
      messages.errors.push(`${label} cannot contain path separators.`);
    }
    return trimmed;
  }

  function duplicateWarnings(label, values, messages) {
    const seen = new Set();
    values.forEach((value) => {
      if (seen.has(value)) {
        messages.warnings.push(`${label} contains duplicate entry "${value}". It is preserved in the generated command.`);
      }
      seen.add(value);
    });
  }

  function normalizeConfig(raw) {
    const messages = { errors: [], warnings: [], info: [] };
    const projectName = validateTextField("Project name", raw.projectName, messages, { required: true });
    const targetName = validateTextField("Target name", raw.targetName, messages, { required: true, noSlash: true });
    const outputDir = validateTextField("Output directory", raw.outputDir, messages);
    const sources = splitLines(raw.sources);
    const includePaths = splitLines(raw.includePaths);
    const libraries = splitLines(raw.libraries);

    if (sources.length === 0) {
      messages.errors.push("At least one source file is required.");
    }

    sources.forEach((source) => validateTextField(`Source "${source}"`, source, messages, { required: true }));
    includePaths.forEach((includePath) => validateTextField(`Include path "${includePath}"`, includePath, messages, { required: true }));
    libraries.forEach((library) => {
      validateTextField(`Library argument "${library}"`, library, messages, { required: true });
      if (/(^|\s)-l\S+\s+-l\S+/.test(library)) {
        messages.errors.push(`Library argument "${library}" contains multiple -l tokens. Put one argument on each line.`);
      }
    });

    duplicateWarnings("Sources", sources, messages);
    duplicateWarnings("Include paths", includePaths, messages);
    duplicateWarnings("Library arguments", libraries, messages);

    const compilerProfile = compilerCommands[raw.compilerProfile] ? raw.compilerProfile : defaultConfig.compilerProfile;
    const platform = Object.prototype.hasOwnProperty.call(platformSuffix, raw.platform) ? raw.platform : defaultConfig.platform;
    const buildProfile = buildFlags[raw.buildProfile] ? raw.buildProfile : defaultConfig.buildProfile;
    const warningProfile = warningFlags[raw.warningProfile] ? raw.warningProfile : defaultConfig.warningProfile;
    const commentMode = raw.commentMode === "compact" ? "compact" : "normal";
    const executableName = targetName + platformSuffix[platform];
    const outputPath = outputDir ? `${outputDir}/${executableName}` : executableName;

    if (raw.selfRebuild !== true) {
      messages.warnings.push("Self-rebuild is disabled; rerun your C compiler manually after editing nob.c.");
    }

    return {
      config: {
        projectName,
        targetName,
        outputDir,
        compilerProfile,
        platform,
        buildProfile,
        warningProfile,
        sources,
        includePaths,
        libraries,
        selfRebuild: raw.selfRebuild === true,
        commentMode,
        executableName,
        outputPath,
      },
      messages,
      valid: messages.errors.length === 0,
    };
  }

  function buildCommandArgs(config) {
    const args = [compilerCommands[config.compilerProfile]];
    args.push(...warningFlags[config.warningProfile]);
    args.push(...buildFlags[config.buildProfile]);
    config.includePaths.forEach((path) => args.push(`-I${path}`));
    args.push("-o", config.outputPath);
    args.push(...config.sources);
    args.push(...config.libraries);
    return args;
  }

  function formatCmdAppend(args) {
    const lines = args.map((arg) => `        "${cString(arg)}"`).join(",\n");
    return `    nob_cmd_append(&cmd,\n${lines}\n    );`;
  }

  function generateNobC(config) {
    const header = config.commentMode === "compact"
      ? [
          "// Generated by nob.c Boilerplate Generator",
          "// Assumption: nob.h is available next to this file.",
          "",
        ]
      : [
          "// Generated by nob.c Boilerplate Generator",
          `// Project: ${config.projectName}`,
          "// Assumption: nob.h is available next to this file.",
          "",
        ];
    const lines = [
      ...header,
      "#define NOB_IMPLEMENTATION",
      '#include "nob.h"',
      "",
      "int main(int argc, char **argv)",
      "{",
    ];

    if (config.selfRebuild) {
      lines.push("    NOB_GO_REBUILD_URSELF(argc, argv);", "");
    }

    if (config.outputDir) {
      lines.push(`    if (!nob_mkdir_if_not_exists("${cString(config.outputDir)}")) return 1;`, "");
    }

    lines.push("    Nob_Cmd cmd = {0};");
    lines.push(formatCmdAppend(buildCommandArgs(config)));
    lines.push("");
    lines.push("    if (!nob_cmd_run(&cmd)) return 1;");
    lines.push("    return 0;");
    lines.push("}");
    return lines.join("\n");
  }

  function buildAssumptions(config) {
    const assumptions = [
      "Targets upstream nob.h main snapshot reviewed on 2026-05-24; generated code uses prefixed nob.h APIs.",
      "nob.h is expected to be available next to nob.c or adjusted manually after copying.",
      "Platform selection is an output naming and command-shape assumption, not a portability guarantee.",
      "MSVC, run/test/clean targets, static libraries, package discovery, repository scanning, and browser compilation are out of scope for V1.",
    ];
    if (config.platform === "windows-mingw") {
      assumptions.push("Windows output uses MinGW/GCC-style arguments with an .exe suffix; native MSVC flags are intentionally deferred.");
    }
    if (!config.selfRebuild) {
      assumptions.push("Self-rebuild is disabled, so nob.c edits require manual recompilation of the build program.");
    }
    return assumptions;
  }

  function buildBootstrap(config) {
    const exe = config.platform === "windows-mingw" ? "nob.exe" : "nob";
    return `${compilerCommands[config.compilerProfile]} -o ${exe} nob.c\n./${exe}`;
  }

  function buildModel(raw) {
    const normalized = normalizeConfig(raw);
    const code = normalized.valid ? generateNobC(normalized.config) : "";
    return {
      ...normalized,
      code,
      assumptions: buildAssumptions(normalized.config),
      bootstrap: buildBootstrap(normalized.config),
    };
  }

  function readRawConfig() {
    const raw = {};
    fields.forEach((name) => {
      const element = elements[name];
      raw[name] = element.type === "checkbox" ? element.checked : element.value;
    });
    return raw;
  }

  function renderList(target, messages) {
    target.replaceChildren();
    messages.forEach((message) => {
      const li = document.createElement("li");
      li.textContent = message.text;
      li.className = message.type;
      target.appendChild(li);
    });
  }

  function renderModel(model) {
    currentModel = model;
    elements.codePreview.textContent = model.valid ? model.code : "Resolve validation errors to generate nob.c.";
    elements.bootstrapCommand.textContent = model.bootstrap;
    elements.copyButton.disabled = !model.valid;
    elements.downloadButton.disabled = !model.valid;
    elements.statusLine.textContent = model.valid
      ? `${model.config.sources.length} source file(s), output ${model.config.outputPath}`
      : `${model.messages.errors.length} blocking issue(s)`;

    const validationMessages = [];
    model.messages.errors.forEach((text) => validationMessages.push({ type: "error", text }));
    model.messages.warnings.forEach((text) => validationMessages.push({ type: "warning", text }));
    if (validationMessages.length === 0) {
      validationMessages.push({ type: "ok", text: "Configuration is valid. Copy and download are enabled." });
    }
    renderList(elements.validationList, validationMessages);
    renderList(elements.assumptionsList, model.assumptions.map((text) => ({ type: "ok", text })));

    elements.summaryPills.replaceChildren();
    [model.config.compilerProfile, model.config.platform, model.config.buildProfile, model.config.warningProfile].forEach((text) => {
      const pill = document.createElement("span");
      pill.textContent = text;
      elements.summaryPills.appendChild(pill);
    });
  }

  function refresh() {
    renderModel(buildModel(readRawConfig()));
  }

  async function copyCurrent() {
    if (!currentModel || !currentModel.valid) return;
    try {
      await navigator.clipboard.writeText(currentModel.code);
      elements.statusLine.textContent = "Copied current generated nob.c.";
    } catch (error) {
      elements.statusLine.textContent = "Copy failed. Select the preview and copy manually.";
    }
  }

  function downloadCurrent() {
    if (!currentModel || !currentModel.valid) return;
    const blob = new Blob([currentModel.code], { type: "text/x-csrc;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nob.c";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  const fixtureConfigs = {
    default_unix_debug: { ...defaultConfig },
    multi_source_with_includes_and_libs: {
      ...defaultConfig,
      projectName: "libs-demo",
      targetName: "demo",
      sources: "src/main.c\nsrc/audio.c",
      includePaths: "include\nthird_party/raylib/include",
      libraries: "-lm\n-lraylib",
      warningProfile: "strict",
    },
    windows_mingw_debug: {
      ...defaultConfig,
      platform: "windows-mingw",
    },
    self_rebuild_disabled: {
      ...defaultConfig,
      selfRebuild: false,
    },
  };

  const fixtureSnapshots = {
    default_unix_debug: `// Generated by nob.c Boilerplate Generator
// Project: hello-nob
// Assumption: nob.h is available next to this file.

#define NOB_IMPLEMENTATION
#include "nob.h"

int main(int argc, char **argv)
{
    NOB_GO_REBUILD_URSELF(argc, argv);

    if (!nob_mkdir_if_not_exists("build")) return 1;

    Nob_Cmd cmd = {0};
    nob_cmd_append(&cmd,
        "cc",
        "-Wall",
        "-Wextra",
        "-g",
        "-O0",
        "-o",
        "build/hello",
        "src/main.c"
    );

    if (!nob_cmd_run(&cmd)) return 1;
    return 0;
}`,
    multi_source_with_includes_and_libs: `// Generated by nob.c Boilerplate Generator
// Project: libs-demo
// Assumption: nob.h is available next to this file.

#define NOB_IMPLEMENTATION
#include "nob.h"

int main(int argc, char **argv)
{
    NOB_GO_REBUILD_URSELF(argc, argv);

    if (!nob_mkdir_if_not_exists("build")) return 1;

    Nob_Cmd cmd = {0};
    nob_cmd_append(&cmd,
        "cc",
        "-Wall",
        "-Wextra",
        "-Wpedantic",
        "-g",
        "-O0",
        "-Iinclude",
        "-Ithird_party/raylib/include",
        "-o",
        "build/demo",
        "src/main.c",
        "src/audio.c",
        "-lm",
        "-lraylib"
    );

    if (!nob_cmd_run(&cmd)) return 1;
    return 0;
}`,
    windows_mingw_debug: `// Generated by nob.c Boilerplate Generator
// Project: hello-nob
// Assumption: nob.h is available next to this file.

#define NOB_IMPLEMENTATION
#include "nob.h"

int main(int argc, char **argv)
{
    NOB_GO_REBUILD_URSELF(argc, argv);

    if (!nob_mkdir_if_not_exists("build")) return 1;

    Nob_Cmd cmd = {0};
    nob_cmd_append(&cmd,
        "cc",
        "-Wall",
        "-Wextra",
        "-g",
        "-O0",
        "-o",
        "build/hello.exe",
        "src/main.c"
    );

    if (!nob_cmd_run(&cmd)) return 1;
    return 0;
}`,
    self_rebuild_disabled: `// Generated by nob.c Boilerplate Generator
// Project: hello-nob
// Assumption: nob.h is available next to this file.

#define NOB_IMPLEMENTATION
#include "nob.h"

int main(int argc, char **argv)
{
    if (!nob_mkdir_if_not_exists("build")) return 1;

    Nob_Cmd cmd = {0};
    nob_cmd_append(&cmd,
        "cc",
        "-Wall",
        "-Wextra",
        "-g",
        "-O0",
        "-o",
        "build/hello",
        "src/main.c"
    );

    if (!nob_cmd_run(&cmd)) return 1;
    return 0;
}`,
  };

  function runFixtureChecks() {
    const results = Object.entries(fixtureConfigs).map(([name, config]) => {
      const model = buildModel(config);
      const expected = fixtureSnapshots[name];
      const passed = model.valid && model.code === expected;
      return { name, passed };
    });
    return {
      passed: results.every((result) => result.passed),
      results,
    };
  }

  function showFixtureChecks() {
    const result = runFixtureChecks();
    const failed = result.results.filter((item) => !item.passed).map((item) => item.name);
    elements.checksResult.textContent = result.passed
      ? `Passed ${result.results.length} fixture checks.`
      : `Failed: ${failed.join(", ")}`;
  }

  function init() {
    fields.forEach((name) => {
      elements[name] = document.getElementById(name);
    });
    [
      "codePreview",
      "statusLine",
      "validationList",
      "assumptionsList",
      "bootstrapCommand",
      "copyButton",
      "downloadButton",
      "summaryPills",
      "runChecksButton",
      "checksResult",
    ].forEach((name) => {
      elements[name] = document.getElementById(name);
    });

    document.getElementById("configForm").addEventListener("input", refresh);
    document.getElementById("configForm").addEventListener("change", refresh);
    elements.copyButton.addEventListener("click", copyCurrent);
    elements.downloadButton.addEventListener("click", downloadCurrent);
    elements.runChecksButton.addEventListener("click", showFixtureChecks);
    refresh();
  }

  window.NobGenerator = {
    buildModel,
    generateNobC,
    normalizeConfig,
    runFixtureChecks,
  };

  init();
})();
