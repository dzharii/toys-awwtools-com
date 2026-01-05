Important: 

Use original implementation at original_eliza_anthay_github_io for new project. 
But split it into separate html, javascript and css implementation. 

A00 Project context and vision

ChatKGB is a UI and personality refactor of an existing single page ELIZA implementation. The current project is a historically faithful recreation of Joseph Weizenbaum's 1966 ELIZA running the DOCTOR script, presented as a terminal-like web page that accepts user text input and returns deterministic, rule-based responses.

This refactor keeps the underlying interaction model (a text console that produces responses on Enter, plus a small set of star-prefixed commands) and keeps the deterministic, script-driven transformation engine. The change is primarily experiential: the application is re-themed into a fictional Soviet-era interrogation console inspired by the video game "Papers, Please". The user is no longer "talking to a psychotherapist". The user is interacting with a stylized interrogator persona, presented as an officer at a terminal. The project name becomes "ChatKGB" (exact capitalization), and the input prompt is the Unicode hammer and sickle symbol "☭" (U+262D).

This is an art project and an interaction design exercise. It is not intended as political advocacy, education, or historical commentary. The design goal is to evoke a bureaucratic, procedural, suspicion-driven tone through typography, layout, phrasing, and UI affordances (stamps, docket headers, case file language) while remaining safe, non-violent, and non-threatening in content.

The deliverable is an updated UX/UI specification for changes applied to the existing repository files, with the implementation expected to be performed by an automated coding agent or another implementer. The implementer will have access to the existing files, including `eliza.html`, and will apply modifications without introducing additional build tooling. All functionality remains client-side and offline.

Credit and provenance must remain visible and explicit. The application is based on Anthony Hay's ELIZA implementation (repo referenced in `credit.txt`) and is distributed under the MIT License contained in `LICENSE`. The refactor must preserve required license notices and clearly indicate that ChatKGB is a derivative themed presentation built on that codebase and interaction engine.

B00 Scope

In scope:

ChatKGB branding changes in the UI and help text, including changing labels and displayed introductory text from ELIZA/DOCTOR framing to ChatKGB framing.

A visual redesign of the console to evoke a Soviet-era terminal aesthetic inspired by "Papers, Please", including colors, header layout, typography choices (still monospace), and optional non-intrusive visual effects (scanlines, vignette, paper texture, stamp overlays).

A persona refactor: replace the psychotherapist tone with a fictional interrogator tone. This includes replacing the opening greeting, built-in fallback messages, and the default response script content used by the transformation engine.

Small feature additions that reinforce the "case file" mental model without changing the core interaction loop, such as adding an always-visible "Case Header" block with session metadata and a minimal "Dossier" summary panel that reflects data already present in the current engine state (for example, message count, last command, transformation limit, trace mode).

Out of scope:

Network connectivity, accounts, persistence beyond the existing "save conversation to file" behavior.

Replacing the transformation engine with an LLM, ML model, or remote service.

Introducing non-textual conversation input (voice, images) or multi-window UI.

Adding historically realistic or instructional content about real organizations, or content that encourages harm, threats, or coercion. The interrogator persona must remain fictional, bureaucratic, and non-violent.

C00 Core concepts and mental model

ChatKGB is a terminal simulation with two distinct layers:

The presentation layer is a stylized console. It renders a scrollable transcript area ("log") and an input area ("console") with a visible prompt glyph.

The conversation engine layer is a deterministic text transformation system. It tokenizes the user input into words and delimiters, applies substitutions, selects keywords by precedence, applies decomposition and reassembly rules, optionally stores "memories", and outputs a response. This layer remains deterministic given the current internal state (including rule selection indices and the "limit" counter).

In ChatKGB, the same engine behavior is re-framed as an interrogation protocol:

The user is the "Subject".

The system persona is the "Officer" (or "Duty Officer"), representing the ChatKGB interrogator.

The transcript is presented as an "Interrogation Record" with numbered entries.

The "memory" mechanism is presented as "Prior Statements on File" (still mechanically the same queue behavior).

D00 UX layout and visual design

D01 Overall page layout

The page is divided into three vertical regions:

1. A fixed header region ("Case Header"), always visible at the top.

2. A scrollable transcript region ("Interrogation Log") occupying the remaining space.

