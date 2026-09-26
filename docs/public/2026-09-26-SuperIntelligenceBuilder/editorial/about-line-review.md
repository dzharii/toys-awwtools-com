# A00 About-page line review

All 89 physical lines of about-draft.md are quoted and reviewed below. Every recommendation is accepted in about-final.md and about.html.

### Line 001

> # M00 About this development run

Keep. The title identifies a session-specific development record.

### Line 002

> What was available. What was blocked. What was decided.

Keep. It previews the three questions the user explicitly asked.

### Line 003

> This page records the environment and implementation choices behind this experimental project on 2026-09-26.

Keep. The date scopes environment facts that can change between sessions.

### Line 004

> It describes this session, not a guarantee of the capabilities available in another ChatGPT or Codex session.

Keep. Avoid promising that future sessions expose the same tools or permissions.

### Line 005

> # N00 Environment and model

Keep. Group model identity with observed environment metadata.

### Line 006

> Agent identity | Codex, operating as a coding assistant inside ChatGPT Work Mode.

Keep. State the verified agent identity without guessing a model family.

### Line 007

> Requested model | The user requested GPT Astra. Official OpenAI documentation names GPT-6 Astra and the API identifier gpt-6-astra.

Keep. Preserve the requested name and link the official GPT-6 Astra model page.

### Line 008

> Verified session model | The underlying model ID was not exposed in a form this assistant could verify. No claim is made that the request changed the active model.

Keep. Explicitly distinguish a requested model from verifiable session identity.

### Line 009

> Operating environment | Linux x86_64 with Bash and a scoped writable workspace.

Keep. Record the actual OS/architecture and scoped workspace rather than implying full host access.

### Line 010

> Observed runtimes | Python 3.12.14 and Node.js v24.19.0 were executable.

Keep. These runtime versions were obtained by executing their version commands.

### Line 011

> Observed utilities | curl 8.5.0, GNU tar 1.35, git, ripgrep and Python's ZIP/XML/HTML libraries were available.

Keep. These tools were used or discovered, and their roles are understandable.

### Line 012

> .NET state | No dotnet executable was initially on PATH. SDK 10.0.401 and runtime 10.0.12 were downloaded; the runtime could not initialize.

Keep. Differentiate an absent initial command from the subsequently downloaded but unusable runtime.

### Line 013

> Agent installations | codex, claude and copilot were not found on PATH. Installed tooling in this assistant environment is distinct from an authenticated coding-agent CLI.

Keep. Do not conflate this assistant with an installed, authenticated external coding CLI.

### Line 014

> Working files | Source, documentation and validation intermediates were created in the scoped scratch workspace; the ZIP is the distribution artifact.

Keep. Explain where working files lived and which artifact is intended for distribution.

### Line 015

> Network | Official documentation research and the SDK/package downloads used here succeeded. Unrestricted general networking was not established.

Keep. Report successful network operations without claiming unrestricted egress.

### Line 016

> # O00 Tools actually used

Keep heading; advance revision for changes to the upload description.

### Line 017

> Shell execution | Ran commands, inspected files and paths, downloaded the SDK, installed temporary analysis/rendering packages and built the source archive.

Keep. Explain the terminal's concrete contributions rather than listing only a tool name.

### Line 018

> File patching | Created and edited the C# project, configuration and source files without modifying an external repository.

Keep. Name the edits performed and avoid implying a remote repository mutation.

### Line 019

> Web research | Searched official vendor documentation and opened CLI references; checked installation, stdin modes, permissions and modern harnesses.

Keep. Bound research claims to sources actually opened and relevant technical topics.

### Line 020

> Browser control | Opened SQLite and Python documentation and inspected their rendered layouts for design research.

Keep. Identify the pages inspected and why browser access was useful.

### Line 021

> Local image inspection | Examined static desktop and narrow-layout documentation renders; this did not execute page JavaScript.

