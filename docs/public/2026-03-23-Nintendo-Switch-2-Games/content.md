# Nintendo Switch Skill Board content note

This project no longer uses the old Seattle reference inventory.

Current editorial sources:

- `catalog-data.mjs`: canonical site copy, category metadata, evidence labels, and game notes
- `deep-research-report.md`: research source behind the editorial shortlist and evidence framing
- `catalog-generated.json`: derived catalog with resolved product pages and local image metadata

Build flow:

1. Edit `catalog-data.mjs`.
2. Run `node ./scripts/fetch-catalog-assets.mjs`.
3. Run `node ./scripts/build-site.mjs`.

See `implementation-notes.md` for image handling, attribution rules, and maintenance guidance.
