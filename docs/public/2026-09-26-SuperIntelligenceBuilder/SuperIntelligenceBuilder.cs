/*
A00 - SuperIntelligenceBuilder 1.0: the API that does not exist

Copy this file into a .NET 10 / C# 14 project. No NuGet dependencies, generator,
services, or companion source files are required. Normal JIT compilation is
required: dynamic dispatch is not a NativeAOT/trimming-friendly contract.

    SuperIntelligenceBuilder.WithFile("AGENTS.md")
        .CreateFile("generated/hello.txt", "Hello, super intelligence!")
        .WithConciseOutput()
        .MakeItActuallyGood();

Only WithFile performs work. It creates an empty instruction file if missing,
launches an installed coding agent, and waits for it to read the CALLER'S C#
source. The agent interprets the fluent chain as natural-language instructions
and edits the workspace. The CLR then swallows the imaginary calls. There is
no parser for the DSL and no attempt to implement its fictitious members.
This is a deliberately absurd interface with a real process runner underneath.

B00 - Quick start and distribution

Install the .NET 10 SDK: https://dotnet.microsoft.com/download/dotnet/10.0
Unzip the sample, enter its directory, run `dotnet build`, then `dotnet run`.
`dotnet run -- --help` lists the sample's options. `dotnet run -- --preview`
prints the complete planned prompt without an agent, file creation, or probes.
For an explicit adapter: `dotnet run -- --agent codex` (or claude / copilot).
Copy ONLY SuperIntelligenceBuilder.cs into another SDK-style .NET 10 project;
the SDK includes it automatically. You can instead link the file with a
Compile Include/Link item. Its explicit using directives do not require
ImplicitUsings. Do not include two copies in the same compilation.

C00 - Installation and authentication (official references checked 2026-09-26)

Codex: npm install -g @openai/codex; then run `codex` and sign in.
  https://developers.openai.com/codex/cli
  https://developers.openai.com/codex/cli/reference
Claude Code: use the native installer from the official setup page and run
  `claude` to sign in. Existing npm installs of @anthropic-ai/claude-code are
  also recognized. https://code.claude.com/docs/en/setup
  https://code.claude.com/docs/en/cli-reference
  https://code.claude.com/docs/en/headless
Copilot CLI: npm install -g @github/copilot (Node.js 22+), or the native
  installer; run `copilot` and complete its login flow.
  https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli
  https://docs.github.com/en/copilot/how-tos/copilot-cli/automate-copilot-cli/run-cli-programmatically
  https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-programmatic-reference

Use the vendor's current system requirements and an account authorized for the
chosen model. Installation is not authentication. This library never installs,
updates, logs in, retries a paid task, or falls back to another agent after a
launch. Provider billing, credentials, settings, hooks, and network access are
owned by the CLI. First run it interactively in a trusted workspace.

D01 - Discovery and actual invocation

Selection: Options.Agent, then SUPER_INTELLIGENCE_AGENT, then PATH order within
codex -> claude -> copilot. Invalid overrides fail. Only absolute PATH entries
are searched; empty entries, relative entries, aliases, and shell functions are
ignored. An explicit Options.ExecutablePath (or SUPER_INTELLIGENCE_EXECUTABLE)
requires an explicit adapter. No arbitrary command strings or extra flags.
On Windows .exe files launch directly. Standard npm .cmd shims are resolved
through the adjacent known package.json bin entry and node.exe; cmd.exe is
never invoked. Nonstandard shims fail with an actionable error. On Unix,
executables/shebang scripts launch directly. PATH and installed packages must
be trusted. Symlinks to installed executables are allowed.

Each real run probes --version and --help with bounded output and time, then
checks required switches. Codex also probes `exec --help`. These checks detect
missing interfaces, not every semantic CLI change. Native Windows/macOS and
real authenticated provider runs must be validated in your deployment.

The prompt is UTF-8 on stdin, never shell text or a command-line argument:
  codex --ask-for-approval never exec --sandbox workspace-write
        --skip-git-repo-check -c sandbox_workspace_write.network_access=false -
  claude --print --permission-mode acceptEdits --tools Read,Glob,Grep,Edit,Write
         --allowedTools Read,Glob,Grep,Edit,Write --strict-mcp-config
         --mcp-config {"mcpServers":{}} --disallowedTools mcp__*
         --disable-slash-commands
  copilot --no-ask-user --allow-tool read --allow-tool write
          --deny-tool shell --deny-tool url --disable-builtin-mcps
          --available-tools view,create,edit,apply_patch,glob,grep

Copilot's piped-input mode must NOT also receive -p: that overrides stdin.
All adapters optionally receive --model as one ArgumentList element. Select a
provider-supported model ID using Options.Model / SUPER_INTELLIGENCE_MODEL;
no guessed model identifier is hard-coded. Local CLI defaults otherwise apply.
Claude/Copilot only receive file-tool permissions, so DSL tasks requiring
builds, shell execution, or network tools should report blocked. Codex may run
commands inside its workspace sandbox. These permission systems are different;
this wrapper does not pretend they provide an identical security boundary.

E00 - Contract, context, and completion

WithFile accepts Options, CancellationToken, and compiler-provided caller path,
line, and member. Relative instruction paths resolve from the caller directory.
The default workspace is the nearest ancestor with a csproj/sln/slnx/global.json
or .git marker, or the caller directory. Set Options.WorkingDirectory explicitly
for a larger repo. Source and instruction file must be inside it. Markdown
instruction files must end in .md. Existing files are preserved byte-for-byte
by the runner; the DSL can explicitly ask the agent to edit them.

The prompt includes a unique run ID, exact call site, UTF-8 source snapshot,
SHA-256, instruction contents, workspace, adapter, and completion schema. The
agent must read the real source, find the one WithFile at the given line/member,
interpret only that chain, respect applicable project instructions, and write a
run-specific JSON report. Ambiguity or missing values must produce a blocked
report, not invented requirements. A report can say completed, blocked, failed.

The returned dynamic object reserves the REAL property Execution (RunResult).
Read it after chaining to inspect agent/version/paths/summary/changed files.
Preview and recursion suppression set the corresponding ResultState. A real
success needs BOTH exit code 0 and a valid matching completed report. The report
is the agent's assertion, not a proof of functional correctness. ChangedFiles
is self-reported and validated for workspace-relative paths, not a full diff.
Review actual edits. Reports live in .superintelligence/runs/<id>/result.json.
The directory and a persistent workspace lock file are intentionally retained.

F00 - Runtime limits and errors

Default task timeout: 10 minutes; probe timeout: 15 seconds per probe. Options
are immutable records. Cancellation and timeouts attempt process-tree kill,
then wait at most 5 seconds. Detached children/remote jobs cannot be guaranteed
to stop; edits are NOT transactional and are never automatically rolled back.
Output/error stream directly to the parent console, avoiding buffered-output
deadlocks and retaining provider diagnostics. stdin writes are cancellable.
A nonzero exit never becomes success, even if a completion report exists.

BuilderException has an Error code and optional AgentExitCode. The sample
prints concise errors and exits nonzero; Ctrl+C returns 130. File, path, process,
JSON, discovery, timeout, and protocol failures are surfaced with context.
No supported agent produces AgentNotFound and installation guidance, before
creating AGENTS.md. Existing instructions are not truncated. Concurrent runs
in the SAME workspace fail Busy; overlapping parent/child workspaces require
external coordination. A child environment recursion guard makes nested calls
no-ops, preventing an agent's `dotnet run` from launching another agent.

G00 - Important boundaries

CallerFilePath is a compile-time path, not deployed source discovery. Run from
the original development checkout with unchanged caller source; PathMap,
#line directives, generated callers, moved binaries, wrappers, and multiple
WithFile calls on one line can make the location misleading. For wrappers,
forward all three caller metadata arguments explicitly. The agent blocks when
it cannot identify the expression. Source is bounded to 1 MiB, instruction text
to 256 KiB, completion reports to 64 KiB. Files must be UTF-8 (BOM accepted).

Arguments to fictional methods ARE evaluated by C# after WithFile returns.
Use literal strings/numbers, not side effects or runtime secrets. Do not put
an awaited chain, arbitrary operator expressions, or branches on the sink.
Unknown methods, reads, and index reads return the sink; assignments are ignored.
Real object members (GetType, ToString, Equals, Execution, etc.) retain their
real meaning. Names must be valid C#. The tail is not an end-of-chain trigger.
Each WithFile is a synchronous, independent agent run; it is not a background job.

ArgumentList + stdin prevents shell/option injection from prompt strings. JSON
encoding keeps paths and snapshots structurally separate. Neither technique
prevents model prompt injection: trusted source/AGENTS files are instructions.
Secrets in source may be sent to the provider. Existing CLI hooks/settings can
execute code; this runner is not a sandbox for an untrusted repo or executable.
Use OS isolation when needed. Workspace path checks reject symlinks/reparse
points within the selected root, but are not a race-proof filesystem sandbox.
There are no bypass-sandbox, allow-all, or unrestricted approval flags here.

H00 - Harness landscape (catalog, not a popularity ranking)

The following are relevant modern coding harnesses. ONLY the first three have
built-in adapters in this version. The remaining entries are intentionally not
auto-launched: distinct tool policies, authentication and completion protocols
need their own reviewed adapters. IDE/cloud products are not CLI substitutes.

Codex CLI              Built-in; sandboxed noninteractive `codex exec`.
Claude Code            Built-in; print mode and selectable file tools.
GitHub Copilot CLI     Built-in; stdin programmatic mode and tool policies.
Gemini CLI             Catalog; headless prompts and JSON output.
  https://geminicli.com/docs/cli/headless/
OpenCode               Catalog; `opencode run`, provider-configured terminal agent.
  https://opencode.ai/v2/docs/cli
Aider                  Catalog; scripted editing via --message/--message-file.
  https://aider.chat/docs/scripting.html
Cursor CLI             Catalog; headless agent distinct from the editor UI.
  https://cursor.com/docs/cli/overview
Cline                  Catalog; terminal/headless workflows plus editor tooling.
  https://docs.cline.bot/usage/cli-overview
Continue CLI           Catalog; `cn -p` for noninteractive tasks.
  https://docs.continue.dev/cli/headless-mode
OpenHands              Catalog; headless tasks and programmable agent runtimes.
  https://docs.openhands.dev/openhands/usage/cli/headless
Pi                     Catalog; extensible terminal coding harness.
  https://pi.dev/docs/latest/quickstart
Roo Code               Catalog; editor-oriented coding agent tooling.
  https://roocodeinc.github.io/Roo-Code/
Cascade                Catalog; Windsurf-origin IDE agent, now documented at:
  https://docs.devin.ai/desktop/cascade/cascade

These links are the maintenance sources, not promises that future CLI versions
are compatible. For a new adapter, explicitly define discovery, safe argument
transport, working-directory semantics, permissions, cancellation, and report
validation; never route a harness through a caller-supplied shell command.
*/

