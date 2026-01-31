2026-01-30

This is vanilla JavaScript, no dependencies, HTML, CSS, JavaScript app, so we have like a separate HTML, separate CSS, separate JavaScript file. Ensure the output is as highest quality and ensure that UX and UI is implemented and thoughtfully validated. Make sure to look through, after implementing this, uh, the requirements, after implementing all the requirements, make sure to look through the code, review, and fix any issues if there are any.


A00 Project overview v00

This project is a single-page web application that convincingly imitates a modern terminal emulator while being intentionally non-functional in a humorous, non-destructive way. The page should feel like a real developer or security terminal at first glance: fast, crisp typography, faithful prompt/cursor behavior, believable status banners, and the subtle visual imperfections of a retro CRT overlay. The joke is revealed through the interaction model: any command the user enters will produce a plausible-looking error plus a second line that gently and sarcastically nudges the user toward rest, breaks, hobbies, or a change of pace. The user should feel like the system is serious, but the output is comically unhelpful.

The experience has three pillars. First, the visual credibility: the layout, colors, spacing, scroll behavior, and cursor mechanics should closely match a modern terminal, with an optional CRT treatment that adds scanlines, bloom, and minor distortion without harming readability. Second, a simple but polished input loop: the user sees a banner and a prompt, types commands, and the terminal outputs lines with realistic timing. Third, a deterministic-yet-randomized response engine: it extracts hints from the input (command name, flags, paths) to generate an error that appears tailored, then adds a contextual quip that can incorporate time-of-day, day-of-week, and nearby holidays if available.

The goal is not to prank in a harmful sense. There is no file access, no actual system operations, no network calls required for core behavior, no impersonation of real-world institutions, and no attempt to mislead users into disclosing information. The humor comes from the mismatch between the convincing terminal facade and the consistently useless results, plus the playful commentary.

B00 Non-goals and constraints v00

This project must not execute real commands, run scripts, access local filesystem APIs, or claim to be connected to real infrastructure. It must not prompt for credentials, keys, or personal data. It must not display alarming claims like “you are hacked” or “law enforcement notice.” Any “security” theme must remain generic and obviously fictitious upon minimal interaction, and the output should remain lighthearted.

All styling is dark-only. No light theme is required. Responsiveness is required: desktop and mobile (including soft keyboard) must function with the prompt always reachable and the scroll behavior correct.

C00 User experience flow v00

On page load, the user sees a full-viewport terminal surface. A small top bar (optional but recommended) shows a dropdown to select a shell persona (PowerShell, Bash). The terminal body shows an initial “connecting” sequence, then a banner and a prompt. Output appears with a short, non-annoying typing delay that feels like a terminal printing lines, not a slow typewriter effect.

The user can type at the prompt. Pressing Enter submits the line. The terminal echoes the submitted command, then prints an error response (always) and a humorous continuation line. The prompt returns immediately after a brief delay.

If the user types “help”, “--help”, “/?”, or “man”, the terminal prints a long, technical-looking help screen that provides no actionable information. It should fill approximately one screen at common viewport sizes and read like real documentation, with headings, pseudo-options, and disclaimers, but it should be circular and non-specific.

The shell dropdown changes the prompt style, banner wording, and a few aesthetic details (prompt glyph, path formatting, typical error phrasing), but the underlying behavior remains the same.

D00 Layout and components v00

Terminal page structure (top to bottom):

1. Shell selector bar (fixed height, minimal).

   * Left: dropdown “Shell” with options:

     * PowerShell (default)
     * Bash
   * Right: optional tiny indicators (non-interactive) such as “LOCALHOST”, “SESSION: ephemeral”, “MODE: read-only parody”. If included, keep subtle.

2. Terminal viewport (fills remaining height).

   * Scrollable output region with virtual “lines” appended.
   * At bottom: input line with prompt + editable text.

3. Input model:

   * The input should behave like a terminal: monospaced, no borders, background transparent, caret hidden (custom caret drawn), selection allowed.
   * Pressing Up/Down can optionally cycle through a small fake history (the user’s own last N commands), but not required.

