# Bug 003 — `DialogContent` Missing `DialogTitle`

## Status

**Not Applicable** — No Dialog components exist in the codebase.

## Analysis

A full search of `src/` confirms zero occurrences of `DialogContent`, `Dialog`, or any Base UI / Radix UI Dialog integration. The only `Dialog` reference is `Command.Dialog` from `cmdk`, which is a command palette component and does not use Base UI's Dialog API.

## Recommendation

Leave this bug file as documentation for future development. If a Dialog is added later, ensure every `DialogContent` is wrapped with a `DialogTitle` (and optionally `DialogDescription`) as described in this document.