#nullable enable

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

/// <summary>A single-source-file bridge from an imaginary fluent API to a real coding agent.</summary>
public static class SuperIntelligenceBuilder
{
    private const string Guard = "SUPER_INTELLIGENCE_BUILDER_ACTIVE";
    private const int SourceLimit = 1_048_576;
    private static readonly UTF8Encoding Utf8 = new(false, true);
    private static readonly JsonSerializerOptions Json = new() { WriteIndented = true };
    private static readonly StringComparison PathComparison = OperatingSystem.IsWindows()
        ? StringComparison.OrdinalIgnoreCase : StringComparison.Ordinal;

    public enum AgentKind { Codex, Claude, Copilot }
    public enum ResultState { Completed, Preview, RecursionSuppressed }
    public enum ErrorCode
    {
        InvalidInput, AgentNotFound, IncompatibleAgent, LaunchFailed, AgentFailed,
        TimedOut, Busy, FileAccess, InvalidReport, TaskBlocked, TaskFailed
    }

    public sealed record Options
    {
        public AgentKind? Agent { get; init; }
        public string? ExecutablePath { get; init; }
        public string? WorkingDirectory { get; init; }
        public string? Model { get; init; }
        public TimeSpan Timeout { get; init; } = TimeSpan.FromMinutes(10);
        public TimeSpan ProbeTimeout { get; init; } = TimeSpan.FromSeconds(15);
        public bool Preview { get; init; }
    }