Recommended DOM roles:

* Output region: a semantic container with aria-live="polite" for new lines.
* Input: an actual input or textarea (single-line behavior) for mobile compatibility, styled to look like raw terminal text.

E00 Visual design specification v00

E01 Color palette v00

Base palette is near-black with subtle green/blue phosphor accents. Two “layers” exist: modern terminal base plus optional CRT overlay.

Modern base (values are defaults and can be tuned):

* Background: #0b0f14
* Primary text: #d7dde5
* Dim text: #8b95a7
* Prompt accent: #79c0ff (blue) for Bash, #7ee787 (green) for PowerShell, or vice versa; choose one mapping and keep consistent.
* Error primary: #ff6b6b
* Error secondary: #ffa657
* Warning/info: #f2cc60
* Selection background: rgba(121,192,255,0.28)
* Cursor: #d7dde5 at 85-100% opacity

CRT overlay accents:

* Phosphor glow tint: rgba(110, 255, 180, 0.10) applied via text-shadow or filter
* Scanlines: rgba(255,255,255,0.03) alternating bands
* Vignette: rgba(0,0,0,0.35) corners
* Noise: rgba(255,255,255,0.02) animated

Contrast rule: in all states, ensure body text remains easily readable. CRT effects must reduce effective contrast by no more than a small amount. The “primary text” must remain clearly legible against background, including on mobile in bright conditions.

E02 Typography v00

Primary font: a modern monospace that looks terminal-authentic and readable.

* Preferred stack: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace
* Font size: 14px desktop default; 12-13px on small screens; allow user zoom naturally.
* Line height: 1.45 to 1.60, tuned for readability with scanlines.
* Font smoothing: enabled where available (platform dependent), but avoid overly thin weight. Use font-weight 400-500.

E03 Terminal surface styling v00

The terminal viewport should have:

* Slight inner padding: 16px desktop, 12px mobile.
* A subtle border or edge glow optional:

  * Border: 1px solid rgba(255,255,255,0.06)
  * Inner shadow: 0 0 0 1px rgba(0,0,0,0.35)
* Rounded corners optional if it does not break authenticity. If used: 10px radius on viewport, not on individual lines.

E04 CRT effects v00

CRT mode is always on in this product, but implemented as subtle overlays.

* Scanlines: a repeating linear gradient overlay with 2-3px banding. Opacity very low.
* Bloom: apply a tiny text glow using text-shadow, not a global blur. Example: text-shadow: 0 0 6px rgba(110,255,180,0.12)
* Noise: a pseudo-random grain layer, animated slowly (5-10s loop), very low opacity.
* Drift/distortion: optional subtle vertical jitter or curvature, but must not shift layout enough to impair reading. If implemented, keep amplitude under 1-2px and avoid affecting input caret alignment.
* Flicker: occasional slight brightness variation, rare and gentle.

Accessibility: provide a keyboard shortcut or hidden setting to reduce effects for motion sensitivity (for example, respects prefers-reduced-motion). When reduced motion is enabled, disable flicker/noise animation and keep scanlines static.

F00 Terminal behavior and interaction v00

F01 Output timing v00

Output is appended in bursts with short delays to feel realistic.

* Initial banner: 2-6 lines, each line delayed by 40-120ms, with a small pause before prompt appears (150-300ms).
* After command submission:

  * Echo command immediately (0-10ms).
  * Delay 80-180ms, print error line.
  * Delay 80-220ms, print humor line.
  * Delay 80-160ms, show next prompt.

Delays are randomized within ranges, but total time from Enter to next prompt should usually be under 800ms.

F02 Cursor behavior v00

The visible cursor is custom-rendered and not the browser caret.

* Shape: block cursor by default, 0.9em height, 0.6em width, or a thin bar cursor as option per shell (PowerShell block, Bash bar).
* Blink: 530ms on, 530ms off (close to typical terminal defaults). Make it consistent across the session.
* Cursor position tracks the input caret position. The simplest approach is to keep input single-line and do not support mid-line navigation beyond basic left/right arrows. If left/right is supported, cursor must reflect it.

