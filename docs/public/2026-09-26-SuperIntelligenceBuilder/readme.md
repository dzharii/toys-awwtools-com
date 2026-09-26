# SuperIntelligenceBuilder

SuperIntelligenceBuilder is a single-file .NET 10 bridge from an intentionally imaginary fluent C# API to a real coding-agent CLI. Only `WithFile(...)` is implemented. It captures the caller location, gives the agent the caller's source, and asks it to interpret the remaining dynamic chain as a task. A `DynamicObject` then absorbs those fictional calls when normal C# execution resumes.

The joke is the API; the process boundary is real. By default, the runner only reads the relevant files, discovers which Codex, Claude Code, or GitHub Copilot CLI it would use, and prints the exact fluent statement in a plain-text dry-run plan. It does not probe or launch the harness, create files, or edit the workspace. A deliberate `--yes,please,proceed` enables the live path, which probes the interface, sends the task over standard input without a shell, confines its configured tools, and requires a run-specific JSON completion report.

## Guardrail

Execution has two deliberate gates. First, the program must pass `Options.Proceed = true`; the supplied command-line programs do this only for the exact flag `--yes,please,proceed`. Second, when the instruction file already exists, the runner explains that the agent may amend or replace it and other workspace files. It proceeds only after the exact interactive reply `yes, please proceed`. The shorter `no` stops without launching an agent; `y`, `yes`, and other approximations are rejected. Dry-run mode never prompts or launches an agent, and end-of-input at the second gate fails closed.

The ceremony and diagnostic voice are inspired by Christian Hofstede-Kuhn's [Bespoke: A Programming Language for People Who Say Please](https://blog.hofstede.it/bespoke-a-programming-language-for-people-who-say-please/). This project remains ordinary C# and borrows the article's civilised tone, not its proposed language syntax or implementation.

## Run it

```sh
dotnet build --configuration Release
dotnet run
dotnet run -- --yes,please,proceed
```

The default dry run is side-effect-free and shows the selected harness, relevant paths, file state, and exact statement. A real run requires the explicit flag and an installed, authenticated supported CLI. To select an adapter explicitly, combine `--agent codex` with `--yes,please,proceed`. Build outputs (`bin/`, `obj/`) and runtime reports (`.superintelligence/`) are ignored; agent-authored project files are tracked normally.

## Examples

- [Specification workflow](examples/specification-workflow/) creates `AGENTS.md`, a constitution, a consumer-focused feature specification, a technical plan, and traceable tasks.
- [Static web design](examples/static-web-design/) compares three art directions, records a design system and review checklist, and builds a local repair-cafe site.
- [Enterprise C#](examples/enterprise-csharp/) creates agent instructions, `.editorconfig`, shared MSBuild policy, architecture guidance, quality gates, and a pull-request checklist.

Each example is a standalone SDK project that links the same `SuperIntelligenceBuilder.cs`. Its committed outputs were produced by a real authenticated Codex run.

## Documentation

- [Source manual](index.html)
- [Examples](examples/)
- [Design and development record](about.html)
- [Validation record](VALIDATION.md)
- [Social description review](editorial/social-description-review.md)
- [Single-file builder source](SuperIntelligenceBuilder.cs)