    public sealed record RunResult(
        ResultState State, string RunId, AgentKind? Agent, string? AgentVersion,
        string WorkingDirectory, string InstructionFile, string? ReportFile,
        string Summary, IReadOnlyList<string> ChangedFiles, string? PreviewPrompt = null);

    public sealed class BuilderException : Exception
    {
        public ErrorCode Error { get; }
        public int? AgentExitCode { get; }
        internal BuilderException(ErrorCode error, string message, Exception? inner = null,
            int? exitCode = null) : base(message, inner)
        {
            Error = error;
            AgentExitCode = exitCode;
        }
    }

    /// <summary>Run the agent now, then return a sink accepting imaginary fluent calls.</summary>
    public static dynamic WithFile(
        string fileName,
        Options? options = null,
        CancellationToken cancellationToken = default,
        [CallerFilePath] string sourceFile = "",
        [CallerLineNumber] int sourceLine = 0,
        [CallerMemberName] string sourceMember = "")
    {
        if (Environment.GetEnvironmentVariable(Guard) == "1")
            return new FluentVoid(new RunResult(ResultState.RecursionSuppressed, "", null,
                null, "", "", null, "Nested agent launch suppressed.", Array.Empty<string>()));
        try
        {
            return new FluentVoid(ExecuteAsync(fileName, options ?? new Options(),
                sourceFile, sourceLine, sourceMember, cancellationToken).GetAwaiter().GetResult());
        }
        catch (BuilderException) { throw; }
        catch (OperationCanceledException) { throw; }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
        {
            throw new BuilderException(ErrorCode.FileAccess,
                $"Cannot access a required file: {ex.Message}", ex);
        }
        catch (Exception ex) when (ex is ArgumentException or NotSupportedException)
        {
            throw new BuilderException(ErrorCode.InvalidInput, ex.Message, ex);
        }
    }

