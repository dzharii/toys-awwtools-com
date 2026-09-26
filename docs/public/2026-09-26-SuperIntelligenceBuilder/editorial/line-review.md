# A00 Line-by-line editorial review

All 135 physical lines of draft.md are quoted below. Each has a decision and a reason. Every recommendation is accepted in final.md and index.html.

### Line 001

> # A00 SuperIntelligenceBuilder

Keep the project name as the page's sole top-level title; advance its revision because this section changes.

### Line 002

> One real method. An imaginary API. A real coding agent.

Keep. It states the joke in three concrete clauses without claiming AI quality.

### Line 003

> A single C# file that turns a fluent chain into instructions for an installed coding agent.

Keep. This is the shortest useful definition of the mechanism.

### Line 004

> No NuGet packages. .NET 10. C# 14. Three built-in adapters.

Keep. The technical prerequisites and adapter count belong beside the definition.

### Line 005

> Copy SuperIntelligenceBuilder.cs into your project and write what you want the agent to do.

Remove. The dedicated integration section already gives this instruction more precisely.

### Line 006

> ```csharp

Keep. Mark this as C# for syntax treatment and copying.

### Line 007

> SuperIntelligenceBuilder.WithFile("AGENTS.md")

Keep. Show the one implemented entry point before the invented members.

### Line 008

>     .CreateOrReplaceUtf8File("generated/hello.txt", "Hello!\n")

Rewrite. Match the sample's exact output so the introductory example and quick start do not disagree.

Accepted replacement:

>     .CreateOrReplaceUtf8File("generated/hello.txt", "Hello, super intelligence!\n")

### Line 009

>     .WithConciseOutput();

Keep. This is a readable example of an invented policy method.

### Line 010

> ```

Keep. Close the code block; it is structural rather than prose.

### Line 011

> Those last two methods do not exist. The agent reads their meaning from this source.

Keep. Explain explicitly why the code is unusual instead of expecting readers to infer it.

### Line 012

> # B00 Run the sample

Keep the task-oriented heading; increment its revision after the prerequisite correction.

### Line 013

> Install the .NET 10 SDK and an authenticated supported agent.

Rewrite. Preview needs only the SDK; an authenticated agent is required for execution, not for reading the generated prompt.

Accepted replacement:

> Install the .NET 10 SDK. To execute the task, also install and authenticate one supported agent.

### Line 014

> Open a terminal in the extracted project folder.

Keep. Establish the working directory before the commands.

### Line 015

> ```sh

Keep. Identify shell commands separately from C#.

### Line 016

> dotnet build

Keep. Build is the first reproducible action.

### Line 017

> dotnet run -- --preview

Keep. Preview lets readers inspect the actual context before launching a model.

### Line 018

> dotnet run -- --agent codex

Keep. Explicit adapter selection makes this first run predictable.

### Line 019

> ```

Keep. Close the command block.

### Line 020

> Preview prints the exact prompt without probing an agent or creating files.

Rewrite. Run IDs change between invocations, so call it a planned prompt rather than promising byte-for-byte identity with the next run.

Accepted replacement:

> Preview prints a planned prompt without probing an agent or creating files; each invocation gets a new run ID.

### Line 021

> The real run asks the agent to write generated/hello.txt with Hello, super intelligence! followed by a newline.

Keep. State the exact file and bytes expected from the sample.

### Line 022

> A successful run prints the agent summary and the path to its JSON completion report.

Keep. Tell the reader what observable success looks like.

### Line 023

> If no agent is installed, the sample prints AgentNotFound and exits with code 3.

Keep. Provide the concrete missing-agent behavior requested by the user.

### Line 024

> # C00 Install an agent

Keep. Installation is a separate task from running the sample.

### Line 025

> Choose one adapter. You do not need all three.

Keep. Prevent the common assumption that every provider must be installed.

### Line 026

> Codex | npm install -g @openai/codex | Run codex and sign in.

Keep. Link this row to the official Codex installation page in the rendered table.

### Line 027

> Claude Code | Use the official native installer | Run claude and sign in.

Keep. Link the native-installer phrase directly to Claude's official setup instructions.

### Line 028

> GitHub Copilot CLI | npm install -g @github/copilot | Run copilot and sign in; npm installation requires Node.js 22+.

Keep. Retain the Copilot npm prerequisite and link the official installation guide.

### Line 029