F03 Scroll behavior v00

Terminal output scrolls naturally. When new lines appear:

* If the user is at the bottom, auto-scroll to bottom.
* If the user has scrolled up, do not force scroll; show a subtle “new output” indicator (optional) that scrolls to bottom on click. Keep it minimal.

F04 Prompt styles v00

PowerShell prompt example:

* “PS C:\Users\operator> ” with prompt accent color.
* Path can be faux and consistent, such as “C:\Users\operator” always, or it can occasionally “change” after commands (purely cosmetic).

Bash prompt example:

* “operator@localhost:~$ ” with prompt accent on username/host, dim path, normal glyph.
* The working directory can remain “~” always.

Shell dropdown changes:

* Prompt prefix and glyph
* Default banner text
* Slightly different error formatting templates

G00 Startup banner and welcome text v00

On load, print something like:

* “Initializing terminal subsystem… OK”
* “Negotiating session parameters… OK”
* “Loading profile: operator (read-only)”
* Then a larger banner line, ASCII-style but not huge:

  * “GLOBAL POWERSHELL INTERFACE” or “GLOBAL SHELL CONSOLE”
* Then: “Connected. Type ‘help’ for guidance.”

For humor safety, avoid phrases implying real hacking or illegal access. Use fictional or generic terms like “global console” without referencing real agencies.

H00 Help screen content v00

Trigger inputs:

* Exactly “help”
* Ends with “--help”
* Exactly “man”
* Exactly “/?”

The help screen requirements:

* Approximately one screen of output at 14px font on a 900px tall viewport, roughly 25-40 lines.
* Looks structured with headings, usage, options, examples, and notes.
* Intentionally unhelpful: circular definitions, vague constraints, contradictory statements, and “for more information, consult this help.”

The help text should not mention that it is a joke. The humor should be in its uselessness and corporate-sounding verbosity.

Example help content skeleton (to be generated as static lines with small randomness like version number):

* Header: “GLOBAL SHELL HELP SYSTEM vX.Y.Z”
* “SYNOPSIS”
* “DESCRIPTION”
* “OPTIONS” with meaningless flags
* “NOTES” with disclaimers
* “EXAMPLES” that all fail conceptually
* Footer: “For additional guidance, type ‘help’.”

I00 Command handling and always-error rule v00

All commands result in an error response, including empty input. The only exception is “help” family, which prints the unhelpful help screen and then returns to prompt without printing a separate error (or optionally prints a mild warning at the end like “Note: this guidance is informationally complete.”).

Empty input behavior:

* If user presses Enter on an empty line, echo nothing and either do nothing, or print a gentle error like “Input contained no actionable tokens.” followed by a humor line. Prefer the latter to keep the loop amusing.

Safety and content constraints for errors:

* Never claim real destructive actions occurred.
* Never prompt for passwords, tokens, or personal info.
* Errors should look technical but remain clearly non-operational in aggregate.

J00 Error generation system v00

J01 Parsing heuristics v00

Given user input string raw:

1. Normalize whitespace, keep original for echo.
2. Tokenize by spaces, respecting simple quoted segments optionally (best effort).
3. Determine:

   * primaryCommand: first token that does not start with “-” or “/” (if any)
   * flags: tokens starting with “-” or “--” or “/”
   * paths: tokens that contain “/” or “\” or end with common extensions (.txt, .js, .ps1, .sh, .json, .yml, .log)
   * numericLiterals: tokens matching /^\d+$/ or /^\d+.\d+$/
   * hasPipe: input contains “|”
   * hasRedirect: contains “>” or “<”
   * looksLikeNetwork: contains “http”, “ssh”, “scp”, “ping”, “curl”, “wget”
   * lengthClass: short (<8 chars), medium, long (>60 chars)
4. Determine shell persona: “powershell” or “bash”.

J02 Error selection model v00

The error response is composed of two parts:

