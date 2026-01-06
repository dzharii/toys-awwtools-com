A00 Context and intent (rev 00)
ChatKGB is a themed refactor of a deterministic ELIZA engine and script system. The experience is deliberately retro: a text console that runs locally in the browser, with an interrogation-style script that replaces the original DOCTOR therapist persona. The core engine is not a modern LLM. It is a keyword and pattern matching system with deterministic rule application, optional tracing, and a user-controlled transformation limit (*MAXTRAN).

This document specifies a conservative reliability enhancement to prevent "infinite loop" behavior without changing the normal feel of the engine. The emphasis is on safeguards that only activate in pathological cases (cyclic keyword linking, runaway transformation chains, or immediate repeated replies). In ordinary conversations, output should remain unchanged except where the script itself is improved to reduce repetitive attractor responses. The engine remains deterministic, commands remain stable, and tracing remains truthful.

B00 What the user is seeing and why it happens (rev 00)
There are two distinct phenomena that users describe as "infinite loops":

First, true transformation loops can occur inside a single response computation if keyword linking creates a cycle. In this engine, a rule can return ACTION_LINKKEY, which pushes another keyword onto the front of the keyword stack. A poorly authored script (or an accidental equivalence-class loop) can create a chain like A links to B, B links back to A, and the engine keeps attempting transformations until the transformation limit is reached. If the user sets *MAXTRAN 0 (unlimited), a real infinite loop is possible.

Second, perceived loops occur across turns when the script repeatedly selects a broad, high-precedence catch-all decomposition that yields a single short response. In the screenshot example, repeated lines like "STATE FACTS." are not a single-turn engine loop. They are the script winning too often with too little variation, so the conversation appears stuck even though each turn terminates.

This spec addresses both, but it treats them differently: engine-level safety for true loops, and script-level tuning plus an optional tiny dedup guard for perceived loops.

C00 Non-goals and constraints (rev 00)
Do not change the deterministic nature of the engine. No randomness.
Do not change the script grammar, parser rules, or file format.
Do not change the existing command surface, including tracing modes and *MAXTRAN semantics.
Do not introduce new UI flows or blocking dialogs. The engine must remain responsive and keyboard-driven.
Do not alter normal responses unless a safeguard triggers or a script author explicitly adds more reassembly variants.

D00 Success criteria (rev 00)
A single response computation must always terminate, even if *MAXTRAN is set to 0, and even if the loaded script contains a link cycle.
The safeguards must not change output for well-formed scripts during normal conversations.
If the script would repeat the exact same officer reply as the immediately previous turn, the engine should have a deterministic way to avoid returning the identical line when a reasonable alternative exists.
After script tuning, common user inputs should not funnel into a single one-line response across many turns. Variety must remain deterministic and thematically consistent.

E00 High-confidence approach that preserves the existing experience (rev 00)
The safest way to enhance reliability without changing normal behavior is to implement guards that are effectively inert unless a pathology occurs:

E01 Single-response termination guarantee
Add a link-cycle guard and a hard safety cap that only matters when *MAXTRAN is 0. For normal scripts, the guard never fires and the cap is never reached.

E02 Minimal repetition mitigation
Add an optional "immediate duplicate reply" guard that only activates when the engine is about to return the exact same text as the last officer reply. When it activates, it should first attempt a deterministic alternative within the same matched transform (next reassembly rule). Only if no alternative exists should it fall back to a neutral NONE response.

E03 Script tuning that does not disturb precedence too aggressively
Instead of raising many new keyword precedences (which can change the feel), keep the existing precedence hierarchy mostly intact and introduce controlled "escape hatches" (NEWKEY) plus richer reassembly sets for broad matches. This approach keeps the same primary keyword selection most of the time, but avoids getting trapped in a single catch-all response.

F00 Engine change 1: Link-cycle guard that does not break legitimate keyword repetition (rev 00)
F01 Why a naive visited-keyword set is risky
The keyword stack can legitimately contain the same keyword more than once, especially if the user repeats a word in a single clause or if multiple occurrences are pushed by the scanning loop. A naive "visited keyword" set that blocks a second attempt would change behavior for valid inputs and would therefore break the existing experience.

F02 The correct target: detect cycles introduced by ACTION_LINKKEY chains
The true loop risk comes from ACTION_LINKKEY pushing link keywords repeatedly. That is the narrow case to guard.