    private static async Task<RunResult> ExecuteAsync(string fileName, Options options,
        string sourceFile, int sourceLine, string sourceMember, CancellationToken cancellation)
    {
        cancellation.ThrowIfCancellationRequested();
        ValidateTimeout(options.Timeout, nameof(options.Timeout));
        ValidateTimeout(options.ProbeTimeout, nameof(options.ProbeTimeout));
        if (string.IsNullOrWhiteSpace(sourceFile) || !Path.IsPathFullyQualified(sourceFile))
            throw Failure(ErrorCode.InvalidInput, "Caller source must be an absolute existing path.");
        sourceFile = Path.GetFullPath(sourceFile);
        var workspace = Path.GetFullPath(options.WorkingDirectory ?? FindWorkspace(sourceFile));
        if (!Directory.Exists(workspace))
            throw Failure(ErrorCode.InvalidInput, $"Workspace does not exist: {workspace}");
        CheckContained(workspace, sourceFile);
        RejectLinks(workspace, sourceFile);
        var source = ReadUtf8(sourceFile, SourceLimit);
        if (sourceLine < 1 || sourceLine > source.Count(c => c == '\n') + 1)
            throw Failure(ErrorCode.InvalidInput, "Caller line is outside the source file. Rebuild from this checkout.");
        if (string.IsNullOrWhiteSpace(fileName) || !fileName.EndsWith(".md", StringComparison.OrdinalIgnoreCase))
            throw Failure(ErrorCode.InvalidInput, "The instruction file must have a nonempty .md path.");
        var instructions = Path.GetFullPath(fileName, Path.GetDirectoryName(sourceFile)!);
        CheckContained(workspace, instructions);
        RejectLinks(workspace, instructions);
        var instructionText = File.Exists(instructions) ? ReadUtf8(instructions, 262_144) : "";
        var requested = options.Agent ?? ParseAgent(Environment.GetEnvironmentVariable("SUPER_INTELLIGENCE_AGENT"));
        if (requested is not null && !Enum.IsDefined(requested.Value))
            throw Failure(ErrorCode.InvalidInput, "Unknown agent enum value.");
        var executable = options.ExecutablePath ?? Environment.GetEnvironmentVariable("SUPER_INTELLIGENCE_EXECUTABLE");
        var model = options.Model ?? Environment.GetEnvironmentVariable("SUPER_INTELLIGENCE_MODEL");
        if (model is not null && (string.IsNullOrWhiteSpace(model) || model.Length > 200 || model.StartsWith('-') || model.Any(char.IsWhiteSpace) || model.Any(char.IsControl)))
            throw Failure(ErrorCode.InvalidInput, "Model must be an identifier of at most 200 characters, without whitespace/control characters or a leading dash.");
        if (!string.IsNullOrEmpty(executable) && requested is null)
            throw Failure(ErrorCode.InvalidInput, "An explicit executable requires an explicit agent adapter.");
        var id = Guid.NewGuid().ToString("N");
        var stateDirectory = Path.Combine(workspace, ".superintelligence");
        var reportFile = Path.Combine(stateDirectory, "runs", id, "result.json");
        RejectLinks(workspace, reportFile);

        if (options.Preview)
        {
            var preview = BuildPrompt(id, requested, workspace, sourceFile, sourceLine,
                sourceMember, source, instructions, instructionText, reportFile);
            return new RunResult(ResultState.Preview, id, requested, null, workspace,
                instructions, null, "Preview only; no agent was probed or launched.",
                Array.Empty<string>(), preview);
        }

        var launch = ResolveAgent(requested, executable);
        var version = await ProbeAsync(launch, ["--version"], workspace, options.ProbeTimeout, cancellation).ConfigureAwait(false);
        var help = await ProbeAsync(launch, ["--help"], workspace, options.ProbeTimeout, cancellation).ConfigureAwait(false);
        if (launch.Kind == AgentKind.Codex)
            help += await ProbeAsync(launch, ["exec", "--help"], workspace, options.ProbeTimeout, cancellation).ConfigureAwait(false);
        foreach (var flag in RequiredFlags(launch.Kind).Concat(model is null ? [] : new[] { "--model" }))
            if (!help.Contains(flag, StringComparison.Ordinal))
                throw Failure(ErrorCode.IncompatibleAgent,
                    $"{launch.Kind} does not advertise {flag}. Update that CLI and check its --help. Resolved: {launch.FileName}");

        cancellation.ThrowIfCancellationRequested();
        if (ReadUtf8(sourceFile, SourceLimit) != source)
            throw Failure(ErrorCode.InvalidInput, "Caller source changed during preflight. Rebuild and retry.");
        Directory.CreateDirectory(stateDirectory);
        var lockPath = Path.Combine(stateDirectory, "workspace.lock");
        RejectLinks(workspace, lockPath);
        using var workspaceLock = AcquireLock(lockPath);
        Directory.CreateDirectory(Path.GetDirectoryName(instructions)!);
        RejectLinks(workspace, instructions);
        // CreateNew is atomic and never truncates a file created by another process.
        if (!File.Exists(instructions))
        {
            try { using var created = new FileStream(instructions, FileMode.CreateNew, FileAccess.Write, FileShare.Read); }
            catch (IOException) when (File.Exists(instructions)) { /* Preserve the winner. */ }
        }
        RejectLinks(workspace, instructions);
        instructionText = ReadUtf8(instructions, 262_144);
        Directory.CreateDirectory(Path.GetDirectoryName(reportFile)!);
        var prompt = BuildPrompt(id, launch.Kind, workspace, sourceFile, sourceLine,
            sourceMember, source, instructions, instructionText, reportFile);
        var args = AgentArguments(launch.Kind).ToList();
        if (model is not null) args.AddRange(["--model", model]);
        if (launch.Kind == AgentKind.Codex) args.Add("-");
        var exit = await RunProcessAsync(launch, args, workspace, prompt,
            options.Timeout, cancellation, capture: false).ConfigureAwait(false);
        if (exit.ExitCode != 0)
            throw new BuilderException(ErrorCode.AgentFailed,
                $"{launch.Kind} exited with code {exit.ExitCode}. See its console diagnostics; verify login, model access and CLI version. Partial edits may remain. Run: {id}",
                exitCode: exit.ExitCode);
        return ReadReport(id, launch.Kind, version.Trim(), workspace, instructions, reportFile);
    }

    private sealed record Launch(AgentKind Kind, string FileName, string[] Prefix);
    private sealed record ProcessResult(int ExitCode, string Output);

    private static AgentKind? ParseAgent(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return value.Trim().ToLowerInvariant() switch
        {
            "codex" => AgentKind.Codex, "claude" => AgentKind.Claude, "copilot" => AgentKind.Copilot,
            _ => throw Failure(ErrorCode.InvalidInput,
                "SUPER_INTELLIGENCE_AGENT must be codex, claude, or copilot.")
        };
    }

