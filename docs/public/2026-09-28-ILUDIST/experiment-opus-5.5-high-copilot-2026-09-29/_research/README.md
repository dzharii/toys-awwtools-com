# ILUD — research and data

This folder holds the single body of knowledge that all ten ILUD applications
interpret. The applications differ completely in form; they do not differ in
what they claim to be true.

## What is here

| File | Purpose |
| --- | --- |
| `taxonomy.json` | Categories, approaches, confidence levels, effort levels, platforms, and the project's own descriptive text. |
| `fixes/*.json` | The catalogue itself, one file per category. **This is where you edit content.** |
| `intents.json` | Groups fixes under the five complaints people actually arrive with. Used by the branching and diagram designs. |
| `ilud-data.json` | Generated. The merged, validated, sorted dataset. |
| `../_tools/build-data.js` | Merges, validates, writes `ilud-data.json` and copies `data.js` into each app folder. |

Rebuild after any content change:

```
node _tools/build-data.js          # build + validate
node _tools/build-data.js --check  # validate only, write nothing
```

The build refuses to write anything if validation fails.

## Current contents

87 entries across 8 categories, compiled 2026-09-29.

Search 14 · Social 12 · Images 10 · Writing 10 · Shopping 7 ·
Browsing & devices 12 · Video & music 10 · Reading & everyday 12

## The shape of an entry

```jsonc
{
  "id": "google-plain-results",          // stable; other entries link to it
  "title": "Search without AI summaries", // the OUTCOME, never the mechanism
  "service": "Google Search",
  "category": "search",                   // one of taxonomy.categories
  "approach": "avoid",                    // turn-off | avoid | replace | human
  "summary": "…",                         // one sentence, plain language
  "changes": "…",                         // what will be different afterwards
  "effort": "instant",                    // instant | minute | setup
  "install": "none",                      // none | extension | app | account
  "platforms": ["iphone","android","desktop"],
  "confidence": "high",                   // high | medium | experimental
  "verified": "2026-09-29",
  "featured": true,                       // optional; surfaces on front pages
  "popularity": 5,                        // 1–5, ordering hint only
  "advanced": false,                      // optional; hide behind disclosure
  "cost": "paid",                         // optional
  "region": "UK and EU",                  // optional
  "audience": "creators",                 // optional
  "tags": ["one tap","no install"],
  "action": { "kind": "query|link|copy|steps", … },
  "how": "…",                             // why the mechanism works
  "steps": ["…"],                         // manual instructions
  "caveats": ["…"],                       // required unless confidence is high
  "alternatives": [{ "label": "…", "url": "…" }, { "label": "…", "ref": "id" }],
  "sources": [{ "title": "…", "url": "…", "checked": "2026-09-29" }]
}
```

### Action kinds

- **`query`** — the user types something and we open a service already in the
  useful mode. `url` must contain `{q}`. This is the most valuable kind and
  should be preferred wherever a destination can be constructed.
- **`link`** — open a page directly, usually the exact settings screen rather
  than the service's front door.
- **`copy`** — copy a string to the clipboard. Used for `chrome://`,
  `about:config`, `edge://` and `brave://` addresses. **A web page is not
  permitted to navigate to these**, and pretending otherwise would produce a
  button that silently does nothing. Saying so is a feature.
- **`steps`** — no link exists; show the path through a settings menu.

## Editorial rules

These are the rules the content was written against. Keep to them.

1. **Outcome first, mechanism second.** The title is what the person wants.
   The parameter, flag or operator lives in `how`, behind a disclosure.
2. **Say what will change.** Every entry has a `changes` field because people
   are right to be wary of instructions that alter their tools.
3. **Admit limits plainly.** Where there is no fix — Amazon's assistant in the
   mobile app, Reddit Answers, Instagram's search suggestion — the entry says
   so instead of offering something that does not work.
4. **No preaching.** ILUD does not argue that AI is good or bad. It helps
   somebody do a thing they have decided to do.
5. **Unconventional is fine; unverified is not.** An inelegant mechanism that
   works belongs in the catalogue. A rumour does not.

## The confidence scale

| Level | Meaning |
| --- | --- |
| `high` | An official setting, or a mechanism documented independently in several places and stable over months. |
| `medium` | Works for most people, but depends on account type, region, app version or a staged rollout. Menu paths in this class move. |
| `experimental` | Community-discovered behaviour that may stop without notice. Must carry caveats and is presented behind advanced disclosure in every application. |

There is exactly one `experimental` entry: `google-rude-token`, the negative
keyword that suppresses Google's AI Overview. It is included because it works
often enough to be genuinely useful, it is lawful and installs nothing, and
excluding effective methods for being inelegant would be a failure of nerve.
It is never the headline answer — `google-plain-results` is — and its entry
states the trade-offs.

## Research method

Conducted 2026-09-29.

1. **Scope from ordinary life, not from a list.** Categories were derived by
   working through a normal day — searching, messaging, reading, shopping,
   listening, working, navigating — rather than by starting from services we
   already knew had a fix.
2. **Current sources only.** Every claim was checked against 2026 material:
   vendor support pages first, then reporting, then community sources.
   Instructions written before 2026 were treated as leads, not facts.
3. **Outbound links tested.** Every URL shipped in an action or an alternative
   was requested and its status recorded. Several were corrected:
   Marginalia moved to `marginalia-search.com`; `search.marginalia.nu` now
   redirects. uBlacklist's home is `github.com/iorate/ublacklist`.
   `notoai.org` does not resolve and was removed.
   `cara.app` and Etsy return 403 to automated requests but are healthy in a
   browser; they were checked by hand.
4. **Folklore discarded.** Several widely repeated tricks failed on testing and
   are not here — notably `old.reddit.com` as an anonymous escape, which since
   July 2026 requires a signed-in account and is being retired; and the various
   "disable AI Overviews in Google settings" instructions, which describe a
   setting that has never existed.
5. **Provenance retained.** Every entry carries its sources and the date each
   was checked, so a future maintainer can tell why something was included.

## Maintenance

The web moves. A workaround reliable in September may fail by November.

- Re-check anything `medium` or `experimental` every three months.
- Re-check `high` entries every six months; vendor settings move too.
- When something breaks, remove it or downgrade its confidence. Leaving a dead
  workaround in place costs more trust than the entry ever earned.
- Update `verified` when you check, not when you edit prose.

## Licence and independence

ILUD is not affiliated with, endorsed by, or connected to any service described
here. Trademarks belong to their owners. Nothing in the catalogue asks a reader
to break a law, breach a paywall, or install software we have not named and
linked.