3. A fixed input region at the bottom containing the prompt glyph and an input field.

The layout must remain usable at typical desktop widths, and must degrade gracefully when the window height is small. No region may overlap another; the input region must always remain accessible without scrolling.

D02 Case Header content

The Case Header must include the following lines, in order, each on its own row:

Line 1: "CHATKGB" followed by a compact session status string. Example: "CHATKGB  |  SESSION ACTIVE"

Line 2: "CASE: [generated case id]" where case id is a short deterministic identifier derived from the session start time or a monotonic counter. If determinism is a concern, use a simple counter starting at 0001 per page load.

Line 3: "SUBJECT: UNREGISTERED" by default. This value changes only if the user explicitly sets a subject name via a command (see G00).

Line 4: "PROMPT: ☭" and "MODE: INTERROGATION" and "TRACE: ON/OFF" and "MAXTRAN: N" displayed as a compact status line.

The header must not include large blocks of explanatory text. Explanations belong in the transcript when the user runs *help.

D03 Transcript formatting

Each exchange is written into the log as two entries:

A "SUBJECT" line containing the user input as displayed text.

An "OFFICER" line containing the system response.

Both lines must include an exchange number that increments per user message, starting at 0001. The exchange number is shared for the pair, so both the SUBJECT and OFFICER lines for the same exchange show the same number.

The display case rule is: both SUBJECT and OFFICER lines are rendered in uppercase to match the terminal aesthetic. The raw input is still stored for saving, but the visible transcript uses uppercase.

Blank lines: after each OFFICER line, the UI inserts exactly one empty line.

D04 Input area behavior

The bottom input area shows a leading prompt glyph "☭" to the left of the input field. The prompt glyph is not editable.

The input field accepts a single logical line. Pressing Enter submits the current input. Shift+Enter must not insert newlines; it must behave the same as Enter (submit), to keep the terminal feel.

If the input is empty and the system is in "replay mode" (see G00 *cacm behavior if kept), Enter advances replay; otherwise Enter does nothing.

On submit, the input field is cleared, focus returns to the input field, and the transcript auto-scrolls to the newest content.

D05 Visual styling requirements

The current green CRT look is replaced with a Soviet-era console palette inspired by "Papers, Please":

Background: very dark, near-black, with a slight warm tint (brown/olive).

Primary text: desaturated amber or dirty cream, not bright neon.

Accent text: muted red for stamps, warnings, and header separators. The red must be used sparingly to avoid readability issues.

Optional effect: subtle scanlines and mild vignette are allowed if they do not reduce contrast below readable levels. Any blur effect must be optional and disabled by default.

Typography remains monospace. Font size continues to scale similarly to the existing implementation, and the existing *fontsize command continues to work.

D06 Stamps and overlays

When the OFFICER produces certain classes of responses (see E00), the UI may render an additional stamp line immediately after the OFFICER line, using accent red text, bracketed to remain ASCII-friendly. Example: "[STAMP: VERIFIED]" or "[STAMP: INSUFFICIENT DATA]".

Stamp insertion is deterministic based on response category, not random.

E00 Conversation behavior changes

E01 Persona constraints

The OFFICER persona must be interrogative, procedural, suspicious, and bureaucratic. It must not threaten violence, imply real-world surveillance, or instruct wrongdoing. It may pressure the subject through repetition and demands for clarification, but must remain within a fictional, game-like tone.

E02 Opening greeting

On page load or reset, the first message printed into the transcript is an OFFICER greeting, not a paragraph of historical credits. It must be short and directive. Example: "OFFICER: STATE YOUR NAME AND PURPOSE."

Credits remain accessible and must be printed by *help and also shown in the Case Header via a short "BASED ON" line only if it fits without clutter. If a "BASED ON" line is included, it must not exceed one line.

E03 Fallback messages and the "limit" counter

The engine currently uses a rotating "no match" message list keyed by the internal limit counter. Replace those messages with interrogation-appropriate prompts. The list has exactly four entries. The messages must be short. Example set:

1. "ANSWER THE QUESTION."

2. "PROVIDE DETAILS."

3. "DO NOT EVADE."

4. "REPEAT THAT, CLEARLY."

The limit behavior remains unchanged: it increments per user input and selects one of the four built-in fallback messages when needed.