    private static Launch ResolveAgent(AgentKind? requested, string? explicitPath)
    {
        if (!string.IsNullOrEmpty(explicitPath))
        {
            if (!Path.IsPathFullyQualified(explicitPath) || !File.Exists(explicitPath))
                throw Failure(ErrorCode.AgentNotFound, "ExecutablePath must be an absolute existing file path.");
            return MakeLaunch(requested!.Value, Path.GetFullPath(explicitPath));
        }
        foreach (var kind in requested.HasValue ? new[] { requested.Value } : Enum.GetValues<AgentKind>())
        {
            var command = kind.ToString().ToLowerInvariant();
            var path = FindOnPath(command, allowNpmShim: true);
            if (path is not null) return MakeLaunch(kind, path);
        }
        throw Failure(ErrorCode.AgentNotFound,
            $"{(requested.HasValue ? "The " + requested.Value + " executable" : "A supported coding agent")} was not found on absolute PATH entries. " +
            "Install and sign in to Codex (npm install -g @openai/codex), Claude Code (https://code.claude.com/docs/en/setup), " +
            "or Copilot CLI (npm install -g @github/copilot), then reopen your terminal. " +
            "Alternatively set Options.Agent and Options.ExecutablePath.");
    }

    private static string? FindOnPath(string command, bool allowNpmShim)
    {
        var suffixes = OperatingSystem.IsWindows()
            ? (allowNpmShim ? new[] { ".exe", ".cmd" } : new[] { ".exe" }) : new[] { "" };
        foreach (var part in (Environment.GetEnvironmentVariable("PATH") ?? "").Split(Path.PathSeparator))
        {
            var directory = part.Trim().Trim('"');
            if (!Path.IsPathFullyQualified(directory)) continue;
            foreach (var suffix in suffixes)
            {
                var path = Path.Combine(directory, command + suffix);
                if (!File.Exists(path)) continue;
                if (!OperatingSystem.IsWindows())
                {
                    try
                    {
                        var mode = File.GetUnixFileMode(path);
                        if ((mode & (UnixFileMode.UserExecute | UnixFileMode.GroupExecute | UnixFileMode.OtherExecute)) == 0)
                            continue;
                    }
                    catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { continue; }
                }
                return Path.GetFullPath(path);
            }
        }
        return null;
    }

    private static Launch MakeLaunch(AgentKind kind, string path)
    {
        var extension = Path.GetExtension(path).ToLowerInvariant();
        if (OperatingSystem.IsWindows() && extension == ".cmd")
        {
            var package = kind switch
            {
                AgentKind.Codex => "@openai/codex", AgentKind.Claude => "@anthropic-ai/claude-code",
                _ => "@github/copilot"
            };
            var packageRoot = Path.Combine(Path.GetDirectoryName(path)!, "node_modules", package);
            var manifestPath = Path.Combine(packageRoot, "package.json");
            if (!File.Exists(manifestPath))
                throw Failure(ErrorCode.LaunchFailed, "Nonstandard Windows command shim. Use a native .exe or the package's JavaScript entry file explicitly.");
            try
            {
                using var manifest = JsonDocument.Parse(ReadUtf8(manifestPath, 262_144));
                var root = manifest.RootElement;
                if (root.GetProperty("name").GetString() != package)
                    throw new JsonException("Unexpected npm package name.");
                var bin = root.GetProperty("bin");
                var entry = bin.ValueKind == JsonValueKind.String ? bin.GetString()
                    : bin.GetProperty(kind.ToString().ToLowerInvariant()).GetString();
                if (string.IsNullOrWhiteSpace(entry)) throw new JsonException("Missing bin entry.");
                path = Path.GetFullPath(entry, packageRoot);
                CheckContained(packageRoot, path);
                if (!File.Exists(path)) throw new JsonException("The npm bin entry does not exist.");
                extension = Path.GetExtension(path).ToLowerInvariant();
            }
            catch (Exception ex) when (ex is JsonException or KeyNotFoundException or InvalidOperationException)
            {
                throw new BuilderException(ErrorCode.LaunchFailed, "Cannot resolve the standard npm shim. Reinstall the CLI or specify its native executable.", ex);
            }
        }
        if (extension is ".js" or ".mjs" or ".cjs")
        {
            var node = FindOnPath("node", allowNpmShim: false)
                ?? throw Failure(ErrorCode.AgentNotFound, "This CLI entry point requires Node.js on PATH.");
            return new Launch(kind, node, [path]);
        }
        if (OperatingSystem.IsWindows() && extension != ".exe")
            throw Failure(ErrorCode.LaunchFailed, "Windows requires a native .exe, standard npm .cmd shim, or JavaScript entry point. Shell scripts are not executed.");
        return new Launch(kind, path, []);
    }

    private static string[] RequiredFlags(AgentKind kind) => kind switch
    {
        AgentKind.Codex => ["--ask-for-approval", "--sandbox", "--skip-git-repo-check", "--config"],
        AgentKind.Claude => ["--print", "--permission-mode", "--tools", "--allowedTools",
            "--strict-mcp-config", "--mcp-config", "--disallowedTools", "--disable-slash-commands"],
        _ => ["--no-ask-user", "--allow-tool", "--deny-tool", "--disable-builtin-mcps", "--available-tools"]
    };

