import { execSync } from "child_process";

/**
 * Represents a single message in a session.
 */
export interface SessionMessage {
  role?: string;
  content?: string;
  [key: string]: unknown;
}

/**
 * Represents a full conversation object returned by --full.
 */
export interface FullMessage extends SessionMessage {
  role: string;
  content: string;
}

/**
 * A single session entry returned from agent-sight.
 */
export interface SessionEntry {
  id: string;
  source: string;
  title: string;
  messages: string[] | FullMessage[];
  timestamp: string;
}

/**
 * The response shape for the sessions API.
 */
export interface SessionsResponse {
  sessions: SessionEntry[];
  error?: string;
}

/**
 * Valid sources for agent-sight queries.
 */
export const SOURCES = ["opencode", "claude", "pi", "nexus"] as const;
export type Source = (typeof SOURCES)[number];

/**
 * Query parameters for the sessions API.
 */
export interface SessionsQueryParams {
  since?: string;
  source?: string;
  full?: string;
}

/**
 * Build the agent-sight CLI command for querying sessions.
 *
 * @param source - One of opencode, claude, pi, nexus
 * @param since  - Time window (e.g. "24h", "7d")
 * @param full   - Whether to include --full flag
 * @returns The CLI command as a string
 */
function buildQueryCommand(
  source: Source,
  since: string = "24h",
  full: boolean = false
): string {
  const base = `agent-sight query --since ${since} --source ${source}`;
  return full ? `${base} --full` : base;
}

/**
 * Parse raw agent-sight CLI output into session entries.
 *
 * The CLI returns JSON keyed by session ID with message arrays per session.
 * This function extracts the first message as the title and attaches metadata.
 *
 * @param rawOutput - Raw CLI stdout as a string
 * @param source    - The source name for this batch
 * @param full      - Whether --full was used (structured objects vs strings)
 * @returns Array of SessionEntry objects
 */
function parseOutput(
  rawOutput: string,
  source: Source,
  full: boolean
): SessionEntry[] {
  const parsed = JSON.parse(rawOutput);
  const entries: SessionEntry[] = [];

  for (const [id, messages] of Object.entries(parsed)) {
    const msgArray = messages as string[] | FullMessage[];
    const firstMsg = msgArray[0];

    // With --full, firstMsg is an object; without, it's a string.
    const title =
      typeof firstMsg === "string"
        ? firstMsg.substring(0, 200) || "(empty)"
        : (firstMsg.content?.substring(0, 200) || "(empty)");

    entries.push({
      id,
      source,
      title,
      messages: msgArray,
      timestamp: new Date().toISOString(),
    });
  }

  return entries;
}

/**
 * Execute agent-sight query for a single source and return parsed entries.
 *
 * @param source    - The source to query
 * @param since     - Time window filter
 * @param full      - Whether to use --full flag
 * @returns Array of SessionEntry objects
 */
function querySource(
  source: Source,
  since: string,
  full: boolean
): SessionEntry[] {
  const command = buildQueryCommand(source, since, full);
  const output = execSync(command, { encoding: "utf8" });
  return parseOutput(output, source, full);
}

/**
 * Fetch sessions from agent-sight across one or all sources.
 *
 * Runs all source queries in parallel via Promise.all.
 * Results are flattened and sorted by timestamp (most recent first).
 *
 * @param params - Query parameters (since, source, full)
 * @returns SessionsResponse with sorted session entries
 */
export function fetchSessions(
  params: SessionsQueryParams
): SessionsResponse {
  const since = params.since || "24h";
  const full = params.full === "true";
  const requestedSource = params.source as Source | undefined;

  // Filter sources: use requested source or all four
  const sourcesToQuery: Source[] = requestedSource
    ? (SOURCES.includes(requestedSource) ? [requestedSource] : [])
    : [...SOURCES];

  if (sourcesToQuery.length === 0) {
    return {
      sessions: [],
      error: `Invalid source "${params.source}". Must be one of: ${SOURCES.join(", ")}`,
    };
  }

  try {
    const allEntries = sourcesToQuery.map((source) =>
      querySource(source, since, full)
    );

    // Flatten and sort by timestamp descending
    const sessions = allEntries
      .flat()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return { sessions };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { sessions: [], error: `agent-sight CLI error: ${message}` };
  }
}