F03 Data to add (local to one response computation)
Maintain a set that tracks keywords introduced via linking during this response, for example linkSeen. Also maintain a counter of how many consecutive link steps have occurred, linkDepth. This does not interfere with normal keystack processing of keywords discovered in the user input.

F04 Guard behavior (deterministic and minimally invasive)
When a rule returns ACTION_LINKKEY with some keyword L:
If L is already in linkSeen, treat this as a link-cycle and terminate the keyword-processing loop immediately.
If linkDepth exceeds a conservative threshold (example: 100 link steps in one response), treat as runaway linking and terminate.
In both cases, do not throw, do not change UI state, and do not return an immersion-breaking message. Instead, fall through to the standard NONE response path. In trace output, add a single clear line indicating that a link-cycle or runaway link chain was detected.

This preserves normal behavior because linkSeen only populates when the script actively requests linking. Keyword repetition that originates from user input scanning is unaffected.

F05 Trace requirements
When the guard triggers, include a trace line such as:
" | SAFETY: link-cycle detected at keyword X, falling back to NONE"
or
" | SAFETY: excessive link depth, falling back to NONE"
This should appear only when the guard triggers, so it remains quiet for normal sessions.

G00 Engine change 2: Internal hard cap for *MAXTRAN 0 that does not change *MAXTRAN semantics (rev 00)
G01 Why this is needed
Today, *MAXTRAN 0 means unlimited transformations. That is useful for debugging but unsafe in a browser if a script has a linking cycle or a pathological chain. Even with the link-cycle guard, other forms of runaway behavior are possible in theory. A hard cap is the last-resort seatbelt.

G02 Preserve semantics by making the cap internal, high, and silent in normal output
Implement an internalHardCap used only when transformationLimit is 0. Set it high enough that no sane script will approach it (example: 10000 transformations in a single response). If it is reached, do not return a special user-facing message; return the NONE fallback response and record the event in trace.

This preserves the user-visible meaning of *MAXTRAN while ensuring the page cannot hang indefinitely.

H00 Engine change 3: Immediate duplicate reply guard that only activates on exact repetition (rev 00)
H01 Why this is safe
Avoiding immediate duplicates is a quality improvement that does not change meaning in normal cases. It triggers only when the engine is about to repeat the exact same reply as last turn. Most conversations will never hit this. When it does hit, the user is already experiencing a "loop" feeling.

H02 Minimal state to store
Store lastOfficerReply on the Eliza instance. This is not the transcript, just the most recent returned reply string.

H03 Deterministic alternative selection without randomness
When a candidate reply is computed (including memory replies and NONE replies), compare it with lastOfficerReply. If they differ, return as usual and update lastOfficerReply.

If they are identical, attempt this deterministic mitigation in order:

First attempt: reassembly advance within the same matched transform
This is the least disruptive alternative because it keeps the same keyword and same decomposition match, it only selects the next reassembly rule (the engine already rotates reassemblies deterministically). To do this cleanly, the coding agent should adjust RuleKeyword.applyTransformation so it can try up to N reassembly rules for the matched transform until it finds one that differs from the avoidReply string. This must remain deterministic: it should try reassemblies in the existing rotation order, no shuffling.

Second attempt: force NEWKEY behavior for this keyword
If all reassemblies for the matched transform produce the same reply (or the transform only has one reassembly), return ACTION_NEWKEY to allow the next keyword in the stack to respond. This retains the existing keyword stack semantics and keeps behavior explainable in trace.

Third attempt: fall back to NONE
If the keyword stack is empty or all remaining options also result in the same reply, produce the standard NONE response.

H04 Trace requirements
When dedup triggers, add one trace line, not a flood:
" | DEDUP: repeated last reply, advanced reassembly"
or
" | DEDUP: repeated last reply, NEWKEY"
or
" | DEDUP: repeated last reply, NONE fallback"
Only log when the dedup mechanism actually changes behavior.

I00 Script improvements that reduce perceived loops while preserving tone and precedence (rev 00)
I01 Identify the main attractor in the provided ChatKGB script
In the shared script, the most powerful attractor is the broad catch-all in keyword I:
(I 70 ... ((0 I 0) (STATE FACTS.)))
Any input containing I will usually push I onto the keystack with high precedence, and the catch-all decomposition matches almost everything. If the more specific decompositions do not match, the engine returns the one-line response. This is why the user can get many consecutive "STATE FACTS." prompts.