Keep. Distinguish image inspection from interactive JavaScript validation.

### Line 022

> Python | Generated and checked the documentation, parsed the csproj XML, compared reviewed snippets, validated links and assembled the ZIP.

Keep. List specific Python checks so readers know what static validation meant.

### Line 023

> Node.js | Checked the syntax of the page's inline JavaScript; no browser interaction was inferred from that check.

Keep. A JavaScript syntax check is explicitly narrower than browser behavior testing.

### Line 024

> C# syntax parser | Installed tree-sitter and its C# grammar temporarily; both source files parsed without syntax-error nodes.

Keep. Name the parser and state that its result concerns syntax only.

### Line 025

> Static HTML renderer | Installed WeasyPrint temporarily and rendered the page without JavaScript or external resources; PyMuPDF produced images for inspection.

Keep. Name both the renderer and image conversion component, and disclose disabled JavaScript.

### Line 026

> Library upload | Used to make the finished source ZIP available as a persistent artifact; it does not compile or execute the project.

Rewrite. Do not write a past-tense upload success into a document before the archive has been saved; describe its role and the final success check.

Accepted replacement:

> Library upload | Provides persistent delivery of the finished source ZIP. Upload success is checked before the final handoff; this tool does not compile or execute the project.

### Line 027

> Workflow guidance | Read the Library, Browser and OpenAI Docs skills for artifact delivery, permitted browser access and model-documentation accuracy.

Keep. Summarize the workflow guidance used without reproducing private instruction text.

### Line 028

> # P00 Other exposed capabilities

Keep. Separate exposed-but-unused capabilities from operations actually exercised.

### Line 029

> Image generation | Available but unused. The documentation did not need generated artwork.

Keep. Do not imply generated illustration was needed or performed.

### Line 030

> Sites building and hosting | Available but unused. The requested output was portable HTML in a ZIP, so no site was deployed.

Keep. Explain why deployment tooling was not used for a portable file request.

### Line 031

> Documents, spreadsheets and presentations | Skills were available but unnecessary for C# and HTML source delivery.

Keep. These skills were available, but no office-document workflow was necessary.

### Line 032

> Automation scheduling | Available but unused. No future task or recurring job was requested.

Keep. Scheduling was exposed and unused; there is no hidden recurring task.

### Line 033

> Agent collaboration | Available but unused. The work was performed in one assistant thread without delegated subagents.

Keep. State that no subagents were used without implying they were unavailable.

### Line 034

> Plugin management | Available but unused. No external account connector was required to produce the source package.

Keep. The package needed no new external account connection.

### Line 035

> User-input and planning tools | Available; no additional preference question was necessary to implement the stated design.

Keep. Exposed planning/input tools are not proof that user clarification was required.

### Line 036

> Availability in this table means a capability was exposed, not that every operation, account permission or dependency behind it was tested.

Keep. This sentence prevents available from being misread as authenticated and tested.

### Line 037

> # Q00 Observed blockers and limitations

Keep heading; advance revision when narrowing the agent-discovery claim.

### Line 038

> CoreCLR startup | A .NET SDK download was expected to enable compilation. dotnet build failed before compilation with Failed to create CoreCLR, HRESULT: 0x8007000E. Build and runtime checks remain unverified.

Keep. Give the exact CoreCLR error and its effect on verification without claiming a root cause.

### Line 039

> Installer temporary directory | The installer initially expected /tmp, which was absent. Setting TMPDIR to a writable workspace directory allowed the download step to proceed.

Keep. Record the successful temporary-directory workaround as a resolved setup issue.

### Line 040

> Archive ownership metadata | SDK extraction reported that it could not apply the archive's original user/group ownership. Files were extracted, but the installer reported failure; this is not recorded as a clean SDK installation.

Keep. Record the ownership error honestly instead of presenting the extraction as a clean install.

### Line 041

