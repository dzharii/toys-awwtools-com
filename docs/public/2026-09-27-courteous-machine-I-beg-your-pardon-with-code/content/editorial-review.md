ED00 - Scope and preservation

The review covers 535 extracted entries: 179 from extract-a-m.json, 117 from extract-n-z.json, 189 from extract-other.json, and 50 newly authored additions. All available arrays were read. The supplied conversation begins mid-example and explicitly omits earlier content, so this is comprehensive for the visible material, not a claim to reconstruct the missing conversation. Exact duplicates can share a catalogue card while retaining every source reference. Source prose and original phrasing remain intact in the raw files. Grammar, vocabulary mappings, and editorial instructions should remain distinguishable from ready-to-copy messages.

The review assigns 243 entries to ready, 278 to context, and 14 to avoid. Ready means suitable language when its stated facts are true, not permission to claim unobserved facts. Context means a useful phrase with a condition or a deliberate stylistic register. Avoid retains a counterexample for comparison rather than silently discarding it. The exaggerated forgiveness phrases remain available as theatrical material; the review does not reject them merely because the earlier draft called them excessive.

EE00 - State only what observation supports

The most consequential correction is entry o005. ECONNREFUSED establishes that a connection attempt was refused. It does not establish that the intended database host was reached and personally declined it; a rejecting intermediary or the absence of a listening service can also explain the result. The revised message identifies the attempted address and scopes the non-submission claim to that connection. Entry o184 receives the same scope correction. A prior retry or parallel connection could already have submitted work.

Assurances such as no harm done, nothing changed, no charge made, and rollback completed require affirmative evidence. The absence of a success record does not supply that evidence. A database rollback is not necessarily a rollback of external messages or remote writes. Prefer a narrow statement about the resource and operation actually checked. In entry n033, the original says a matter has concluded while also describing an unobservable outcome. Its revision leaves completion uncertain.

EF00 - Make retry conditional on the prior attempt

Entry o186 receives a revised next step: verify the operation status before trying again and use the reference if that status remains uncertain. An internal error can occur after an external side effect. Blindly repeating the request can duplicate a payment, deployment, message, or write.

The automatic recovery example o039 also needs context: success on the second attempt does not exclude success on the timed-out first attempt. No action is required only when duplicate effects have been excluded or managed. New retry, offline, and partial-completion examples follow the same rule. Retrying only remaining items requires reliable per-item state, not merely a general error count.

EG00 - Preserve the difference between a request and its result

Cancellation requested, cancellation accepted, process exit confirmed, and detached children stopped are different facts. Retirement language can provide character, but the concrete status must follow. The retained blanket assurance that everything has safely stopped belongs among counterexamples.

Apply the same distinction to success: prepared, queued, sent, accepted, committed, and completed should not be interchangeable. A partly successful import should identify the usable rows and remaining work. An empty result is successful only after retrieval completed; it must not conceal an access failure, an unfinished search, or an unavailable service.

EH00 - Keep theatricality optional and proportionate

The catalogue benefits from formal, ceremonial, and deliberately exaggerated registers. They are alternatives for a product voice, not a ladder that makes more severe incidents more comic. An unhandled exception may deserve plainer language than routine validation because its impact is greater. Understatement must not diminish the practical seriousness of data loss, money, or security.

Personification works when the reader immediately receives the exact technical fact. Metaphor first is an optional arrangement, not an absolute rule; a consequential result may need to lead. Compliments such as otherwise impeccable require enough validation to justify them. Courtesy can acknowledge a reasonable intention without claiming the entire request was checked.

EI00 - Tie remedies and promises to implemented behavior

The new coverage usefully adds progress, queues, recovery, offline work, throttling, partial completion, accessibility, undo, expired sessions, conflicts, maintenance, consent, and uncertain payment or cancellation states. These additions depend on real product behavior. Saying a user can leave and return requires durable work. Promising that a draft is held locally requires actual storage. Promising automatic resubmission must match both the implementation and the user's expectation.

Undo requires a real reversal mechanism and a truthful deadline. Maintenance times need a timezone. Keyboard guidance must match the actual control: Enter is not a universal activation key. An accessible text alternative must contain the figures claimed. A remedy should say exactly what to do; when convenient should be reserved for genuinely nonurgent actions.

EJ00 - Preserve technical detail without leaking or overclaiming

Keep exact expected and received values when they explain a mismatch, but redact secrets and unnecessary personal information. Masked email addresses, card suffixes, internal hostnames, and filesystem paths may still be sensitive in public output. Authentication messages should not claim credentials are proper unless that fact is known or expose which secret component failed.

A reference should identify a stable diagnostic category or the specific event. Concrete sample values remain illustrative. Preserve a source's exact technical term in raw content even when a curated card explains it more clearly. Short facts such as Connection refused are legitimate technical detail; their limitation is that they are incomplete as a whole user-facing diagnostic, not that direct engineering language is impolite.

EK00 - Compose selectively and retain provenance

Use the courtesy, fact, context, state, action, and reference grammar as a menu. Do not require every layer in every message. Choose one opening, retain the shortest sufficient technical explanation, add a scoped assurance or an uncertainty statement as appropriate, and finish with a concrete action when one exists. Never generate a verified-state assurance from a style selector alone.

The constructor should allow users to choose a register independently of outcome certainty and severity. Mark literal fragments, complete examples, guidance, and counterexamples distinctly. Keep original text beside any technically necessary revision. Only four entries receive editedText in this review: n033, o005, o184, and o186. Everything else is preserved with an editorial condition so the reference remains an inspiration library rather than a falsely universal script.
