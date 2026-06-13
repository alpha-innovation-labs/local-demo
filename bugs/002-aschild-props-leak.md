# Bug 002 — `asChild` Prop Leaks to DOM Element

## Status

**Not Applicable** — No `asChild` usage exists in the codebase.

## Analysis

A full search of `src/` confirms zero occurrences of the `asChild` prop. The project uses Base UI components directly without a custom `asChild` wrapper pattern, so this bug cannot manifest.

## Recommendation

Leave this bug file as documentation for future development. If a custom `Button` with `asChild` support is added later, refer to the fix described in this document (destructure `asChild` before spreading props, use `Slot` from `@base-ui/react/button` when `asChild` is true).