    private static string[] AgentArguments(AgentKind kind) => kind switch
    {
        AgentKind.Codex => ["--ask-for-approval", "never", "exec", "--sandbox", "workspace-write",
            "--skip-git-repo-check", "-c", "sandbox_workspace_write.network_access=false"],
        AgentKind.Claude => ["--print", "--permission-mode", "acceptEdits", "--tools", "Read,Glob,Grep,Edit,Write",
            "--allowedTools", "Read,Glob,Grep,Edit,Write", "--strict-mcp-config", "--mcp-config",
            "{\"mcpServers\":{}}", "--disallowedTools", "mcp__*", "--disable-slash-commands"],
        _ => ["--no-ask-user", "--allow-tool", "read", "--allow-tool", "write", "--deny-tool", "shell",
            "--deny-tool", "url", "--disable-builtin-mcps", "--available-tools", "view,create,edit,apply_patch,glob,grep"]
    };

    private static async Task<string> ProbeAsync(Launch launch, string[] args, string workspace,
        TimeSpan timeout, CancellationToken cancellation)
    {
        var result = await RunProcessAsync(launch, args, workspace, "", timeout, cancellation, capture: true).ConfigureAwait(false);
        if (result.ExitCode != 0)
            throw new BuilderException(ErrorCode.IncompatibleAgent,
                $"{launch.Kind} {string.Join(' ', args)} failed (exit {result.ExitCode}). {result.Output}", exitCode: result.ExitCode);
        return result.Output;
    }

    private static async Task<ProcessResult> RunProcessAsync(Launch launch, IEnumerable<string> arguments,
        string workspace, string input, TimeSpan timeout, CancellationToken cancellation, bool capture)
    {
        cancellation.ThrowIfCancellationRequested();
        var info = new ProcessStartInfo
        {
            FileName = launch.FileName, WorkingDirectory = workspace, UseShellExecute = false,
            RedirectStandardInput = true, RedirectStandardOutput = capture,
            RedirectStandardError = capture, StandardInputEncoding = Utf8, CreateNoWindow = capture
        };
        foreach (var arg in launch.Prefix.Concat(arguments)) info.ArgumentList.Add(arg);
        info.Environment[Guard] = "1";
        using var process = new Process { StartInfo = info };
        using var deadline = CancellationTokenSource.CreateLinkedTokenSource(cancellation);
        deadline.CancelAfter(timeout);
        try
        {
            if (!process.Start()) throw new Win32Exception("Process.Start returned false.");
        }
        catch (Exception ex) when (ex is Win32Exception or InvalidOperationException)
        {
            throw new BuilderException(ErrorCode.LaunchFailed,
                $"Could not start {launch.Kind} at {launch.FileName}: {ex.Message}", ex);
        }
        var stdout = capture ? DrainAsync(process.StandardOutput, deadline.Token) : Task.FromResult("");
        var stderr = capture ? DrainAsync(process.StandardError, deadline.Token) : Task.FromResult("");
        try
        {
            // A CLI may exit before accepting stdin; retain its exit status in that case.
            IOException? inputError = null;
            try
            {
                await process.StandardInput.WriteAsync(input.AsMemory(), deadline.Token).ConfigureAwait(false);
                await process.StandardInput.FlushAsync(deadline.Token).ConfigureAwait(false);
            }
            catch (IOException ex) { inputError = ex; }
            finally
            {
                if (deadline.IsCancellationRequested) await StopAsync(process).ConfigureAwait(false);
                try { process.StandardInput.Close(); }
                catch (IOException ex) { inputError ??= ex; }
            }
            await process.WaitForExitAsync(deadline.Token).ConfigureAwait(false);
            var output = await Task.WhenAll(stdout, stderr).WaitAsync(deadline.Token).ConfigureAwait(false);
            if (inputError is not null && process.ExitCode == 0)
                throw new BuilderException(ErrorCode.LaunchFailed, "The agent closed stdin before receiving the complete prompt.", inputError);
            return new ProcessResult(process.ExitCode, string.Join('\n', output));
        }
        catch (OperationCanceledException) when (deadline.IsCancellationRequested)
        {
            await StopAsync(process).ConfigureAwait(false);
            if (cancellation.IsCancellationRequested) throw new OperationCanceledException(cancellation);
            throw Failure(ErrorCode.TimedOut,
                $"{launch.Kind} {(capture ? "probe" : "task")} exceeded {timeout}. Process termination was attempted; partial edits may remain.");
        }
        catch
        {
            await StopAsync(process).ConfigureAwait(false);
            throw;
        }
        finally
        {
            await deadline.CancelAsync().ConfigureAwait(false);
            // Observe pending drain failures even when a broken child leaves pipes open.
            _ = Task.WhenAll(stdout, stderr).ContinueWith(t => { _ = t.Exception; },
                CancellationToken.None, TaskContinuationOptions.OnlyOnFaulted, TaskScheduler.Default);
        }
    }

