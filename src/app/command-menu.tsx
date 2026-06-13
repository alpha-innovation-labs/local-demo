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
 * Map a source string to a Tailwind badge variant for visual coding.
 */
function sourceVariant(source: string): string {
  switch (source) {
    case "opencode": return "default"
    case "claude": return "secondary"
    case "pi": return "outline"
    case "nexus": return "destructive"
    default: return "default"
  }
}

/**
 * CommandMenu — a ⌘K command palette that surfaces the table's session
 * data as searchable, filterable items.
 *
 * Receives the same `data` array as the DataTable so both components
 * always stay in sync.
 *
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
      {/* Trigger button visible on the page */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
        aria-label="Open command menu"
      >
        <span>⌘K</span>
        <span className="hidden sm:inline">Quick Search</span>
      </button>

      {/* Dialog overlay */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Command Menu"
        className="fixed left-1/2 top-1/2 z-50 h-[450px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background shadow-2xl"
      >
        <Command.Input placeholder="Type a command or search…" autoFocus />

        <Command.List className="max-h-[380px] overflow-y-auto">
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
                className="flex items-center justify-between px-3 py-2 cursor-pointer rounded-md"
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

        <div className="flex items-center justify-between border-t px-3 py-1.5 text-xs text-muted-foreground">
          <div className="flex gap-3">
            <span><kbd className="px-1 rounded bg-muted">⌘K</kbd> Toggle</span>
            <span><kbd className="px-1 rounded bg-muted">↵</kbd> Select</span>
            <span><kbd className="px-1 rounded bg-muted">esc</kbd> Close</span>
          </div>
          <span>{data.length} results</span>
        </div>
      </Command.Dialog>
    </>
  )
}
