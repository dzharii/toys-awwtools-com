# Markdown Edge Cases

This file intentionally contains hostile and messy content. The reader must
never execute scripts, load remote images, or render raw HTML as trusted markup.

## Raw HTML that must not execute

<script>window.__xssExecuted = true; alert("xss");</script>

<div onclick="window.__xssExecuted = true">A div with an inline handler.</div>

<img src="https://example.com/tracker.gif" onerror="window.__xssExecuted = true">

<iframe src="https://example.com/"></iframe>

<style>body { background: red !important; }</style>

## A link with a javascript URL

[do not run me](javascript:window.__xssExecuted=true)

## Malformed and unusual Markdown

*unterminated emphasis and `unterminated code

####### too many hashes to be a heading

A table if supported:

| Feature | State |
| ------- | ----- |
| Scripts | blocked |
| Images  | placeholder |

## Nested formatting

> A quote containing **bold**, *italic*, and `code`, plus a nested list:
>
> - one
> - two

Trailing whitespace and	tabs	should	not	break	the	layout.
