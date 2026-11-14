**Users must have fun using this project.**

We are building a playful Microsoft Edge and Google Chrome extension that makes ordinary webpages feel interactive: users can punch, crack, shatter, scatter, or otherwise transform page elements through humorous, temporary visual effects. Effects must be delightful, controllable, reversible, and non-destructive to the website's actual data.

## Specifications are authoritative

Read the specifications in `.specs/` before planning or implementing work. Start with `.specs/suggestions001-01-initial-main-specification.md`, the baseline requirements. Once a specification has been implemented, it is **immutable**: do not edit or rewrite it. Express subsequent changes through new, incrementally numbered specifications or change requests that reference the earlier requirements. An unimplemented specification may be clarified before implementation; preserve the history of implemented decisions.

After **every** feature implementation, reread `.specs/suggestions001-02-answer-questions-after-each-feature-implementation.md`. Answer every applicable acceptance question with evidence, investigate negative or uncertain answers, and make required corrections before marking the feature complete. Do not treat the questionnaire as a formality.

## Engineering standards

Use modern, strict **TypeScript** for all application code and **Bun** for package management, builds, and bundling. Write small, elegant, composable, clearly formatted modules with explicit boundaries and interfaces. Keep each visual effect independently implemented, tested, and loadable on demand; shared infrastructure must not depend on individual effects. Prefer sound design over shortcuts, hacks, suppressed errors, or unnecessary abstractions.

The shipped extension must have **no external runtime dependencies or remotely hosted executable code**. Prefer implementing effect logic with native browser APIs and project-owned TypeScript. Development tools, including TypeScript and Playwright, may be dev dependencies. If a runtime library is genuinely unavoidable, review its security and license, pin its version, and vendor a self-contained, locally bundled artifact into `vendor/` through a one-time build operation. Keep the resulting code inside the extension package; retain vendoring scripts or source only when needed for reproducibility, maintenance, or license compliance. Never vendor unreviewed executable code.

## Research, security, and verification

Research effects thoroughly before implementation. Treat original bookmarklets and third-party snippets as untrusted: **never execute them on the development machine**. Inspect source statically first; if dynamic investigation is justified, use Playwright only inside an approved disposable, isolated environment separate from the workstation. Reimplement reviewed behavior in project-owned code and preserve source credit, provenance, and required licensing notices. Never introduce behavior that modifies a website's persistent data.

Test the actual extension behavior, visual quality, targeting, cleanup, performance, and browser compatibility. An effect is not complete merely because it compiles or animates once. Keep diagnostics privacy-preserving; do not collect page contents. Record verification evidence and limitations.

## Assets and collaboration

Create illustrations and other assets directly when possible. If essential material requires user action, first provide a precise, self-contained asset specification or generation prompt that the user can execute and return. Ask only when necessary; otherwise proceed independently using sound judgment. Communicate substantive requirements and changes through incremental specifications, and keep implementation decisions traceable to them.

### **Playwright Exploratory and Visual Testing**

When the current environment supports it, **Playwright testing is mandatory** for every implemented feature. Prefer the already installed Playwright version and existing browser binaries rather than downloading or installing new versions. When feasible, load the browser extension into Playwright, open a representative test webpage (create one if necessary), and exercise the feature in a real browser. Capture screenshots before activation, during execution, and after cleanup. Thoroughly inspect and compare them: Does the effect look and behave as intended? Does it integrate naturally with the surrounding page? Are its positioning, animations, and visual details correct? Has anything unrelated been displaced, hidden, damaged, or visually corrupted? Does the page return to its original appearance after the effect stops? Are there unexpected console errors or runtime failures? Investigate and fix any discrepancies, then repeat the test. **Do not skip available browser-based verification merely because unit tests pass.** If Playwright or a compatible browser cannot run with the current machine's capabilities, document the specific limitation rather than installing unnecessary dependencies or claiming the feature was visually verified. Only execute trusted, project-controlled code in the normal development environment; original untrusted bookmarklets remain subject to the separate isolation requirements.