> Process filesystem | /proc was absent from the exposed filesystem. ps could not inspect processes. This is an observed environment limitation, not a proven explanation of CoreCLR's failure.

Keep. Explicitly avoid treating the missing process filesystem as proven causation.

### Line 042

> Native tracing | strace was present, but ptrace operations were denied. Native runtime startup could not be diagnosed through system-call tracing.

Keep. Describe the denied tracing operation and resulting diagnostic limit.

### Line 043

> Local browser preview | The cloud browser rejected file:// URLs and advertised HTTP/HTTPS navigation only. No browser preview of the local documentation was completed.

Keep. Record the local-file URL rejection without suggesting the website or source is defective.

### Line 044

> Browser JavaScript checks | Copy buttons, navigation filtering and responsive browser layout were not interactively tested. Static rendering and script syntax checks do not substitute for those tests.

Keep. Enumerate the browser interactions that remain unverified.

### Line 045

> Separate browser runtime | The browser and shell used different filesystem views. A path in the shell was not directly readable under the same path by the browser-side runtime.

Keep. Explain the observed filesystem-path mismatch without exposing unrelated files.

### Line 046

> Restricted browser-side JavaScript | The global process object was absent and importing node:process was denied. This runtime was not treated as a general-purpose replacement terminal.

Keep. State the observed JavaScript-runtime restriction rather than speculating about other modules.

### Line 047

> Agent execution | No supported agent CLI or authenticated provider session was available for an end-to-end run. CLI behavior was researched from official references, not observed through paid model execution.

Rewrite. Discovery only checked PATH, and no credential inventory was performed. Say what was observed rather than asserting no authentication existed anywhere.

Accepted replacement:

> Agent execution | No supported CLI was discovered on PATH, and no authenticated provider run was performed. CLI behavior was researched from official references, not observed through model execution.

### Line 048

> Other operating systems | No native Windows or macOS runner was used. Windows executable and npm-shim handling still require platform testing.

Keep. Windows and macOS support are implementation intentions needing platform evidence.

### Line 049

> Model identity | The requested model name could be checked against public documentation, but the actual model serving this conversation could not be independently inspected.

Keep. Public model documentation cannot identify the model behind a particular conversation.

### Line 050

> These limits are specific observations. Missing credentials, untested capabilities and denied operations are kept separate from defects found in the project.

Keep. Clearly distinguish a product defect from an environment blocker or unperformed check.

### Line 051

> # R00 Architectural decisions

Keep. Introduce the structural decisions separately from runtime behavior.

### Line 052

> One distributable C# file | Keep runtime code, nested configuration/result types and the portable manual together. Copying the file adds no NuGet dependency; a larger single file is the tradeoff.

Keep. State the benefit and size tradeoff of the single-source distribution.

### Line 053

> .NET 10 and C# 14 | Use the requested current project target with nullable analysis and warnings-as-errors. Older SDKs and NativeAOT are outside the supported contract.

Keep. Tie the framework/language choice to the requested target and unsupported deployment modes.

### Line 054

> DynamicObject sink | Return the same sink for unknown fluent members. This preserves the joke; it cannot disable normal C# argument evaluation or redefine real object members.

Keep. Explain dynamic dispatch without implying argument evaluation is suppressed.

### Line 055

> Immediate execution | Start and wait inside WithFile. No terminal Build call or tail parser is required; the calling thread stays occupied until the run finishes.

Keep. Explain the immediate-execution contract and its blocking cost.

### Line 056

> Source-defined task | Give the agent the actual caller source instead of implementing a C# DSL parser. Arbitrary names remain usable, while their interpretation remains nondeterministic.

Keep. Describe source interpretation and its deliberate nondeterminism.

### Line 057

> Exact call-site context | Include caller path, line, member, source snapshot and SHA-256. This reduces ambiguity; source movement, wrappers and #line directives still need care.

Keep. List ambiguity-reduction metadata and the remaining call-site pitfalls.