> Use the vendor installation pages for current operating-system requirements and authentication options.

Keep. Vendor requirements evolve; the links provide an authoritative maintenance path.

### Line 030

> The builder never installs software, logs in, or changes your selected agent after a task starts.

Keep. Clearly bound the library's side effects and fallback behavior.

### Line 031

> # D00 Copy the dependency

Keep. The heading answers the distribution question directly.

### Line 032

> Copy only SuperIntelligenceBuilder.cs into an SDK-style .NET 10 project; it is included automatically.

Keep. Name the exact file to copy and the project style that automatically includes it.

### Line 033

> The sample's Program.cs, project file and index.html are not library dependencies.

Keep. Distinguish sample assets from the reusable dependency.

### Line 034

> Keep the file's opening comment: it contains the portable installation guide, API contract and harness catalog.

Keep. Explain why the long comment must travel with the source.

### Line 035

> Run from the original development checkout. CallerFilePath records where the caller was compiled.

Keep. Describe the compile-time nature of source discovery.

### Line 036

> Rebuild after moving or changing the caller; a deployed binary does not contain its source file.

Keep. Rebuilding and source availability are both necessary; do not imply deployment discovers missing source.

### Line 037

> # E00 How it works

Keep heading; advance revision after making file preservation precise.

### Line 038

> WithFile performs all the work before the rest of the chain executes.

Keep. This timing fact is fundamental to understanding why the tail does nothing at runtime.

### Line 039

> It validates paths, finds an agent, checks its CLI switches and takes the workspace lock.

Keep. Sequence the real runner's preparation in one sentence.

### Line 040

> It creates AGENTS.md only if missing; an existing file is preserved.

Rewrite. WithFile accepts other Markdown paths, and an explicit DSL task may edit an existing instruction file.

Accepted replacement:

> It creates the requested Markdown instruction file if missing. The runner preserves an existing file; the DSL can explicitly ask the agent to edit it.

### Line 041

> It sends the agent the caller path, line, member, source snapshot, instruction contents and a unique run ID.

Keep. List the context that reduces call-site ambiguity.

### Line 042

> The agent reads the real source and interprets only the chain at that call site.

Rewrite. This is a prompt requirement, not a guarantee of nondeterministic model behavior.

Accepted replacement:

> The prompt requires the agent to read the real source and interpret only the chain at that call site.

### Line 043

> A real success requires exit code 0 and a valid report marked completed for that run.

Keep. Distinguish process success from protocol success.

### Line 044

> The returned dynamic object accepts the made-up calls and returns itself.

Keep. Explain why chaining continues after the agent exits.

### Line 045

> The chain never becomes a real C# builder implementation.

Remove. It repeats the earlier explanation that fictitious methods remain unimplemented.

### Line 046

> # F00 Write useful instructions

Keep. This section teaches useful DSL authoring rather than only syntax.

### Line 047

> Use legal C# identifiers, literal arguments and an explicit output path.

Keep. These are concrete constraints readers can apply to their own chains.

### Line 048

> ```csharp

Keep. Delimit a second C# example.

### Line 049

> SuperIntelligenceBuilder.WithFile("AGENTS.md")

Keep. Retain the standard entry point for a copyable example.

### Line 050

>     .WriteMarkdownFile("generated/review.md")

Keep. An explicit Markdown output makes the task inspectable.

### Line 051

>     .SummarizeThePublicTypesIn("src")

Keep. An explicit input path scopes the requested summary; it is an example path the user can adapt.

### Line 052

>     .IncludeKnownLimitations()

Keep. Known limitations are a meaningful requirement for the generated review.

### Line 053

>     .DoNotModifySourceCode();

Keep. The method name clearly limits writes without contradicting creation of a separate report.

### Line 054

> ```

Keep. Close the example.

### Line 055

> Use precise requests. The wrapper cannot make an ambiguous instruction deterministic.

Keep. State the boundary of natural-language interpretation without promising determinism.

### Line 056

> Do not pass runtime secrets, computed values or side-effecting expressions.

Keep. Explain which kinds of arguments do not belong in a source-interpreted DSL.

### Line 057

> C# still evaluates method arguments after the agent has finished.

Keep. This warns about the real evaluation of arguments even though method dispatch is a no-op.

### Line 058

> Unknown methods and property reads are swallowed; real object members retain their normal behavior.

Keep. The qualification about real members prevents an overbroad dynamic-dispatch promise.