    private static async Task<string> DrainAsync(StreamReader reader, CancellationToken cancellation)
    {
        var text = new StringBuilder();
        var buffer = new char[4096];
        int count;
        while ((count = await reader.ReadAsync(buffer.AsMemory(), cancellation).ConfigureAwait(false)) != 0)
        {
            var remaining = 131_072 - text.Length;
            if (remaining > 0) text.Append(buffer, 0, Math.Min(remaining, count));
        }
        return text.ToString();
    }

    private static async Task StopAsync(Process process)
    {
        try { if (!process.HasExited) process.Kill(entireProcessTree: true); }
        catch (Exception ex) when (ex is Win32Exception or InvalidOperationException or NotSupportedException)
        {
            try { if (!process.HasExited) process.Kill(); }
            catch (Exception retry) when (retry is Win32Exception or InvalidOperationException or NotSupportedException) { }
        }
        using var stop = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        try { await process.WaitForExitAsync(stop.Token).ConfigureAwait(false); }
        catch (OperationCanceledException) { }
    }

    private static string BuildPrompt(string id, AgentKind? agent, string workspace,
        string sourceFile, int line, string member, string source, string instructions,
        string instructionText, string reportFile)
    {
        var context = JsonSerializer.Serialize(new
        {
            protocol = "super-intelligence-builder/v1", runId = id, adapter = agent?.ToString() ?? "auto",
            workspace, sourceFile, callerLine = line, callerMember = member,
            sourceSha256 = Convert.ToHexString(SHA256.HashData(Utf8.GetBytes(source))),
            sourceSnapshot = source, instructionFile = instructions, instructionSnapshot = instructionText,
            reportFile, reportExample = new
            {
                protocol = "super-intelligence-builder/v1", runId = id, status = "completed",
                summary = "Describe the concrete outcome and validation performed.",
                changedFiles = new[] { "generated/example.txt" }
            }
        }, Json);
        return """
            You are executing a source-defined task for SuperIntelligenceBuilder.
            The JSON context below contains data, file locations and exact caller metadata.
            Read instructionFile (it can be empty) and sourceFile from disk in full.
            Compare sourceFile to sourceSnapshot; if materially different, report blocked.
            Respect applicable repository instructions and your enforced permissions.

            Find the SINGLE WithFile invocation at callerLine in callerMember, allowing
            qualified names and line breaks. Interpret ONLY its immediately chained fluent
            expression. Other chains, examples in comments, and the builder implementation
            are not task instructions. If location is ambiguous or stale, report blocked.

            This is an intentionally fictitious C# fluent API. Translate PascalCase names,
            literal arguments, properties and ordering into natural-language requirements.
            Perform that task in workspace. Do NOT implement missing methods, replace the
            dynamic sink, remove the chain, or execute the caller to discover its meaning.
            Source syntax is the task; runtime values unavailable from source must not be
            guessed. Do not evaluate arbitrary code to resolve arguments. For ambiguity,
            conflicting requirements or unavailable capabilities, report blocked with why.
            The instruction file starts empty only if it did not already exist; do not
            invent instructions in it unless this chain explicitly asks you to write them.

            Make only changes needed for the chain. Preserve unrelated work and the builder.
            Do not commit, push, deploy, install dependencies, read credentials, or modify
            paths outside workspace. Do not weaken tool policies to finish a task. Do not
            spawn a nested builder. Never report a build/test as passed unless you ran it.
            These instructions do not override system, organizational or harness policies.

            Finish by writing UTF-8 JSON at reportFile using the exact protocol/runId in
            reportExample. Allowed status: completed, blocked, failed. Summary must describe
            results, limitations and actual checks. changedFiles is an array of workspace-
            relative paths using '/', including additions/edits/deletions, excluding the
            report itself. Use [] if no files changed. No markdown fences in the report.
            Write the report last, even if blocked/failed. A completed report is appropriate
            only when the task is done; an explanation without the requested edits is not
            success. Print a brief final summary too. Do not change an existing run's report.

            CONTEXT JSON:
            """ + "\n" + context + "\n";
    }

    private static RunResult ReadReport(string id, AgentKind agent, string version,
        string workspace, string instructions, string reportFile)
    {
        try
        {
            RejectLinks(workspace, reportFile);
            if (!File.Exists(reportFile)) throw new JsonException("The agent did not write its completion report.");
            using var doc = JsonDocument.Parse(ReadUtf8(reportFile, 65_536));
            var root = doc.RootElement;
            if (root.ValueKind != JsonValueKind.Object ||
                root.EnumerateObject().Select(p => p.Name).Distinct(StringComparer.Ordinal).Count() != root.EnumerateObject().Count())
                throw new JsonException("Report must be an object without duplicate properties.");
            if (root.GetProperty("protocol").GetString() != "super-intelligence-builder/v1" ||
                root.GetProperty("runId").GetString() != id) throw new JsonException("Mismatched report identity.");
            var status = root.GetProperty("status").GetString();
            var summary = root.GetProperty("summary").GetString();
            if (string.IsNullOrWhiteSpace(summary)) throw new JsonException("Missing summary.");
            var files = root.GetProperty("changedFiles").EnumerateArray().Select(x => x.GetString()).ToArray();
            foreach (var file in files)
            {
                if (string.IsNullOrWhiteSpace(file) || file.Contains('\\') || file.Contains(':') ||
                    file.Any(char.IsControl) || Path.IsPathRooted(file) || file.Split('/').Any(p => p is ".." or "." or ""))
                    throw new JsonException("Changed paths must be normalized workspace-relative paths.");
                CheckContained(workspace, Path.GetFullPath(file, workspace));
            }
            if (status == "blocked") throw Failure(ErrorCode.TaskBlocked, $"Agent reported blocked: {summary} Report: {reportFile}");
            if (status == "failed") throw Failure(ErrorCode.TaskFailed, $"Agent reported failed: {summary} Report: {reportFile}");
            if (status != "completed") throw new JsonException("Unknown status.");
            return new RunResult(ResultState.Completed, id, agent, version, workspace,
                instructions, reportFile, summary, Array.AsReadOnly(files.Select(f => f!).ToArray()));
        }
        catch (Exception ex) when (ex is JsonException or KeyNotFoundException or InvalidOperationException)
        {
            throw new BuilderException(ErrorCode.InvalidReport,
                $"Agent exited but completion is unverified: {ex.Message} Report: {reportFile}", ex);
        }
    }

