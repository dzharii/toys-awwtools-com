# A01 Validation record

This archive contains a completed implementation and documentation, with the verification limits below. It is not presented as an end-to-end certified production release.

| Check | Result |
| --- | --- |
| C# syntax parsing | Both source files parse without error nodes using the C# tree-sitter grammar. This is not a compiler or type check. |
| Project configuration | Targets net10.0 and C# 14; nullable analysis, .NET analyzers, deterministic builds and warnings-as-errors enabled. No PackageReference items. |
| .NET SDK | Official SDK 10.0.401 and runtime 10.0.12 downloaded and extracted into the build workspace. Archive ownership restoration failed, so this is not recorded as a clean installation. Not included in this archive. |
| Actual dotnet build | Blocked before compilation: CoreCLR initialization fails with HRESULT 0x8007000E in the execution environment. No successful compilation is claimed. |
| Runtime/process tests | Not executed because CoreCLR cannot start. Missing-agent handling, process timeout/cancellation, locks, report validation and dynamic dispatch were source-reviewed, not runtime-verified. |
| Authenticated provider runs | Not executed. Codex, Claude and Copilot were absent from PATH and no provider authentication was configured for this task. |
| Windows/macOS | Not executed. In particular, Windows native/npm-shim resolution still needs platform validation. |
| Documentation editorial review | Initial draft retained. Every one of its 135 physical lines has a quoted review and an accepted decision. Interface copy has a separate 21-line review. The About page adds 89 reviewed lines and six reviewed navigation labels. |
| HTML structure | Local links and fragment targets checked; unique IDs; reviewed code snippets match the rendered HTML. |
| Offline dependencies | CSS and JavaScript are inline. No external scripts, fonts, stylesheets, images or network requests are required to render the page. Reference links intentionally lead to external sites. |
| JavaScript | Syntax checked with Node.js. Clipboard, section filtering and browser intersection behavior were not interactively tested. |
| Visual review | Static, non-JavaScript rendering inspected for desktop and narrow layouts, with narrow-screen CSS explicitly applied because the renderer does not evaluate browser viewport media queries. Browser local-file navigation was rejected by the browser's URL policy; no browser rendering claim is made. |
| Distribution | ZIP inventory checked: only source, configuration, HTML and Markdown/JSON editorial records. No SDK, binaries, bin/obj directories, tests or generated runtime reports. |

# B00 Before relying on this in production

On a normal development machine with the .NET 10 SDK, run these commands from the extracted folder:

```sh
dotnet build --configuration Release
dotnet run -- --help
dotnet run -- --preview
```

Preview should print a source snapshot and a task contract without creating AGENTS.md or launching an agent. The SDK itself can create ordinary bin/obj build output.

Install and authenticate the chosen provider, then run:

```sh
dotnet run -- --agent codex
```

Use `claude` or `copilot` instead for the other built-in adapters. Confirm that generated/hello.txt contains `Hello, super intelligence!` followed by a newline, the process exits successfully, and the reported JSON has the matching run ID and `completed` status. Review actual filesystem changes; a model-authored completion report does not prove correctness.

For an installation-error check independent of PATH, choose an absolute nonexistent executable path for your OS and pass it with `--agent codex --executable`. The expected sample exit code is 3, with AgentNotFound. Check cancellation, timeouts and permissions against the exact CLI versions and operating systems you intend to deploy.

# C00 Research and maintenance

CLI switches and installation guidance were researched from official vendor documentation on 2026-09-26. The source header contains the reference URLs and exact argument forms. Runtime version/help probes check for required interface switches, but are not a guarantee of future CLI compatibility. The harness catalog distinguishes implemented adapters from documentation-only entries.

Source review covered stdin-only prompt transport, ArgumentList use, instruction-file preservation, path containment and reparse checks, bounded file/probe reads, cancellation cleanup, no task retries, same-workspace locking, recursion suppression, caller context, and completion identity/status checks. These checks reduce implementation risks; they do not replace the unperformed build and runtime checks above.
