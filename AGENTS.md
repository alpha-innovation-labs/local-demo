# Demo — Next.js 15 / Tailwind CSS v4 Starter

A minimal Next.js application scaffolded with `create-next-app`, configured with TypeScript and Tailwind CSS v4, managed via PM2 and `just`.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, TypeScript) |
| UI | React 19, Tailwind CSS v4 (via `@tailwindcss/postcss`) |
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
├── ecosystem.json          # PM2 config (starts `npm run dev`)
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
- The default landing page is unmodified from `create-next-app`.
- The server runs on `http://localhost:3000`.

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