### Line 058

> Three reviewed adapters | Implement Codex, Claude Code and Copilot CLI. Catalog other harnesses without pretending their flags or permission systems are interchangeable.

Keep. State implemented adapter scope and why other harnesses are catalog-only.

### Line 059

> No provider SDK | Integrate installed CLIs as child processes. This keeps the source dependency-free but makes CLI compatibility and local authentication deployment concerns.

Keep. Explain the dependency benefit and deployment cost of a subprocess boundary.

### Line 060

> # S00 Behavioral decisions

Keep heading; advance revision for permission and model-validation precision.

### Line 061

> Preserve instructions | Atomically create a missing Markdown instruction file and never truncate an existing one. The agent may edit it only when the task explicitly asks.

Rewrite. Preservation is enforced by the runner, but the model's adherence is a prompt requirement rather than a guaranteed restriction.

Accepted replacement:

> Preserve instructions | Atomically create a missing Markdown instruction file and never truncate an existing one. The prompt permits the agent to edit it only when the task explicitly asks.

### Line 062

> Deterministic selection | Explicit options override environment settings; otherwise discover Codex, Claude, then Copilot. A selected incompatible installation produces an error rather than a silent provider switch.

Keep. The precedence and no-silent-fallback policy match the implementation.

### Line 063

> No shell command construction | Use ProcessStartInfo.ArgumentList and send prompt text over UTF-8 stdin. This removes shell interpolation but does not solve model prompt injection.

Keep. Distinguish shell-safe transport from model instruction safety.

### Line 064

> Windows shim resolution | Resolve standard npm .cmd shims through the known package manifest and Node executable. Nonstandard wrappers fail instead of being interpreted by cmd.exe.

Keep. Explain the explicit Windows shim design and why arbitrary command wrappers are rejected.

### Line 065

> Bounded operations | Limit source/report/probe sizes and give task/probe operations deadlines. The timeout is a best-effort process boundary, not rollback or a guarantee that remote work stops.

Keep. Deadline/size bounds and their limits are concrete operational decisions.

### Line 066

> Workspace containment | Require source and instructions inside the selected root and reject nested symlinks/reparse points. These checks are useful input validation, not a race-proof filesystem sandbox.

Keep. Do not confuse path validation with a hostile-code sandbox.

### Line 067

> Workspace lock | Prevent concurrent builders targeting the same root. Separate overlapping roots require coordination outside the library.

Keep. Record the lock's exact scope and overlapping-root limitation.

### Line 068

> Recursion guard | Pass an inherited environment flag to child processes. A builder launched by the agent's child process returns without recursively starting another agent.

Keep. Explain how recursive launches are suppressed without requiring an extra dependency.

### Line 069

> Permissions stay bounded | Use Codex workspace-write and file-tool restrictions for Claude/Copilot. Some tasks must report blocked; approval-bypass and allow-all switches are not supplied.

Rewrite. Approval is set to never for Codex, so say no sandbox-bypass/allow-all switches rather than vaguely claiming no approval-bypass behavior.

Accepted replacement:

> Permissions stay bounded | Use Codex workspace-write and file-tool restrictions for Claude/Copilot. Some tasks must report blocked; sandbox-bypass and allow-all switches are not supplied.

### Line 070

> Completion protocol | Require zero process exit and a valid run-specific completed JSON report. A prose answer alone is insufficient; the report still cannot prove functional correctness.

Keep. A valid completion report is necessary but not sufficient evidence of correctness.

### Line 071

> No automatic retries | Preserve diagnostics and partial edits after failure instead of relaunching or switching providers. The caller decides whether another paid run is appropriate.

Keep. Explain the cost and partial-edit reasons for caller-controlled retries.

### Line 072

> Live diagnostics | Inherit stdout/stderr for task runs and bound captured probe output. This avoids keeping an unbounded transcript in memory; output is not automatically archived.

