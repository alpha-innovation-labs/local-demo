"use client"

import * as React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface SessionRow {
  id: string
  title: string
  source: string
  directory?: string
  updatedAt: string
  userMessageCount?: number
}

/**
 * Format an ISO timestamp to a relative string (e.g. "2h ago").
 */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/**
 * Color-code a source name into a Badge variant.
 */
function sourceBadgeVariant(source: string): "default" | "secondary" | "destructive" | "outline" {
  switch (source) {
    case "opencode": return "default"
    case "claude": return "secondary"
    case "pi": return "outline"
    case "nexus": return "destructive"
    default: return "outline"
  }
}

export const columns: ColumnDef<SessionRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span className="font-medium truncate block max-w-[240px]" title={row.getValue("title") as string}>
        {row.getValue("title") as string}
      </span>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => {
      const source = row.getValue("source") as string
      return <Badge variant={sourceBadgeVariant(source)}>{source}</Badge>
    },
  },
  {
    accessorKey: "userMessageCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Messages
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const count = row.getValue("userMessageCount") as number | undefined
      return <Badge variant="outline">{count ?? 0}</Badge>
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const ts = row.getValue("updatedAt") as string
      return <span className="text-muted-foreground">{relativeTime(ts)}</span>
    },
  },
  {
    accessorKey: "directory",
    header: "Directory",
    cell: ({ row }) => {
      const dir = row.getValue("directory") as string | undefined
      if (!dir) return <span className="text-muted-foreground">—</span>
      const parts = dir.split("/").filter(Boolean)
      const display = parts.length > 3 ? `…/${parts.slice(-3).join("/")}` : dir
      return <span className="text-muted-foreground truncate max-w-[160px] block" title={dir}>{display}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const session = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={(triggerProps) => (
              <Button
                ref={triggerProps.ref}
                variant="ghost"
                className="h-8 w-8 p-0"
                {...triggerProps}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          />
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(session.id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => alert(`Session: ${session.id}`)}>View details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