### Line 059

> Execution is reserved for the structured result. Awaiting the sink and arithmetic on it are unsupported.

Keep. Document the reserved property and unsupported operations adjacent to the DSL explanation.

### Line 060

> # G00 Configure a run

Keep. Introduce the configuration reference after basic usage.

### Line 061

> ```csharp

Keep. Start a complete C# configuration example.

### Line 062

> using var cancel = new System.Threading.CancellationTokenSource();

Keep. Fully qualify the cancellation type so the example needs no unstated using directives.

### Line 063

> var options = new SuperIntelligenceBuilder.Options

Keep. Instantiate the actual nested Options type, not an imagined fluent setting.

### Line 064

> {

Keep. Open the initializer; required code structure.

### Line 065

>     Agent = SuperIntelligenceBuilder.AgentKind.Codex,

Keep. Demonstrate explicit provider selection.

### Line 066

>     Timeout = System.TimeSpan.FromMinutes(5)

Keep. Demonstrate a concrete bounded deadline.

### Line 067

> };

Keep. Close the initializer with the required semicolon.

### Line 068

> dynamic task = SuperIntelligenceBuilder.WithFile("AGENTS.md", options, cancel.Token)

Keep. Pass options and cancellation to the real method; preserve compiler-provided caller metadata.

### Line 069

>     .CreateOrReplaceUtf8File("generated/note.txt", "Done.\n");

Keep. Use literal arguments and a single file task.

### Line 070

> SuperIntelligenceBuilder.RunResult result = task.Execution;

Keep. Demonstrate retrieving the real typed result from the dynamic sink.

### Line 071

> System.Console.WriteLine(result.Summary);

Keep. Show the summary field as a useful result consumers can display.

### Line 072

> ```

Keep. Close the configuration example.

### Line 073

> Agent | Explicit adapter; otherwise SUPER_INTELLIGENCE_AGENT, then Codex, Claude, Copilot discovery.

Keep. State the precise adapter precedence in the reference table.

### Line 074

> ExecutablePath | Absolute executable or JS entry file; requires an explicit adapter. Environment: SUPER_INTELLIGENCE_EXECUTABLE.

Keep. Include the explicit-adapter requirement and executable environment override.

### Line 075

> WorkingDirectory | Defaults to the nearest project/repository marker above the caller; source and instructions must remain inside it.

Keep. State both workspace inference and containment requirements.

### Line 076

> Model | Provider-supported model ID; otherwise SUPER_INTELLIGENCE_MODEL or the CLI's own default.

Keep. Avoid inventing a model identifier that may not exist for a user's provider.

### Line 077

> Timeout | Task deadline, 10 minutes by default; allowed range is 1 millisecond to 1 day.

Keep. Separate the per-task deadline from CLI probe deadlines.

### Line 078

> ProbeTimeout | Deadline per version/help probe, 15 seconds by default; same allowed range.

Keep. Document the per-probe default and range.

### Line 079

> Preview | Return the prompt in Execution.PreviewPrompt; do not probe, launch or create files.

Keep. Name the actual PreviewPrompt result property and its no-execution contract.

### Line 080

> CancellationToken | Pass it to WithFile; the sample connects Ctrl+C to cancellation.

Keep. Cancellation is a method argument, so label it as such in the rendered reference.

### Line 081

> Windows npm command shims are resolved through the installed package manifest and node.exe; no command shell is used.

Keep. Explain the Windows shim solution because shell quoting is a core implementation concern.

### Line 082

> Only absolute PATH entries are searched. Aliases, shell functions, relative PATH entries and nonstandard Windows shims are not supported.

Keep. Document discovery exclusions that otherwise look like bugs to users.

### Line 083

> # H00 Permissions and completion

Keep heading; increment revision when qualifying Claude permissions.

### Line 084

> Codex uses workspace-write with approval set to never and sandbox command networking disabled.

Keep. The wording specifically limits sandbox-command networking, not the provider's API connection.

### Line 085

> Claude receives Read, Glob, Grep, Edit and Write tools with edit approval; MCP configuration is restricted to an empty set.

Rewrite. Managed MCP policy can override CLI configuration; describe what the adapter requests rather than guaranteeing an empty effective set.

Accepted replacement:

> Claude is limited to Read, Glob, Grep, Edit and Write tools. The adapter requests empty MCP configuration; managed policy can take precedence.

### Line 086