Keep. Describe the output-stream choice and the lack of automatic transcript retention.

### Line 073

> Opt-in model selection | Accept a validated provider model ID or use the CLI default. The library does not assume that a model available in this chat exists in every harness.

Rewrite. The library validates model-ID syntax; only the provider can establish that the identifier exists and is available to an account.

Accepted replacement:

> Opt-in model selection | Accept a syntactically validated model ID or use the CLI default. Only the provider can establish model availability; the library does not assume a chat model exists in every harness.

### Line 074

> Preview before execution | Return the planned prompt without probing or writing files. It supports inspection even when no agent is installed; later invocations have new run IDs.

Keep. Preview semantics include the changing run ID and lack of side effects.

### Line 075

> # T00 Documentation and delivery decisions

Keep. Group editorial and packaging decisions separately from runtime architecture.

### Line 076

> Portable manual | Put setup, API behavior, limits, exact CLI arguments and the harness catalog in the source header so the documentation travels with the dependency.

Keep. The portable source header is the central distribution requirement.

### Line 077

> Compact documentation | Use a narrow contents rail, readable text and restrained color informed by SQLite, Python documentation and Diataxis. Avoid a marketing landing page.

Keep. Name the researched layout ideas and their fit to a technical manual.

### Line 078

> Self-contained pages | Embed CSS and JavaScript in each HTML file. No bundler, remote font, asset server or hosted deployment is needed to read the documentation.

Keep. State the final HTML delivery contract and absence of asset dependencies.

### Line 079

> Editorial sequence | Preserve an initial draft, quote and review every line, then apply the accepted edits. The initial manual contains 135 reviewed lines and 21 separately reviewed interface labels.

Keep. Preserve the exact initial review counts; the About review is an additional record.

### Line 080

> Source-only ZIP | Include the source, project configuration, HTML pages, validation record and editorial evidence. Exclude SDK files, compiled output, tests and runtime-generated agent reports.

Keep. Define the archive's inclusions and explicit binary/test exclusions.

### Line 081

> No invented validation | Record syntax parsing separately from compilation, static rendering separately from browser testing, and CLI research separately from authenticated execution.

Keep. State the evidence distinctions that matter most to a future maintainer.

### Line 082

> Static visual fallback | After local browser navigation was rejected, use a non-JavaScript renderer for layout inspection. This provides visual evidence with a narrower capability than browser execution.

Keep. Explain why a safer static renderer was useful without claiming browser parity.

### Line 083

> # U00 Findings and future expectations

Keep. End with observed findings and practical future checks, not a promotional conclusion.

### Line 084

> The first page renderer incorrectly split documentation at C# in ordinary prose. Static visual inspection exposed the bug; parsing was corrected to recognize heading markers only at line starts.

Keep. Document the actual heading-parser defect and the correction found through visual review.

### Line 085

> The first narrow-layout static check did not apply the responsive overrides at the right CSS priority. The inspection harness was corrected; this was not taken as proof of a browser CSS defect.

Keep. Record the static inspection harness's CSS mistake as a harness issue, not a browser finding.

### Line 086

> The SDK host could identify its installed SDK/runtime even though CoreCLR could not start the compiler. Downloaded dependencies and executable runtimes are separate capabilities.

Keep. This is a useful distinction between SDK discovery and managed runtime startup.

### Line 087

> The coding assistant that produced these files was available even though no codex, claude or copilot command was available on PATH.

Keep. This is a useful distinction between the assistant service and installed external CLIs.

### Line 088

> For future experiments, confirm the target runtime, authenticated agent and browser-preview route before scheduling end-to-end validation.

Keep. Turn the observed blockers into a concrete preflight sequence for future experiments.

### Line 089

> Consult VALIDATION.md for the exact completed and unperformed checks. Treat the code as an implementation to validate in your deployment, not a certification of production readiness.

Keep. Link the evidence record and state the remaining deployment-verification responsibility.

