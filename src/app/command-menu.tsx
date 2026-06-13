"use client"

import * as React from "react"
import { Command } from "cmdk"

/**
 * Session shape — mirrors the DataTable's data type.
 */
interface SessionRow {
  id: string
  title: string
  source: string
  directory?: string
  updatedAt: string
  userMessageCount?: number
}

/**
 * Props for CommandMenu: receives the same session data as the DataTable.
 */
interface CommandMenuProps {
  data: SessionRow[]
}

/**
 * Format an ISO timestamp to a relative string (e.g. "2h ago").
 */
function relativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffH < 24) return `${diffH}h ago`
  return `${diffD}d ago`
}

/**
 * CommandMenu — a ⌘K command palette that surfaces the table's session
 * data as searchable, filterable items.
 *
 * Receives the same `data` array as the DataTable so both components
 * always stay in sync.
 *
 * All styling is handled by CSS selectors in globals.css (Raycast preset).
 * Press ⌘K (or Ctrl+K) to open. Type to filter. Arrow keys to navigate.
 */
export function CommandMenu({ data }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false)

  // Toggle the menu when ⌘K / Ctrl+K is pressed
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      {/* Trigger button — styled with Tailwind (not a cmdk component) */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
        aria-label="Open command menu"
      >
        <span>⌘K</span>
        <span className="hidden sm:inline">Quick Search</span>
      </button>

      {/* Dialog overlay — styling via [cmdk-root] selector in globals.css */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command Menu"
      >
        <span className="sr-only">Command Menu</span>
        <Command.Input placeholder="Type a command or search…" autoFocus />

        <Command.List>
          <Command.Empty>No results found.</Command.Empty>

          <Command.Group heading="Sessions">
            {data.map((session) => (
              <Command.Item
                key={session.id}
                value={session.title}
                keywords={[
                  session.source,
                  session.directory ?? "",
                  relativeTime(session.updatedAt),
                ]}
                onSelect={(value) => {
                  setOpen(false)
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{session.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {session.source} · {session.directory ? session.directory : "—"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {session.userMessageCount != null ? `${session.userMessageCount} msgs` : ""}
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>

        {/* Footer — styled via [cmdk-raycast-footer] selector in globals.css */}
        <div cmdk-raycast-footer>
          <div className="flex gap-3">
            <span><kbd>⌘K</kbd> Toggle</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>esc</kbd> Close</span>
          </div>
          <span>{data.length} results</span>
        </div>
      </Command.Dialog>
    </>
  )
}