* Line 1: technical error line, derived from a template selected from a pool of at least 20 templates. Templates may incorporate extracted tokens.
* Line 2: humorous continuation line, selected from a pool and optionally contextualized by time/day/holiday proximity.

Selection steps:

1. Compute a stable seed from (input + shell + sessionStartTimestamp) to keep the same command producing the same error within a session, if desired. Alternatively, allow full randomness each time; both are acceptable. A good compromise is “mostly stable with slight variance”:

   * Choose template based on seeded RNG
   * Choose humor line based on non-seeded RNG to keep it fresh
2. Choose an error template matching detected features with weighted rules. Examples:

   * If hasPipe, prefer templates mentioning pipeline binding or stream framing.
   * If looksLikeNetwork, prefer DNS/handshake templates.
   * If flags exist, prefer “invalid flag” templates.
   * If paths exist, prefer path/permission templates.
   * If numeric literals exist, prefer range/precision templates.
   * Otherwise, generic “unrecognized command” templates.
3. Fill placeholders:

   * {{cmd}} from primaryCommand or “<input>”
   * {{flag}} pick one flag
   * {{path}} pick one path
   * {{token}} pick any token
   * {{code}} generate pseudo error code, e.g. “0x8BADF00D”, “E0217”, “PSX0034”
4. Print in a shell-appropriate format.

J03 Shell-specific formatting v00

PowerShell style examples:

* “<cmd> : The term ‘<cmd>’ is not recognized as the name of a cmdlet, function, script file, or operable program.”
* “At line:1 char:1”
* “+ <cmd> <rest>”
* “+ ~~~~”
* “CategoryInfo : …”
* “FullyQualifiedErrorId : …”

Bash style examples:

* “bash: <cmd>: command not found”
* “<cmd>: invalid option -- ‘<flag>’”
* “<cmd>: <path>: No such file or directory”
* “exit status 127”

Do not overdo multi-line PowerShell stack traces every time. Keep most errors 1-3 lines, occasionally 4-6 lines for variety. Always include at least one red-highlighted line.

K00 Error message templates v00

Provide at least 20 templates, each with:

* id
* shell applicability
* trigger hints
* format lines (array of strings)
* placeholders used

Below is a reference set suitable as JavaScript data. These are example templates; implementation may add more.

