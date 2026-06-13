"use client"

import * as React from "react"
import { Command } from "cmdk"

/**
 * User interface matching the table data shape.
 */
interface User {
  id: string
  name: string
  email: string
  role: string
  status: "Active" | "Inactive" | "Pending"
  balance: string
}

/**
 * Stub data sourced from the table — used as command-menu items.
 */
const STUB_USERS: User[] = [
  { id: "728ed52f", name: "Alice Johnson", email: "alice@example.com", role: "Admin", status: "Active", balance: "$1,200.00" },
  { id: "489e1d42", name: "Bob Smith", email: "bob@example.com", role: "Editor", status: "Active", balance: "$850.50" },
  { id: "a1b2c3d4", name: "Carol White", email: "carol@example.com", role: "Viewer", status: "Inactive", balance: "$0.00" },
  { id: "e5f6g7h8", name: "David Brown", email: "david@example.com", role: "Editor", status: "Active", balance: "$2,340.75" },
  { id: "i9j0k1l2", name: "Eva Martinez", email: "eva@example.com", role: "Admin", status: "Active", balance: "$1,890.25" },
  { id: "m3n4o5p6", name: "Frank Lee", email: "frank@example.com", role: "Viewer", status: "Pending", balance: "$120.00" },
  { id: "q7r8s9t0", name: "Grace Kim", email: "grace@example.com", role: "Editor", status: "Active", balance: "$670.30" },
  { id: "u1v2w3x4", name: "Henry Chen", email: "henry@example.com", role: "Viewer", status: "Inactive", balance: "$0.00" },
  { id: "y5z6a7b8", name: "Iris Nakamura", email: "iris@example.com", role: "Editor", status: "Active", balance: "$1,450.00" },
  { id: "c9d0e1f2", name: "Jack Thompson", email: "jack@example.com", role: "Viewer", status: "Pending", balance: "$320.00" },
  { id: "g3h4i5j6", name: "Karen Patel", email: "karen@example.com", role: "Admin", status: "Active", balance: "$2,100.50" },
  { id: "k7l8m9n0", name: "Leo Garcia", email: "leo@example.com", role: "Editor", status: "Inactive", balance: "$0.00" },
]

/**
 * CommandMenu — a ⌘K command palette that surfaces the table's user
 * data as searchable, filterable items.
 *
 * Press ⌘K (or Ctrl+K) to open. Type to filter. Arrow keys to navigate.
 */
export function CommandMenu() {
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

          <Command.Group heading="Users">
            {STUB_USERS.map((user) => (
              <Command.Item
                key={user.id}
                value={user.name}
                keywords={[user.email, user.role, user.status, user.balance]}
                onSelect={(value) => {
                  setOpen(false)
                }}
                className="flex items-center justify-between px-3 py-2 cursor-pointer rounded-md"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email} · {user.role}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{user.balance}</span>
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
          <span>{STUB_USERS.length} results</span>
        </div>
      </Command.Dialog>
    </>
  )
}