E04 NONE rule behavior

The NONE rule continues to provide context-free responses when no keyword transformation applies. Replace its messages with interrogation-appropriate equivalents that request specificity and documentation. Examples:

"I DO NOT ACCEPT VAGUE STATEMENTS."

"CLARIFY YOUR CLAIM."

"STATE FACTS, NOT FEELINGS."

"PROCEED."

E05 Memory behavior

The existing memory queue is retained. It is re-framed as "Prior Statements on File".

When the engine chooses to respond from memory (limit equals 4 and memory exists, per current behavior), the OFFICER response must be preceded by a fixed prefix inserted by the UI or script: "ON FILE: " followed by the recalled memory text. This makes the behavior observable and legible to the user.

If adding the prefix is done in UI rather than script, it must only apply to the memory-response path, not to normal responses.

F00 Script content requirements

F01 Script format and engine compatibility

ChatKGB must continue using the existing script parser and rule execution engine as implemented in `eliza.html`. The script syntax, tokenization, matching, and reassembly mechanics must not change.

The default embedded script string currently representing the 1966 DOCTOR script must be replaced with a new script string that uses the same syntax and satisfies the same validation requirements (must include a NONE rule and a MEMORY rule whose keyword is also a keyword rule).

The script must remain ASCII-safe except for the UI prompt glyph "☭". The script itself should remain plain ASCII to reduce parsing surprises.

F02 Keyword set and transformation goals

The new script should prioritize interrogation patterns over therapy patterns. The implementer must introduce, at minimum, rules that cover these input classes:

Identity and intent statements: "MY NAME IS X", "I AM X", "I WORK AT X", "I LIVE IN X", "I WANT X". Responses should ask for documentation, clarify intent, and request specifics.

Evasion and uncertainty: "MAYBE", "PERHAPS", "I GUESS", "NOT SURE". Responses should demand certainty and ask for concrete facts.

Accusations and conflict: "YOU", "THEY", "EVERYONE", "NOBODY". Responses should ask "WHO" and "NAME NAMES" in a procedural way.

Time and sequence: "YESTERDAY", "BEFORE", "AFTER", "ALWAYS", "NEVER". Responses should ask for dates and specific incidents.

Compliance and refusal: "NO", "YES", "I WILL NOT", "I CANNOT". Responses should challenge refusal without threats.

The script may reuse a subset of ELIZA-style reflective techniques (mirroring pronouns, asking "WHY") but must phrase them as interrogation protocol, not psychotherapy.

F03 Required greeting and help narrative content

The greeting message in the script must be replaced with a short OFFICER directive. The long historical banner currently displayed at startup must be removed from startup output and moved into *help output.

The help output must include:

A statement that ChatKGB is a fictional console experience inspired by "Papers, Please".

A clear credit that it is based on Anthony Hay's ELIZA implementation, and that the original ELIZA concept is by Joseph Weizenbaum, with a note that the original DOCTOR script is from 1966 CACM. This is attribution text, not a historical essay.

A summary of local-only behavior: "NOTHING IS SENT ANYWHERE" as in the current help, but rewritten in ChatKGB tone while remaining clear.

G00 Commands and operator controls

G01 Command prefix and parsing

Commands remain lines whose first non-space character is "*". Command matching is case-insensitive. Unknown commands print a single-line error in the log and do not modify engine state.

G02 Command set

The existing command set may be retained for compatibility, but user-visible text and intent must be reworded to match ChatKGB.

At minimum, these commands must exist and behave deterministically:

*help prints the command list and the credit/disclaimer block described in F03.

*clear clears the log and resets transcript state but does not reset the case header subject name unless *reset is invoked.

*reset resets the engine state, including the rule reassembly indices, memory queue, limit counter, exchange number, and any replay modes. It also prints the greeting.

*save saves the conversation transcript to a text file. The saved transcript must include both SUBJECT and OFFICER lines as displayed (uppercase), and must include the case id and subject name at the top.

*savetrace if trace is supported, saves the trace log. If trace is not supported after refactor, this command must print "TRACE NOT AVAILABLE" and do nothing else.

*load loads a script file, as currently, and on success prints a confirmation line and prints the new greeting from the loaded script.

*maxtran sets the transformation limit exactly as currently. The Case Header must update to reflect the new value.