```js
export const ERROR_TEMPLATES = [
  {
    id: "E01_PS_UNRECOGNIZED_CMDLET",
    shell: "powershell",
    weight: 8,
    hints: ["default"],
    lines: [
      "{{cmd}} : The term '{{cmd}}' is not recognized as the name of a cmdlet, function, script file, or operable program.",
      "At line:1 char:1",
      "+ {{input}}",
      "+ ~~~~",
      "FullyQualifiedErrorId : CommandNotFoundException"
    ]
  },
  {
    id: "E02_BASH_CMD_NOT_FOUND",
    shell: "bash",
    weight: 8,
    hints: ["default"],
    lines: [
      "bash: {{cmd}}: command not found"
    ]
  },
  {
    id: "E03_PS_INVALID_PARAMETER",
    shell: "powershell",
    weight: 7,
    hints: ["flags"],
    lines: [
      "{{cmd}} : A parameter cannot be found that matches parameter name '{{flag}}'.",
      "At line:1 char:1",
      "+ {{input}}",
      "+ ~~~~",
      "FullyQualifiedErrorId : NamedParameterNotFound"
    ]
  },
  {
    id: "E04_BASH_INVALID_OPTION",
    shell: "bash",
    weight: 7,
    hints: ["flags"],
    lines: [
      "{{cmd}}: invalid option -- '{{flagShort}}'",
      "Try '{{cmd}} --help' for more information."
    ]
  },
  {
    id: "E05_PS_PIPELINE_BINDING",
    shell: "powershell",
    weight: 6,
    hints: ["pipe"],
    lines: [
      "{{cmd}} : Cannot bind pipeline input to parameter '{{param}}' because it is null or empty.",
      "CategoryInfo : InvalidData: (:) [], ParameterBindingValidationException",
      "FullyQualifiedErrorId : ParameterArgumentValidationErrorNullNotAllowed"
    ]
  },
  {
    id: "E06_BASH_PIPE_BROKEN",
    shell: "bash",
    weight: 6,
    hints: ["pipe"],
    lines: [
      "{{cmd}}: write error: Broken pipe",
      "hint: your pipeline achieved enlightenment and left early"
    ]
  },
  {
    id: "E07_PS_ACCESS_DENIED",
    shell: "powershell",
    weight: 6,
    hints: ["path"],
    lines: [
      "Access to the path '{{path}}' is denied.",
      "At line:1 char:1",
      "+ {{input}}",
      "+ ~~~~",
      "FullyQualifiedErrorId : UnauthorizedAccessException"
    ]
  },
  {
    id: "E08_BASH_NO_SUCH_FILE",
    shell: "bash",
    weight: 6,
    hints: ["path"],
    lines: [
      "{{cmd}}: {{path}}: No such file or directory"
    ]
  },
  {
    id: "E09_PS_FORMAT_EXCEPTION",
    shell: "powershell",
    weight: 5,
    hints: ["numbers"],
    lines: [
      "Input string '{{number}}' was not in a correct format.",
      "CategoryInfo : InvalidOperation: (:) [], FormatException",
      "FullyQualifiedErrorId : FormatException"
    ]
  },
  {
    id: "E10_BASH_NUMERIC_RANGE",
    shell: "bash",
    weight: 5,
    hints: ["numbers"],
    lines: [
      "{{cmd}}: value '{{number}}' out of range",
      "exit status 2"
    ]
  },
  {
    id: "E11_PS_MODULE_NOT_LOADED",
    shell: "powershell",
    weight: 5,
    hints: ["default"],
    lines: [
      "Import-Module : The specified module '{{cmd}}' was not loaded because no valid module file was found in any module directory.",
      "FullyQualifiedErrorId : Modules_ModuleNotFound"
    ]
  },
  {
    id: "E12_BASH_PERMISSION_DENIED",
    shell: "bash",
    weight: 5,
    hints: ["path"],
    lines: [
      "bash: {{path}}: Permission denied"
    ]
  },
  {
    id: "E13_PS_DNS_RESOLUTION",
    shell: "powershell",
    weight: 4,
    hints: ["network"],
    lines: [
      "{{cmd}} : NameResolutionFailure: The remote name could not be resolved: '{{host}}'",
      "FullyQualifiedErrorId : WebCmdletWebResponseException"
    ]
  },
  {
    id: "E14_BASH_COULD_NOT_RESOLVE_HOST",
    shell: "bash",
    weight: 4,
    hints: ["network"],
    lines: [
      "{{cmd}}: (6) Could not resolve host: {{host}}"
    ]
  },
  {
    id: "E15_PS_SYNTAX_UNEXPECTED_TOKEN",
    shell: "powershell",
    weight: 4,
    hints: ["redirect"],
    lines: [
      "ParserError: Unexpected token '{{token}}' in expression or statement.",
      "At line:1 char:{{charPos}}",
      "+ {{input}}",
      "+ ~~~~"
    ]
  },
  {
    id: "E16_BASH_AMBIGUOUS_REDIRECT",
    shell: "bash",
    weight: 4,
    hints: ["redirect"],
    lines: [
      "bash: {{token}}: ambiguous redirect"
    ]
  },
  {
    id: "E17_PS_OBJECT_NOT_FOUND",
    shell: "powershell",
    weight: 4,
    hints: ["path"],
    lines: [
      "Get-Item : Cannot find path '{{path}}' because it does not exist.",
      "FullyQualifiedErrorId : PathNotFound"
    ]
  },
  {
    id: "E18_BASH_NOT_A_DIRECTORY",
    shell: "bash",
    weight: 4,
    hints: ["path"],
    lines: [
      "{{cmd}}: {{path}}: Not a directory"
    ]
  },
  {
    id: "E19_PS_TIMEOUT",
    shell: "powershell",
    weight: 3,
    hints: ["network", "default"],
    lines: [
      "OperationStopped: The operation has timed out.",
      "FullyQualifiedErrorId : TimeoutException,{{cmd}}"
    ]
  },
  {
    id: "E20_BASH_TIMED_OUT",
    shell: "bash",
    weight: 3,
    hints: ["network", "default"],
    lines: [
      "{{cmd}}: Operation timed out",
      "exit status 124"
    ]
  },
  {
    id: "E21_PS_POLICY_BLOCKED",
    shell: "powershell",
    weight: 3,
    hints: ["default"],
    lines: [
      "File {{pathOrCmd}} cannot be loaded because running scripts is disabled on this system.",
      "For more information, see about_Execution_Policies.",
      "FullyQualifiedErrorId : UnauthorizedAccess"
    ]
  },
  {
    id: "E22_BASH_SYNTAX_ERROR_NEAR",
    shell: "bash",
    weight: 3,
    hints: ["redirect", "pipe"],
    lines: [
      "bash: syntax error near unexpected token '{{token}}'"
    ]
  }
];
```

