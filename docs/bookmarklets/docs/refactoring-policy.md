# Refactoring Policy

## Purpose

Define when to extract shared code in a repository of mostly independent bookmarklets.

## Default Rule

Start local. Duplication is acceptable when it keeps behavior obvious.

## Extraction Threshold

Extract to `src/shared/` only when:

1. At least two real call sites need the same behavior.
2. The API can be named clearly by behavior.
3. Extraction makes both callers easier to read.
4. Site-specific assumptions do not leak into shared modules.

## Mandatory Review Before Extraction

Before extracting, check:

1. Existing shared helpers.
2. Similar logic in other bookmarklets.
3. Hidden differences across call sites.

If differences are significant, keep it local.

## Periodic Review Requirement

Run periodic reviews of existing and recently added bookmarklets to detect repeated logic that is ready for safe extraction. Example: repeated inline clamp logic across multiple bookmarklets should be promoted to a shared helper when the API is stable.

## Stop Conditions

Stop refactoring when:

1. Abstractions serve hypothetical future use.
2. Call sites become less obvious.
3. Shared APIs need flags for unrelated behavior.

## Agent Rule

When uncertain, do not extract yet.
