# Demo — Next.js 15 / Tailwind CSS v4 Starter

A minimal Next.js application scaffolded with `create-next-app`, configured with TypeScript and Tailwind CSS v4, managed via PM2 and `just`.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, TypeScript) |
| UI | React 19, Tailwind CSS v4 (via `@tailwindcss/postcss`) |
| Cmd Palette | [cmdk](https://github.com/dip/cmdk) v1.1.1 |
| Fonts | Geist Sans + Geist Mono |
| Process Mgmt | PM2 (named `demo` process) |
| CLI | `just` (modular recipe files) |

## Project Structure

```
demo/
├── src/app/
│   ├── layout.tsx          # Root layout (Geist fonts, dark mode)
│   ├── page.tsx            # Landing page (default template)
│   ├── globals.css         # Global styles (Tailwind imports)
│   └── favicon.ico
├── ecosystem.json          # PM2 config (starts `pnpm run dev`)
├── justfile                # Main justfile (imports recipes)
├── justfiles/
│   └── development/
│       └── web.just        # dev, stop, delete recipes
├── next.config.ts          # Empty (no custom config yet)
├── postcss.config.mjs      # Tailwind v4 PostCSS plugin
├── eslint.config.mjs       # ESLint for Next.js
└── tsconfig.json
```

## Quick Commands

```bash
just dev        # Start dev server via PM2
pm2 status      # Check server status
pm2 logs demo   # View logs
just stop       # Stop the PM2 process
just delete     # Remove the PM2 process
```

## Notes

- Tailwind CSS v4 requires no `tailwind.config.js` — configuration is done inline via CSS.
- The server runs on `http://localhost:3000`.
- Press **⌘K** (or **Ctrl+K** on Windows/Linux) to open the command menu.
- The landing page displays live session data from `/api/sessions?full=true` (replaces stub user table).
- The command menu shows live session data from the DataTable — both share the same data source.

## Sessions API

**`GET /api/sessions`** — Query `agent-sight` CLI for conversation history across all 4 sources (opencode, claude, pi, nexus) and return session titles.

### Files Added

| File | Purpose |
|------|--------|
| `src/lib/agentSight.ts` | CLI wrapper: builds commands, strips ANSI control chars, parses both `--full` and non-full output formats |
| `src/app/api/sessions/route.ts` | Next.js App Router GET handler exposing the endpoint |

### Usage

```bash
# All sources, last 24h, non-full (string message arrays)
curl 'http://localhost:3000/api/sessions'

# Single source, 7d, full (structured conversation objects)
curl 'http://localhost:3000/api/sessions?since=7d&source=nexus&full=true'

# Invalid source returns 400 with error message
curl 'http://localhost:3000/api/sessions?source=invalid'
```

### Query Params

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `since` | string | `"24h"` | Time window (e.g. `"24h"`, `"7d"`, `"30m"`) |
| `source` | string | all 4 | One of: `opencode`, `claude`, `pi`, `nexus` |
| `full` | string | `"false"` | `"true"` returns expanded conversation objects with `sessionId`, `title`, `createdAt`, `updatedAt`, `directory`, `messages`, `userMessageCount` |

### Response Shape

```json
{ "sessions": [{ "id", "source", "title", "directory?", "createdAt?", "updatedAt?", "userMessageCount?", "messages", "timestamp" }] }
```

### Key Implementation Details

- `maxBuffer: 50MB` on `execSync` to handle large outputs (e.g. 116 nexus sessions)
- ANSI escape codes (`\x1b[...m`) stripped before `JSON.parse` to prevent parse errors
- Handles both CLI formats: `--full` returns `{ conversations: [...] }`; non-full returns `{ sessionId: [msgs] }`
- Sources queried in parallel via `.map()` (no explicit `Promise.all` needed — synchronous CLI calls)
- Results flattened and sorted by `updatedAt` descending

## Session Table (live data)

The landing page DataTable now fetches live session data from `/api/sessions?full=true` on mount (client-side `useEffect`), replacing the previous stub-user table.

### Files Modified

| File | Change |
|------|--------|
| `src/app/page.tsx` | Removed `stubUsers`/`User`; added `SessionRow`, `ApiSession`, `ApiResponse` interfaces; `useState`/`useEffect` fetches `/api/sessions?full=true`; maps `ApiSession[]` → `SessionRow[]`; renders loading/error/DataTable |
| `src/app/columns.tsx` | Replaced `User` with `SessionRow`; columns: Title (sortable, truncated), Source (color-coded `<Badge>`: opencode=default, claude=secondary, pi=outline, nexus=destructive), Messages (number badge), Updated (relative time), Directory (truncated path), Actions (Copy ID, View details) |
| `src/app/data-table.tsx` | Filter input changed from "Filter emails..." → "Filter titles...", bound to `title` column |

### Key Implementation Details

- `SessionRow` is a flat shape: `{ id, title, source, directory?, updatedAt, userMessageCount? }`
- `mapSessions` bridges the API response (`ApiSession[]`) to `SessionRow[]`
- `relativeTime()` formats ISO timestamps to strings like "2h ago"
- `sourceBadgeVariant()` maps source strings to Badge variants (opencode, claude, pi, nexus)
- Loading state shows "Loading sessions…"; errors show "Error: {message}"
- `src/lib/agentSight.ts` and `src/app/api/sessions/route.ts` are **not** modified

## Command Menu (cmdk)

An accessible, keyboard-driven command palette integrated into the landing page. Press **⌘K** (or **Ctrl+K**) or click the **⌘K Quick Search** button to open.

### Files Modified

| File | Change |
|------|--------|
| `src/app/command-menu.tsx` | Removed hardcoded `STUB_USERS`; accepts `{ data: SessionRow[] }` prop; renders live sessions with title, source, directory, message count, and relative time |
| `src/app/page.tsx` | Passes `data={data}` to `CommandMenu` — shares the same `SessionRow[]` as the DataTable |
| `ecosystem.json` | Changed `npm` → `pnpm` for both dev and prod scripts (fixes server startup) |

### Features

- **Keyboard shortcut**: `Cmd+K` / `Ctrl+K` toggles the menu
- **Searchable**: Filters by title (default), source, directory, and relative time via `keywords` prop
- **Grouped**: All sessions rendered in a single `Command.Group` with heading "Sessions"
- **Accessible**: Labelled dialog with ARIA attributes, keyboard navigation (arrow keys, Enter, Escape)
- **Footer**: Shows keyboard shortcuts and live result count
- **Live sync**: CommandMenu and DataTable always show identical data from `/api/sessions`

### Usage

```bash
# Open the landing page and press Cmd+K (or Ctrl+K)
curl 'http://localhost:3000'
```

### Key Implementation Details

- Uses `Command.Dialog` (Radix UI Dialog composition) for overlay/portal behavior
- Each `Command.Item` gets a unique `value` (session title) and `keywords` (source, directory, relative time) for broad matching
- `open` state controlled by `useState` + `useEffect` keydown listener
- Both DataTable and CommandMenu receive `data` from `page.tsx` — single source of truth, no duplication
- `relativeTime()` formats ISO timestamps to strings like "2h ago" for display in keywords