I02 Improve the I catch-all without changing primary keyword selection
Do not lower I precedence, because that would change the feel across the entire script. Instead, expand the reassembly set for the (0 I 0) catch-all so it has multiple thematically consistent variants and at least one NEWKEY escape.

This preserves the current experience in the sense that I is still the primary interrogator driver, but it no longer collapses to one identical sentence.

I03 Add controlled fall-through rather than raising new precedences
Avoid introducing a large set of new keywords with precedence higher than I. That would rewire the selection behavior and may surprise existing users of the script. Instead, introduce additional keywords at lower precedence (example: 40 to 60) that can answer when I yields NEWKEY or when I does not match a more specific pattern.

This yields a stable hierarchy: I still tends to lead, but the session has deterministic ways to branch to BUY, AMAZON, SLEEP, PRODUCTIVE, etc.

I04 Add more specific decompositions inside existing high-precedence keywords
Rather than adding a dozen new keywords, add a few high-value decompositions to existing keywords (I, WANT, WORK, LIVE) that explicitly match common phrases and objects, such as:
"I WANT TO BUY X", "BUY X", "AMAZON", "SLEEP", "COMFORT", "PRODUCTIVE"
This keeps the keyword set compact and reduces risk of unintended interactions.

I05 Ensure every broad rule has an escape hatch
For any decomposition pattern that is intentionally broad (0 something 0), ensure its reassembly list includes at least one NEWKEY entry. This does not change deterministic behavior; it adds a deterministic path to avoid stagnation.

I06 Keep memory behavior unchanged unless there is a strong reason
Changing the MEMORY keyword can meaningfully change the experience and may introduce new repetition or unexpected recall. For a conservative enhancement, keep MEMORY as it is. Script improvements plus dedup should already reduce the perceived loops. If later you want more memory usage, treat that as a separate, explicitly opted-in change with dedicated tests.

J00 Concrete before/after examples to validate behavior (rev 00)
J01 Link-cycle safety example (engine-level)
Construct a tiny test script where:
Keyword A links to B, keyword B links to A, and both are reachable from the input.
With the guard, a single response computation must terminate quickly and return a normal NONE response (or another non-breaking fallback), with trace indicating link-cycle detection. This must work even when *MAXTRAN is 0.

J02 Screenshot scenario example (script-level)
User inputs:
"I WANT TO BUY PILLOW ON AMAZON"
"TO MAKE MY SLEEP MORE COMFORTABLE"
"I WILL BE MORE PRODUCTIVE"
Expected after script tuning:
The officer replies should remain in the same interrogation tone, but should not be identical across turns. At least one of the turns should produce a more specific line tied to BUY/AMAZON/SLEEP/PRODUCTIVE, or a different demand for specificity, rather than repeatedly "STATE FACTS."

J03 Immediate-duplicate guard example (engine-level)
If the script still returns the same exact reply twice in a row for some repeated user input, the second turn should deterministically choose the next reassembly variant if available, otherwise fall through via NEWKEY or NONE. Trace should record a single dedup note.

K00 Implementation notes to avoid regressions (rev 00)
All safeguards must be scoped so they do not interfere with normal keystack processing. The link-cycle guard must track only link-introduced keywords, not every keyword encountered, to avoid breaking legitimate repeated keyword attempts within a single input.

The internal hard cap must apply only when transformationLimit is 0, must be high, and must be silent in normal output. It should not change visible behavior unless the script is pathological.

The dedup guard must trigger only on exact equality with the immediate last reply. Do not attempt fuzzy matching, do not normalize beyond what the engine already does, and do not prevent repeated replies separated by other replies. This keeps behavior predictable and avoids unintended censorship of valid repetition.

Script changes should be additive and conservative: expand reassembly lists, add NEWKEY escape hatches to broad matches, and add a small number of specific decompositions or secondary keywords at lower precedence rather than reshaping the entire precedence landscape. This preserves the existing "I dominates" interrogation cadence while eliminating the most obvious stagnation patterns.

Tracing must remain honest and minimal: only add trace lines when a safeguard actually triggers, and keep them as single-line annotations so the trace remains usable.