> Copilot receives a file-tool allowlist, read/write permissions, shell/URL denials and disabled built-in MCP servers.

Keep. This matches the reviewed Copilot tool-availability flags, not only its permission rules.

### Line 087

> Claude and Copilot tasks that need shell commands or network tools should report blocked.

Keep. Explain why some requests can legitimately be blocked in these adapters.

### Line 088

> Existing CLI settings and hooks still matter. This wrapper is not an OS sandbox for untrusted code.

Keep. State the trust boundary without implying CLI permissions equal OS isolation.

### Line 089

> Prompts travel through UTF-8 stdin; paths and source snapshots are JSON data, not shell commands.

Keep. Explain transport and serialization as separate safeguards.

### Line 090

> This avoids shell interpolation, but it does not prevent model prompt injection from untrusted source.

Keep. State the remaining model-injection risk accurately.

### Line 091

> Reports are stored under .superintelligence/runs/<run-id>/result.json.

Keep. Give the actual report location pattern.

### Line 092

> ```json

Keep. Mark the report example as JSON.

### Line 093

> {"protocol":"super-intelligence-builder/v1","runId":"<run-id>","status":"completed","summary":"Created the requested file.","changedFiles":["generated/hello.txt"]}

Rewrite. Pretty-print the same schema in the final page so fields are readable on a narrow screen.

Accepted replacement:

> {
>   "protocol": "super-intelligence-builder/v1",
>   "runId": "<run-id>",
>   "status": "completed",
>   "summary": "Created the requested file.",
>   "changedFiles": ["generated/hello.txt"]
> }

### Line 094

> ```

Keep. Close the JSON block.

### Line 095

> A report is an agent assertion, not independent proof that the result is correct.

Keep. A report cannot independently certify functional correctness.

### Line 096

> Review the actual files. The self-reported changedFiles list is not a complete filesystem diff.

Keep. Distinguish the self-reported list from a filesystem audit.

### Line 097

> Timeouts, cancellation and failures can leave partial changes. The builder never rolls them back.

Keep. Explicitly state nontransactional behavior for interruption and failure.

### Line 098

> # I00 Diagnose failures

Keep. Troubleshooting should be organized by observable error names.

### Line 099

> AgentNotFound | Install an adapter, sign in, reopen the terminal and verify its executable is on PATH.

Keep. Map discovery failure to concrete installation and PATH actions.

### Line 100

> IncompatibleAgent | Update the selected CLI and inspect --help; required switches were absent or a probe failed.

Keep. Give the likely compatibility remedy and explain the probe criterion.

### Line 101

> LaunchFailed | Check executable permissions, Node.js for JS entry points and whether the CLI accepts piped input.

Keep. Include executable, Node and stdin causes without collapsing them into authentication problems.

### Line 102

> AgentFailed | Read the inherited console diagnostics; check login, model access and provider availability.

Keep. Point to diagnostics already inherited by the parent process.

### Line 103

> TimedOut | Review partial edits and the deadline before rerunning; sample exit code 124.

Keep. Include the sample's timeout exit code and advise inspecting partial edits.

### Line 104

> TaskBlocked / TaskFailed | Read the report's explanation. The wrapper does not retry or switch agents.

Keep. Explain that reported task failures never trigger hidden paid retries.

### Line 105

> InvalidReport | The process exited without a valid matching completion report; do not assume the task finished.

Keep. Make missing completion evidence distinguishable from provider process failure.

### Line 106

> Busy | Another builder may own the workspace lock, or its directory is not writable.

Keep. Explain both lock contention and unwritable lock-file failures.

### Line 107

> InvalidInput / FileAccess | Check UTF-8 files, .md instruction extension, workspace paths and filesystem permissions.

Keep. Provide the relevant input and file checks for these error classes.

### Line 108

> Cancelled | Ctrl+C returns 130. Process-tree termination is attempted; detached or remote jobs may survive.

Keep. Describe best-effort child cleanup and the cancellation exit status.

### Line 109

> Ordinary library failures throw BuilderException with Error and optional AgentExitCode; callers decide how to handle them.

Rewrite. Cancellation deliberately uses OperationCanceledException rather than BuilderException.

Accepted replacement:

> Library failures use BuilderException with Error and optional AgentExitCode. Cancellation uses OperationCanceledException; callers choose how to handle both.

### Line 110

> # J00 Harness catalog

Keep. This is a catalog, not an adapter selection control.

