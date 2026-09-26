# M00 About this development run
What was available. What was blocked. What was decided.
This page records the environment and implementation choices behind this experimental project on 2026-09-26.
It describes this session, not a guarantee of the capabilities available in another ChatGPT or Codex session.
# N00 Environment and model
Agent identity | Codex, operating as a coding assistant inside ChatGPT Work Mode.
Requested model | The user requested GPT Astra. Official OpenAI documentation names GPT-6 Astra and the API identifier gpt-6-astra.
Verified session model | The underlying model ID was not exposed in a form this assistant could verify. No claim is made that the request changed the active model.
Operating environment | Linux x86_64 with Bash and a scoped writable workspace.
Observed runtimes | Python 3.12.14 and Node.js v24.19.0 were executable.
Observed utilities | curl 8.5.0, GNU tar 1.35, git, ripgrep and Python's ZIP/XML/HTML libraries were available.
.NET state | No dotnet executable was initially on PATH. SDK 10.0.401 and runtime 10.0.12 were downloaded; the runtime could not initialize.
Agent installations | codex, claude and copilot were not found on PATH. Installed tooling in this assistant environment is distinct from an authenticated coding-agent CLI.
Working files | Source, documentation and validation intermediates were created in the scoped scratch workspace; the ZIP is the distribution artifact.
Network | Official documentation research and the SDK/package downloads used here succeeded. Unrestricted general networking was not established.
# O01 Tools actually used
Shell execution | Ran commands, inspected files and paths, downloaded the SDK, installed temporary analysis/rendering packages and built the source archive.
File patching | Created and edited the C# project, configuration and source files without modifying an external repository.
Web research | Searched official vendor documentation and opened CLI references; checked installation, stdin modes, permissions and modern harnesses.
Browser control | Opened SQLite and Python documentation and inspected their rendered layouts for design research.
Local image inspection | Examined static desktop and narrow-layout documentation renders; this did not execute page JavaScript.
Python | Generated and checked the documentation, parsed the csproj XML, compared reviewed snippets, validated links and assembled the ZIP.
Node.js | Checked the syntax of the page's inline JavaScript; no browser interaction was inferred from that check.
C# syntax parser | Installed tree-sitter and its C# grammar temporarily; both source files parsed without syntax-error nodes.
Static HTML renderer | Installed WeasyPrint temporarily and rendered the page without JavaScript or external resources; PyMuPDF produced images for inspection.
Library upload | Provides persistent delivery of the finished source ZIP. Upload success is checked before the final handoff; this tool does not compile or execute the project.
Workflow guidance | Read the Library, Browser and OpenAI Docs skills for artifact delivery, permitted browser access and model-documentation accuracy.
# P00 Other exposed capabilities
Image generation | Available but unused. The documentation did not need generated artwork.
Sites building and hosting | Available but unused. The requested output was portable HTML in a ZIP, so no site was deployed.
Documents, spreadsheets and presentations | Skills were available but unnecessary for C# and HTML source delivery.
Automation scheduling | Available but unused. No future task or recurring job was requested.
Agent collaboration | Available but unused. The work was performed in one assistant thread without delegated subagents.
Plugin management | Available but unused. No external account connector was required to produce the source package.
User-input and planning tools | Available; no additional preference question was necessary to implement the stated design.
Availability in this table means a capability was exposed, not that every operation, account permission or dependency behind it was tested.
# Q01 Observed blockers and limitations
CoreCLR startup | A .NET SDK download was expected to enable compilation. dotnet build failed before compilation with Failed to create CoreCLR, HRESULT: 0x8007000E. Build and runtime checks remain unverified.
Installer temporary directory | The installer initially expected /tmp, which was absent. Setting TMPDIR to a writable workspace directory allowed the download step to proceed.
Archive ownership metadata | SDK extraction reported that it could not apply the archive's original user/group ownership. Files were extracted, but the installer reported failure; this is not recorded as a clean SDK installation.
Process filesystem | /proc was absent from the exposed filesystem. ps could not inspect processes. This is an observed environment limitation, not a proven explanation of CoreCLR's failure.
Native tracing | strace was present, but ptrace operations were denied. Native runtime startup could not be diagnosed through system-call tracing.
Local browser preview | The cloud browser rejected file:// URLs and advertised HTTP/HTTPS navigation only. No browser preview of the local documentation was completed.
Browser JavaScript checks | Copy buttons, navigation filtering and responsive browser layout were not interactively tested. Static rendering and script syntax checks do not substitute for those tests.
Separate browser runtime | The browser and shell used different filesystem views. A path in the shell was not directly readable under the same path by the browser-side runtime.
Restricted browser-side JavaScript | The global process object was absent and importing node:process was denied. This runtime was not treated as a general-purpose replacement terminal.
Agent execution | No supported CLI was discovered on PATH, and no authenticated provider run was performed. CLI behavior was researched from official references, not observed through model execution.
Other operating systems | No native Windows or macOS runner was used. Windows executable and npm-shim handling still require platform testing.
Model identity | The requested model name could be checked against public documentation, but the actual model serving this conversation could not be independently inspected.
These limits are specific observations. Missing credentials, untested capabilities and denied operations are kept separate from defects found in the project.
# R00 Architectural decisions
One distributable C# file | Keep runtime code, nested configuration/result types and the portable manual together. Copying the file adds no NuGet dependency; a larger single file is the tradeoff.
.NET 10 and C# 14 | Use the requested current project target with nullable analysis and warnings-as-errors. Older SDKs and NativeAOT are outside the supported contract.
DynamicObject sink | Return the same sink for unknown fluent members. This preserves the joke; it cannot disable normal C# argument evaluation or redefine real object members.
Immediate execution | Start and wait inside WithFile. No terminal Build call or tail parser is required; the calling thread stays occupied until the run finishes.
Source-defined task | Give the agent the actual caller source instead of implementing a C# DSL parser. Arbitrary names remain usable, while their interpretation remains nondeterministic.
Exact call-site context | Include caller path, line, member, source snapshot and SHA-256. This reduces ambiguity; source movement, wrappers and #line directives still need care.
Three reviewed adapters | Implement Codex, Claude Code and Copilot CLI. Catalog other harnesses without pretending their flags or permission systems are interchangeable.
No provider SDK | Integrate installed CLIs as child processes. This keeps the source dependency-free but makes CLI compatibility and local authentication deployment concerns.
# S01 Behavioral decisions
Preserve instructions | Atomically create a missing Markdown instruction file and never truncate an existing one. The prompt permits the agent to edit it only when the task explicitly asks.
Deterministic selection | Explicit options override environment settings; otherwise discover Codex, Claude, then Copilot. A selected incompatible installation produces an error rather than a silent provider switch.
No shell command construction | Use ProcessStartInfo.ArgumentList and send prompt text over UTF-8 stdin. This removes shell interpolation but does not solve model prompt injection.
Windows shim resolution | Resolve standard npm .cmd shims through the known package manifest and Node executable. Nonstandard wrappers fail instead of being interpreted by cmd.exe.
Bounded operations | Limit source/report/probe sizes and give task/probe operations deadlines. The timeout is a best-effort process boundary, not rollback or a guarantee that remote work stops.
Workspace containment | Require source and instructions inside the selected root and reject nested symlinks/reparse points. These checks are useful input validation, not a race-proof filesystem sandbox.
Workspace lock | Prevent concurrent builders targeting the same root. Separate overlapping roots require coordination outside the library.
Recursion guard | Pass an inherited environment flag to child processes. A builder launched by the agent's child process returns without recursively starting another agent.
Permissions stay bounded | Use Codex workspace-write and file-tool restrictions for Claude/Copilot. Some tasks must report blocked; sandbox-bypass and allow-all switches are not supplied.
Completion protocol | Require zero process exit and a valid run-specific completed JSON report. A prose answer alone is insufficient; the report still cannot prove functional correctness.
No automatic retries | Preserve diagnostics and partial edits after failure instead of relaunching or switching providers. The caller decides whether another paid run is appropriate.
Live diagnostics | Inherit stdout/stderr for task runs and bound captured probe output. This avoids keeping an unbounded transcript in memory; output is not automatically archived.
Opt-in model selection | Accept a syntactically validated model ID or use the CLI default. Only the provider can establish model availability; the library does not assume a chat model exists in every harness.
Preview before execution | Return the planned prompt without probing or writing files. It supports inspection even when no agent is installed; later invocations have new run IDs.
# T00 Documentation and delivery decisions
Portable manual | Put setup, API behavior, limits, exact CLI arguments and the harness catalog in the source header so the documentation travels with the dependency.
Compact documentation | Use a narrow contents rail, readable text and restrained color informed by SQLite, Python documentation and Diataxis. Avoid a marketing landing page.
Self-contained pages | Embed CSS and JavaScript in each HTML file. No bundler, remote font, asset server or hosted deployment is needed to read the documentation.
Editorial sequence | Preserve an initial draft, quote and review every line, then apply the accepted edits. The initial manual contains 135 reviewed lines and 21 separately reviewed interface labels.
Source-only ZIP | Include the source, project configuration, HTML pages, validation record and editorial evidence. Exclude SDK files, compiled output, tests and runtime-generated agent reports.
No invented validation | Record syntax parsing separately from compilation, static rendering separately from browser testing, and CLI research separately from authenticated execution.
Static visual fallback | After local browser navigation was rejected, use a non-JavaScript renderer for layout inspection. This provides visual evidence with a narrower capability than browser execution.
# U00 Findings and future expectations
The first page renderer incorrectly split documentation at C# in ordinary prose. Static visual inspection exposed the bug; parsing was corrected to recognize heading markers only at line starts.
The first narrow-layout static check did not apply the responsive overrides at the right CSS priority. The inspection harness was corrected; this was not taken as proof of a browser CSS defect.
The SDK host could identify its installed SDK/runtime even though CoreCLR could not start the compiler. Downloaded dependencies and executable runtimes are separate capabilities.
The coding assistant that produced these files was available even though no codex, claude or copilot command was available on PATH.
For future experiments, confirm the target runtime, authenticated agent and browser-preview route before scheduling end-to-end validation.
Consult VALIDATION.md for the exact completed and unperformed checks. Treat the code as an implementation to validate in your deployment, not a certification of production readiness.
