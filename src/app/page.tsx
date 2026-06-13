"use client"

import { useEffect, useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { CommandMenu } from "./command-menu"

interface SessionRow {
  id: string
  title: string
  source: string
  directory?: string
  updatedAt: string
  userMessageCount?: number
}

interface ApiSession {
  id: string
  source: string
  title: string
  directory?: string
  createdAt?: string
  updatedAt?: string
  userMessageCount?: number
  messages: Array<{ content: string; createdAt: string; messageId: string }>
  timestamp: string
}

interface ApiResponse {
  sessions: ApiSession[]
  error?: string
}

/**
 * Map raw API session objects into the flat SessionRow shape used by the table.
 */
function mapSessions(raw: ApiSession[]): SessionRow[] {
  return raw.map((s) => ({
    id: s.id,
    title: s.title,
    source: s.source,
    directory: s.directory,
    updatedAt: s.updatedAt ?? s.timestamp,
    userMessageCount: s.userMessageCount,
  }))
}

export default function Home() {
  const [data, setData] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/sessions?full=true")
      .then((res) => res.json() as Promise<ApiResponse>)
      .then((body) => {
        if (body.error) {
          setError(body.error)
        } else {
          setData(mapSessions(body.sessions))
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Sessions</h2>
        <CommandMenu />
      </div>
      {loading ? (
        <p className="text-muted-foreground">Loading sessions…</p>
      ) : error ? (
        <p className="text-destructive">Error: {error}</p>
      ) : (
        <DataTable columns={columns} data={data} />
      )}
    </div>
  )
}
