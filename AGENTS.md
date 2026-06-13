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