Placeholder notes:

* {{input}} is full trimmed input.
* {{flagShort}} is a single character from a flag like “-x” or the first letter of a long flag.
* {{param}} can be selected from a short list like ["InputObject","Path","Filter","Name","Value"].
* {{host}} can be extracted from tokens resembling domains, or fallback to “example.invalid”.
* {{charPos}} can be a small random integer 1-20 for flavor.
* {{pathOrCmd}} chooses a path if present else cmd.

L00 Humor continuation line system v00

Each command (except help) produces a second line that is playful and context-aware. It should be clearly separate from the error line, ideally in dimmer color or italic-like styling (but keep to monospace). It must not be insulting. Tone target: dry, mildly sarcastic, relatable.

Context sources allowed:

* System clock: local time, day of week, date
* Optional: a simple built-in holiday table (static) for major holidays, no external calls required
* Optional: user locale for weekday names, but not required

Time-based rules:

* If local time is after 18:00: nudge toward winding down.
* If before 09:00: nudge toward coffee, slow start.
* If Friday: weekend-related nudge.
* If Saturday/Sunday: “you are working on a weekend” nudge.
* If within 7 days of a holiday from a small list: mention it subtly.

Reference humor lines as JavaScript data plus small template interpolation.

```js
export const HUMOR_LINES = [
  { id: "H01", weight: 6, text: "Suggestion: consider a break. Your command will still fail later." },
  { id: "H02", weight: 5, text: "That did not work. On the bright side, neither did anything else today." },
  { id: "H03", weight: 5, text: "If you stare at the cursor long enough, it will blink in empathy." },
  { id: "H04", weight: 5, text: "Maybe the real output was the friends you did not ping along the way." },
  { id: "H05", weight: 4, when: "late", text: "It is after {{time}}. This is a strong case for logging off." },
  { id: "H06", weight: 4, when: "early", text: "Before {{time}} is a bold time to argue with a terminal." },
  { id: "H07", weight: 6, when: "friday", text: "It is Friday. Your weekend is attempting to connect." },
  { id: "H08", weight: 6, when: "weekend", text: "It is the weekend. This command requests that you go outside." },
  { id: "H09", weight: 4, when: "holidaySoon", text: "Reminder: {{holiday}} is coming up. This is not mandatory productivity season." },
  { id: "H10", weight: 4, text: "Have you tried turning your ambition off and on again?" },
  { id: "H11", weight: 4, text: "Error acknowledged. Motivation not found." },
  { id: "H12", weight: 4, text: "This system is read-only, like your group chat when you mention 'refactor'." },
  { id: "H13", weight: 3, text: "I parsed your input and concluded you deserve snacks." },
  { id: "H14", weight: 3, text: "Your command contained {{keyword}}. I recommend a walk instead." },
  { id: "H15", weight: 3, text: "If this is important, consider writing it down and ignoring it for 20 minutes." },
  { id: "H16", weight: 3, text: "Fun fact: the cursor blinks at approximately the same rate as your patience." },
  { id: "H17", weight: 3, text: "This is not a failure. It is a lifestyle choice." },
  { id: "H18", weight: 3, text: "The terminal has spoken: no. The terminal is very confident." },
  { id: "H19", weight: 2, text: "Perhaps today is a 'minimum viable effort' kind of day." },
  { id: "H20", weight: 2, text: "If you need inspiration, try a hobby that does not support flags." }
];
```