### Line 111

> Only Codex, Claude Code and GitHub Copilot CLI have built-in adapters in this release.

Keep. Repeat supported scope here so a reader entering at this anchor cannot confuse catalog and support.

### Line 112

> Gemini CLI | Headless prompts and structured output.

Keep. Link Gemini's official headless-mode reference.

### Line 113

> OpenCode | Terminal agent with noninteractive opencode run.

Keep. Link the current OpenCode CLI documentation.

### Line 114

> Aider | Scripted repository edits with --message or --message-file.

Keep. Link Aider's scripting guide and retain its actual batch options.

### Line 115

> Cursor CLI | Headless agent separate from the editor UI.

Keep. Distinguish Cursor CLI from the IDE product.

### Line 116

> Cline | Terminal/headless workflows and editor tooling.

Keep. Link Cline's terminal/headless overview.

### Line 117

> Continue CLI | Noninteractive tasks with cn -p.

Keep. Show Continue's distinctive command name, cn.

### Line 118

> OpenHands | Headless tasks and programmable agent runtimes.

Keep. Link OpenHands headless documentation.

### Line 119

> Pi | Extensible terminal coding harness.

Keep. Describe Pi without promising unimplemented adapter support.

### Line 120

> Roo Code | Editor-oriented coding agent tooling.

Keep. Describe Roo as editor-oriented, avoiding an unsupported CLI claim.

### Line 121

> Cascade | Windsurf-origin IDE agent, now documented under Devin Desktop.

Keep. Use the currently observed documentation destination for Cascade.

### Line 122

> These are catalog entries, not fallback executables or a popularity ranking.

Keep. State the catalog's scope and avoid an unsupported popularity ranking.

### Line 123

> # K00 Limits and verification

Keep. Group operating limits and verification evidence after the main instructions.

### Line 124

> Source files are limited to 1 MiB, instruction text to 256 KiB and reports to 64 KiB; UTF-8 is required.

Keep. List explicit size limits with their units and required encoding.

### Line 125

> Symlinks and reparse points within the selected workspace path are rejected, but path checks are not a race-proof sandbox.

Keep. Distinguish best-effort path checks from OS-enforced isolation.

### Line 126

> The lock coordinates only the same workspace; overlapping parent and child workspaces need external coordination.

Keep. Document the lock's workspace scope and its overlap limitation.

### Line 127

> The inherited recursion guard suppresses builder calls made by the agent's child processes.

Keep. Explain recursion suppression in terms of inherited process environment.

### Line 128

> Use normal JIT builds. NativeAOT, trimming and source-free deployment are outside this design.

Keep. State unsupported deployment modes before users try to publish a source-free executable.

### Line 129

> Provider execution is nondeterministic. No wrapper can guarantee that natural-language requests produce correct code.

Keep. Avoid overstating what a reliable process wrapper can guarantee about model outputs.

### Line 130

> Build and runtime verification status is recorded in VALIDATION.md; no tests or binaries are shipped.

Keep. Link the separate validation record, preserving an honest distinction between implementation and evidence.

### Line 131

> # L00 Sources and page design

Keep heading; advance its revision after removing an unnecessary originality claim.

### Line 132

> CLI switches and installation guidance were checked against official vendor documentation on 2026-09-26.

Keep. Date the research and make the relevant official pages directly accessible.

### Line 133

> The page uses SQLite's compact topic navigation, Python's guide/reference distinction and Diataxis's task-oriented organization as design references.

Keep. Identify the actual design references and the specific organizational ideas used.

### Line 134

> The layout, type treatment, code annotation and styling are original to this project.

Remove. A self-assessment of originality adds no technical value; the design can demonstrate it.

### Line 135

> This page works offline: its styles, scripts and illustrations are embedded; only external reference links require a connection.

Keep. State the offline contract and its precise exception for external reference links.


## B00 Implementation-alignment follow-up

> Claude is limited to Read, Glob, Grep, Edit and Write tools. The adapter requests empty MCP configuration; managed policy can take precedence.

Rewrite. The final adapter also passes --disallowedTools mcp__*. Include that enforced tool denial rather than describing only its requested MCP configuration. Accept the replacement below; section H advances from H01 to H02.

> Claude is limited to Read, Glob, Grep, Edit and Write tools and explicitly denies MCP tools. The adapter also requests empty MCP configuration; managed policy can take precedence.
