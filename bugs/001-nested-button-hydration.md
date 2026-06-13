# Bug 001 — Nested `<button>` Causes Hydration Error

## Symptom

Console error: `In HTML, <button> cannot be a descendant of <button>. This will cause a hydration error.`

Repeated on every Fast Refresh rebuild.

## Root Cause

A `Button` component is being rendered inside a `DropdownMenuTrigger` that uses `asChild`. The `DropdownMenuTrigger` renders a `<button>` DOM element, and the `Button` component also renders a `<button>` DOM element — resulting in a nested `<button>` inside `<button>`, which is invalid HTML and causes Next.js client/server hydration mismatch.

## Component Chain (from stack trace)

```
DropdownMenu (base-ui)
  └─ DropdownMenuTrigger (asChild=true)
       └─ <button>          ← rendered by DropdownMenuTrigger
            └─ Button (shadcn/ui or similar)
                 └─ <button>  ← rendered by Button component
```

## Fix

Ensure the `Button` component renders as a plain `<button>` and pass it to `DropdownMenuTrigger` via `asChild`, so only one `<button>` exists in the DOM.

**Option A** — Use `asChild` on `DropdownMenuTrigger` and pass the `Button` as a child (not a nested button):

```tsx
<DropdownMenuTrigger asChild>
  <Button variant="outline" size="sm">Open</Button>
</DropdownMenuTrigger>
```

And in `Button.tsx`, ensure it does NOT wrap its output in another `<button>` when `asChild` is true:

```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp ref={ref} {...props} />;
  }
);
```

**Option B** — Remove `asChild` from `DropdownMenuTrigger` and let `Button` handle the `<button>` rendering (but this loses dropdown menu keyboard/ARIA behavior).

## Priority

High — breaks SSR hydration, causes runtime warnings, and may cause unexpected behavior with dropdown interactions.

## Resolution

**Fixed** — Replaced nested `<Button>` inside `<DropdownMenuTrigger>` with base-ui's `render` prop pattern.

### Files Changed

| File | Change |
|------|--------|
| `src/app/columns.tsx` | Lines 153–171: `DropdownMenuTrigger` now uses `render` prop to pass trigger props (including `ref`) to `Button`, eliminating the nested `<button>` |
| `src/app/data-table.tsx` | Lines 91–96: Same `render` pattern applied to the "View" dropdown trigger |

### How the Fix Works

Base UI's `DropdownMenuTrigger` supports a `render` prop that accepts a function receiving trigger props (`ref`, `getButtonProps`, etc.). By passing these through to the `Button` component, the trigger's `<button>` element is replaced with the `Button`'s `<button>` element — only one `<button>` exists in the DOM, and the dropdown menu's keyboard/ARIA behavior is preserved.