Keyword insertion rule for H14:

* Choose a “safe” keyword from parsed tokens:

  * Prefer primaryCommand if alphanumeric
  * Else pick a short token (2-12 chars) that is not a path and not purely numeric
  * Sanitize to remove punctuation

Holiday table suggestion (minimal, static, local-date based):

* New Year’s Day (Jan 1)
* Valentine’s Day (Feb 14)
* Independence Day (Jul 4) if US locale, otherwise omit or generalize
* Halloween (Oct 31)
* Thanksgiving (4th Thursday of Nov) optional complexity
* Christmas (Dec 25)

If holiday computation feels heavy, keep it simple: just fixed-date holidays.

M00 Example combined outputs v00

Example 1 (PowerShell, input: “Get-Process -All”):

* Error line(s): “Get-Process : A parameter cannot be found that matches parameter name ‘-All’.” plus minimal PS framing
* Humor: “It is Friday. Your weekend is attempting to connect.”

Example 2 (Bash, input: “curl [https://example.com”](https://example.com”)):

* Error: “curl: (6) Could not resolve host: example.com”
* Humor: “Suggestion: consider a break. Your command will still fail later.”

Example 3 (Bash, input: “cat ./notes.txt > out.txt”):

* Error: “bash: syntax error near unexpected token ‘>’” or ambiguous redirect
* Humor: “Have you tried turning your ambition off and on again?”

N00 UI states and styling rules v00

Line types in output should be styled distinctly:

* Banner lines: dim text or prompt accent, optional ASCII art
* Prompt line: prompt portion in accent, user input in primary text
* Error line: primary error text in red; if multi-line, only the first line needs strong red and the rest can be dim red
* Humor line: dim text, optionally with a prefix like “note:” or “hint:” in a muted color

No nested lists in UI output. If you present multiple items, format them as aligned text columns or separate lines.

O00 Implementation notes for the coding agent v00

Core modules:

* ui/TerminalView: renders lines, manages scroll anchoring, applies CRT overlays
* ui/InputLine: handles keyboard input, caret tracking, history optional
* engine/Parser: tokenization, feature extraction
* engine/ErrorComposer: template selection, placeholder filling, shell formatting
* engine/HumorComposer: time/day/holiday logic, keyword insertion
* engine/Rng: seeded RNG helper (optional)
* data/errorTemplates, data/humorLines, data/helpText

Performance:

* Keep DOM line count bounded. When output exceeds a threshold (for example 400 lines), remove oldest lines while preserving scroll position reasonably.
* Effects via CSS overlays preferred over per-character rendering.

Testing:

* Snapshot tests for composed outputs given deterministic inputs.
* Visual check for cursor alignment, scanlines readability, mobile keyboard interaction.

P00 Acceptance criteria v00

The terminal fills the viewport, dark-only, with a convincing modern terminal look plus subtle CRT overlay. Text remains readable at all times.

Shell dropdown changes prompt and error style in a noticeable way (PowerShell vs Bash), without changing the always-error behavior.

On load, a banner prints with small delays and then shows a prompt. Cursor blinks and tracks typing.

Any entered command produces an error response and a humorous continuation line. “help” produces a long, technical-looking help screen that provides no practical guidance.

Errors look tailored to the input: flags trigger flag-related errors, pipes trigger pipeline errors, paths trigger path errors, network-like commands trigger DNS/timeout errors.

No real command execution occurs, no sensitive data prompts, and output remains non-alarming and playful.