*fontsize N continues to work.

Theme commands like *amber, *green, *white, *black may be retained, but the default theme on load must be the Soviet-era ChatKGB theme. If retained, these commands must update the theme immediately and update the Case Header MODE line to include the theme name.

New command: *subject NAME sets the subject name shown in the Case Header. NAME is stored as uppercase display text. If NAME is missing, print a usage line and do not change state.

H00 Validation rules, error handling, and boundary conditions

H01 Unicode prompt rendering

The prompt glyph "☭" must render in the header and input prompt. If the selected font cannot render it, the system must fall back to displaying "[PROMPT]" in the UI and log a one-line warning at startup: "WARNING: PROMPT GLYPH NOT SUPPORTED."

H02 Script load errors

Script load failures must be printed as a single line that begins with "SCRIPT ERROR:" followed by the existing error message. The engine must remain on the last successfully loaded script and continue functioning.

H03 Large inputs

If the user enters more than 2000 characters in one input submission, the UI must accept it but the system must truncate the displayed SUBJECT line to 2000 characters and append " [TRUNCATED]". The raw input saved to file may be full or truncated, but the behavior must be consistent and explicitly stated in *help. The recommended rule is: save the same truncated text that was displayed, to avoid mismatch.

H04 Interrupt behavior

If an interrupt key exists (Escape) to interrupt response creation, it remains supported. The OFFICER interruption message must be reworded to match ChatKGB tone. Example: "-- RESPONSE INTERRUPTED BY OPERATOR --"

I00 User workflows

I01 Basic interrogation session

Step 1: User loads the page. The Case Header shows CHATKGB and a new case id. The log shows the OFFICER greeting.

Step 2: User types a statement and presses Enter. The log records a SUBJECT line with exchange number 0001 and the uppercase form of the typed input.

Step 3: The OFFICER response is appended as exchange 0001. If it is a memory-derived response, it is prefixed with "ON FILE:".

Step 4: The input field clears and focus remains in the input field.

Step 5: User repeats until satisfied, then runs *save to download the transcript.

I02 Setting a subject name

Step 1: User types "*subject Alexei" and presses Enter.

Step 2: The log records the command as SUBJECT exchange text.

Step 3: The system appends an OFFICER confirmation line: "SUBJECT SET: ALEXEI" and updates the Case Header "SUBJECT:" line.

I03 Loading a custom script

Step 1: User types "*load" and selects a UTF-8 text file.

Step 2: On success, the OFFICER prints "SCRIPT LOADED: [FILENAME]" followed by the new greeting from the loaded script.

Step 3: On failure, the OFFICER prints "SCRIPT ERROR: ..." and continues using the prior script.

J00 Specification by example

J01 Prompt and transcript formatting examples

If the user types: "My name is Ivan."

The transcript shows:

"0001 SUBJECT: MY NAME IS IVAN."
"0001 OFFICER: PRESENT DOCUMENTS FOR IVAN."

If the user types: "Maybe."

The transcript shows:

"0002 SUBJECT: MAYBE."
"0002 OFFICER: DO NOT EVADE. STATE FACTS."

If the engine selects a memory response and the recalled memory is "EARLIER YOU SAID YOUR DOCUMENTS WERE LOST", then the OFFICER line must be:

"00NN OFFICER: ON FILE: EARLIER YOU SAID YOUR DOCUMENTS WERE LOST"

J02 Command error example

If the user types: "*subject" with no argument, OFFICER response must be exactly one line:

"USAGE: *SUBJECT NAME"

K00 Credits, licensing, and required notices

ChatKGB must retain attribution and licensing as follows:

The MIT License text from `LICENSE` must remain available in the repository unchanged.

The ChatKGB UI must include a credit line accessible via *help that states it is based on Anthony Hay's ELIZA implementation (anthay) and that the project is derived from the original ELIZA concept by Joseph Weizenbaum. The wording must be factual and non-promotional.

If the UI displays any startup banner beyond the greeting, it must be limited to one short line that includes the base attribution, but it must not replace *help as the primary location for full credit text.

The refactor must not remove or obscure existing copyright notices in source files.

If you want this broken into a companion UX-only spec and a separate exhaustive validation checklist for an implementer, say so and I will produce them as additional sections with stable codes.