    private static FileStream AcquireLock(string path)
    {
        try { return new FileStream(path, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None); }
        catch (IOException ex)
        {
            throw new BuilderException(ErrorCode.Busy,
                $"Cannot acquire the workspace lock: {path}. Another run may be active, or the directory is not writable.", ex);
        }
    }

    private static string ReadUtf8(string path, int limit)
    {
        using var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read);
        if (stream.Length > limit) throw Failure(ErrorCode.InvalidInput, $"File exceeds the {limit}-byte limit: {path}");
        // Bounded even if another process grows the file after Length is checked.
        var bytes = new byte[limit + 1];
        var length = 0;
        while (length < bytes.Length)
        {
            var count = stream.Read(bytes, length, bytes.Length - length);
            if (count == 0) break;
            length += count;
        }
        if (length > limit) throw Failure(ErrorCode.InvalidInput, $"File grew beyond the {limit}-byte limit: {path}");
        var offset = length >= 3 && bytes[0] == 0xEF && bytes[1] == 0xBB && bytes[2] == 0xBF ? 3 : 0;
        return Utf8.GetString(bytes, offset, length - offset);
    }

    private static string FindWorkspace(string source)
    {
        var directory = Path.GetDirectoryName(source)!;
        for (var current = new DirectoryInfo(directory); current is not null; current = current.Parent)
        {
            if (File.Exists(Path.Combine(current.FullName, "global.json")) ||
                Directory.Exists(Path.Combine(current.FullName, ".git")) || File.Exists(Path.Combine(current.FullName, ".git")) ||
                Directory.EnumerateFiles(current.FullName, "*", SearchOption.TopDirectoryOnly)
                    .Any(f => Path.GetExtension(f) is ".csproj" or ".sln" or ".slnx")) return current.FullName;
        }
        return directory;
    }

    private static void CheckContained(string root, string path)
    {
        var prefix = Path.EndsInDirectorySeparator(Path.GetFullPath(root)) ? Path.GetFullPath(root)
            : Path.GetFullPath(root) + Path.DirectorySeparatorChar;
        if (!Path.GetFullPath(path).StartsWith(prefix, PathComparison))
            throw Failure(ErrorCode.InvalidInput, $"Path must be inside workspace {root}: {path}");
    }

    private static void RejectLinks(string root, string target)
    {
        CheckContained(root, target);
        FileSystemInfo current = new DirectoryInfo(root);
        Check(current);
        var relative = Path.GetRelativePath(root, target);
        var path = root;
        foreach (var part in relative.Split(Path.DirectorySeparatorChar))
        {
            path = Path.Combine(path, part);
            Check(Directory.Exists(path) ? new DirectoryInfo(path) : new FileInfo(path));
        }
        static void Check(FileSystemInfo item)
        {
            if (item.LinkTarget is not null || (item.Exists && (item.Attributes & FileAttributes.ReparsePoint) != 0))
                throw Failure(ErrorCode.InvalidInput, $"Symlinks/reparse points are not allowed within the workspace path: {item.FullName}");
        }
    }

    private static void ValidateTimeout(TimeSpan value, string name)
    {
        if (value < TimeSpan.FromMilliseconds(1) || value > TimeSpan.FromDays(1))
            throw Failure(ErrorCode.InvalidInput, $"{name} must be between 1 millisecond and 1 day.");
    }

    private static BuilderException Failure(ErrorCode code, string message) => new(code, message);

    private sealed class FluentVoid(RunResult execution) : DynamicObject
    {
        // Explicitly handled in TryGetMember because this nested type is private.
        public RunResult Execution { get; } = execution;
        public override bool TryInvokeMember(InvokeMemberBinder binder, object?[]? args, out object? result)
        { result = this; return true; }
        public override bool TryGetMember(GetMemberBinder binder, out object? result)
        { result = binder.Name == nameof(Execution) ? Execution : this; return true; }
        public override bool TrySetMember(SetMemberBinder binder, object? value) => true;
        public override bool TryInvoke(InvokeBinder binder, object?[]? args, out object? result)
        { result = this; return true; }
        public override bool TryGetIndex(GetIndexBinder binder, object[] indexes, out object? result)
        { result = this; return true; }
        public override bool TrySetIndex(SetIndexBinder binder, object[] indexes, object? value) => true;
    }
}
