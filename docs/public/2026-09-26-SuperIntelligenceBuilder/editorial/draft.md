# A00 SuperIntelligenceBuilder
One real method. An imaginary API. A real coding agent.
A single C# file that turns a fluent chain into instructions for an installed coding agent.
No NuGet packages. .NET 10. C# 14. Three built-in adapters.
Copy SuperIntelligenceBuilder.cs into your project and write what you want the agent to do.
```csharp
SuperIntelligenceBuilder.WithFile("AGENTS.md")
    .CreateOrReplaceUtf8File("generated/hello.txt", "Hello!\n")
    .WithConciseOutput();
```
Those last two methods do not exist. The agent reads their meaning from this source.
# B00 Run the sample
Install the .NET 10 SDK and an authenticated supported agent.
Open a terminal in the extracted project folder.
```sh
dotnet build
dotnet run -- --preview
dotnet run -- --agent codex
```
Preview prints the exact prompt without probing an agent or creating files.
The real run asks the agent to write generated/hello.txt with Hello, super intelligence! followed by a newline.
A successful run prints the agent summary and the path to its JSON completion report.
If no agent is installed, the sample prints AgentNotFound and exits with code 3.
# C00 Install an agent
Choose one adapter. You do not need all three.
Codex | npm install -g @openai/codex | Run codex and sign in.
Claude Code | Use the official native installer | Run claude and sign in.
GitHub Copilot CLI | npm install -g @github/copilot | Run copilot and sign in; npm installation requires Node.js 22+.
Use the vendor installation pages for current operating-system requirements and authentication options.
The builder never installs software, logs in, or changes your selected agent after a task starts.
# D00 Copy the dependency
Copy only SuperIntelligenceBuilder.cs into an SDK-style .NET 10 project; it is included automatically.
The sample's Program.cs, project file and index.html are not library dependencies.
Keep the file's opening comment: it contains the portable installation guide, API contract and harness catalog.
Run from the original development checkout. CallerFilePath records where the caller was compiled.
Rebuild after moving or changing the caller; a deployed binary does not contain its source file.
# E00 How it works
WithFile performs all the work before the rest of the chain executes.
It validates paths, finds an agent, checks its CLI switches and takes the workspace lock.
It creates AGENTS.md only if missing; an existing file is preserved.
It sends the agent the caller path, line, member, source snapshot, instruction contents and a unique run ID.
The agent reads the real source and interprets only the chain at that call site.
A real success requires exit code 0 and a valid report marked completed for that run.
The returned dynamic object accepts the made-up calls and returns itself.
The chain never becomes a real C# builder implementation.
# F00 Write useful instructions
Use legal C# identifiers, literal arguments and an explicit output path.
```csharp
SuperIntelligenceBuilder.WithFile("AGENTS.md")
    .WriteMarkdownFile("generated/review.md")
    .SummarizeThePublicTypesIn("src")
    .IncludeKnownLimitations()
    .DoNotModifySourceCode();
```
Use precise requests. The wrapper cannot make an ambiguous instruction deterministic.
Do not pass runtime secrets, computed values or side-effecting expressions.
C# still evaluates method arguments after the agent has finished.
Unknown methods and property reads are swallowed; real object members retain their normal behavior.
Execution is reserved for the structured result. Awaiting the sink and arithmetic on it are unsupported.
# G00 Configure a run
```csharp
using var cancel = new System.Threading.CancellationTokenSource();
var options = new SuperIntelligenceBuilder.Options
{
    Agent = SuperIntelligenceBuilder.AgentKind.Codex,
    Timeout = System.TimeSpan.FromMinutes(5)
};
dynamic task = SuperIntelligenceBuilder.WithFile("AGENTS.md", options, cancel.Token)
    .CreateOrReplaceUtf8File("generated/note.txt", "Done.\n");
SuperIntelligenceBuilder.RunResult result = task.Execution;
System.Console.WriteLine(result.Summary);
```
Agent | Explicit adapter; otherwise SUPER_INTELLIGENCE_AGENT, then Codex, Claude, Copilot discovery.
ExecutablePath | Absolute executable or JS entry file; requires an explicit adapter. Environment: SUPER_INTELLIGENCE_EXECUTABLE.
WorkingDirectory | Defaults to the nearest project/repository marker above the caller; source and instructions must remain inside it.
Model | Provider-supported model ID; otherwise SUPER_INTELLIGENCE_MODEL or the CLI's own default.
Timeout | Task deadline, 10 minutes by default; allowed range is 1 millisecond to 1 day.
ProbeTimeout | Deadline per version/help probe, 15 seconds by default; same allowed range.
Preview | Return the prompt in Execution.PreviewPrompt; do not probe, launch or create files.
CancellationToken | Pass it to WithFile; the sample connects Ctrl+C to cancellation.
Windows npm command shims are resolved through the installed package manifest and node.exe; no command shell is used.
Only absolute PATH entries are searched. Aliases, shell functions, relative PATH entries and nonstandard Windows shims are not supported.
# H00 Permissions and completion
Codex uses workspace-write with approval set to never and sandbox command networking disabled.
Claude receives Read, Glob, Grep, Edit and Write tools with edit approval; MCP configuration is restricted to an empty set.
Copilot receives a file-tool allowlist, read/write permissions, shell/URL denials and disabled built-in MCP servers.
Claude and Copilot tasks that need shell commands or network tools should report blocked.
Existing CLI settings and hooks still matter. This wrapper is not an OS sandbox for untrusted code.
Prompts travel through UTF-8 stdin; paths and source snapshots are JSON data, not shell commands.
This avoids shell interpolation, but it does not prevent model prompt injection from untrusted source.
Reports are stored under .superintelligence/runs/<run-id>/result.json.
```json
{"protocol":"super-intelligence-builder/v1","runId":"<run-id>","status":"completed","summary":"Created the requested file.","changedFiles":["generated/hello.txt"]}
```
A report is an agent assertion, not independent proof that the result is correct.
Review the actual files. The self-reported changedFiles list is not a complete filesystem diff.
Timeouts, cancellation and failures can leave partial changes. The builder never rolls them back.
# I00 Diagnose failures
AgentNotFound | Install an adapter, sign in, reopen the terminal and verify its executable is on PATH.
IncompatibleAgent | Update the selected CLI and inspect --help; required switches were absent or a probe failed.
LaunchFailed | Check executable permissions, Node.js for JS entry points and whether the CLI accepts piped input.
AgentFailed | Read the inherited console diagnostics; check login, model access and provider availability.
TimedOut | Review partial edits and the deadline before rerunning; sample exit code 124.
TaskBlocked / TaskFailed | Read the report's explanation. The wrapper does not retry or switch agents.
InvalidReport | The process exited without a valid matching completion report; do not assume the task finished.
Busy | Another builder may own the workspace lock, or its directory is not writable.
InvalidInput / FileAccess | Check UTF-8 files, .md instruction extension, workspace paths and filesystem permissions.
Cancelled | Ctrl+C returns 130. Process-tree termination is attempted; detached or remote jobs may survive.
Ordinary library failures throw BuilderException with Error and optional AgentExitCode; callers decide how to handle them.
# J00 Harness catalog
Only Codex, Claude Code and GitHub Copilot CLI have built-in adapters in this release.
Gemini CLI | Headless prompts and structured output.
OpenCode | Terminal agent with noninteractive opencode run.
Aider | Scripted repository edits with --message or --message-file.
Cursor CLI | Headless agent separate from the editor UI.
Cline | Terminal/headless workflows and editor tooling.
Continue CLI | Noninteractive tasks with cn -p.
OpenHands | Headless tasks and programmable agent runtimes.
Pi | Extensible terminal coding harness.
Roo Code | Editor-oriented coding agent tooling.
Cascade | Windsurf-origin IDE agent, now documented under Devin Desktop.
These are catalog entries, not fallback executables or a popularity ranking.
# K00 Limits and verification
Source files are limited to 1 MiB, instruction text to 256 KiB and reports to 64 KiB; UTF-8 is required.
Symlinks and reparse points within the selected workspace path are rejected, but path checks are not a race-proof sandbox.
The lock coordinates only the same workspace; overlapping parent and child workspaces need external coordination.
The inherited recursion guard suppresses builder calls made by the agent's child processes.
Use normal JIT builds. NativeAOT, trimming and source-free deployment are outside this design.
Provider execution is nondeterministic. No wrapper can guarantee that natural-language requests produce correct code.
Build and runtime verification status is recorded in VALIDATION.md; no tests or binaries are shipped.
# L00 Sources and page design
CLI switches and installation guidance were checked against official vendor documentation on 2026-09-26.
The page uses SQLite's compact topic navigation, Python's guide/reference distinction and Diataxis's task-oriented organization as design references.
The layout, type treatment, code annotation and styling are original to this project.
This page works offline: its styles, scripts and illustrations are embedded; only external reference links require a connection.
