import { execSync } from "child_process";

/**
 * Represents a single message inside a conversation.
 */
export interface ConversationMessage {
  content: string;
  createdAt: string;
  messageId: string;
}

/**
 * Raw conversation object returned by agent-sight --full.
 */
export interface RawConversation {
  createdAt: string;
  directory: string | null;
  messages: ConversationMessage[];
  sessionId: string;
  title: string;
  updatedAt: string;
  userMessageCount: number;
}

/**
 * Raw CLI response wrapper.
 */
export interface RawCliResponse {
  conversation_count: number;
  conversations: RawConversation[];
  directory: string | null;
  message_count: number;
  since: string;
  source: string;
}

/**
 * A single session entry returned from agent-sight.
 */
export interface SessionEntry {
  id: string;
  source: string;
  title: string;
  directory?: string;
  createdAt?: string;
  updatedAt?: string;
  userMessageCount?: number;
  messages: ConversationMessage[];
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
 * @param since  - Time window (e.g. "24h", "7d", "30m")
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
 * Two output formats:
 *   --full  : { conversation_count, conversations: [{ sessionId, title, createdAt, updatedAt, directory, messages, userMessageCount }] }
 *   (no --full): { sessionId: [msg1, msg2, ...] } — keyed by session ID with string message arrays
 *
 * @param rawOutput - Raw CLI stdout as a string
 * @param source    - The source name for this batch
 * @returns Array of SessionEntry objects
 */
function parseOutput(
  rawOutput: string,
  source: Source
): SessionEntry[] {
  const parsed: Record<string, unknown> = JSON.parse(rawOutput);

  // Detect format: --full returns 'conversations' key; non-full returns string arrays as values
  if (Array.isArray((parsed as RawCliResponse).conversations)) {
    // --full format
    const conversations = (parsed as RawCliResponse).conversations;
    return conversations.map((conv) => ({
      id: conv.sessionId,
      source,
      title: conv.title,
      directory: conv.directory || undefined,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      userMessageCount: conv.userMessageCount,
      messages: conv.messages,
      timestamp: conv.updatedAt,
    }));
  }

  // Non-full format: { sessionId: [msg1, msg2, ...] }
  const entries: SessionEntry[] = [];
  for (const [id, messages] of Object.entries(parsed)) {
    const msgArray = messages as string[] | undefined;
    if (!Array.isArray(msgArray)) continue;
    const firstMsg = msgArray[0] || "(empty)";
    entries.push({
      id,
      source,
      title: firstMsg.substring(0, 200),
      messages: msgArray.map((content) => ({
        content,
        createdAt: "",
        messageId: "",
      })),
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
  const raw = execSync(command, { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 });
  // Strip ANSI escape codes and other control chars that break JSON parsing
  const cleaned = raw.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, "").replace(/[\x00-\x1f\x7f]/g, (c) => {
    // Preserve newlines and tabs
    if (c === "\n" || c === "\t" || c === "\r") return c;
    return "";
  });
  return parseOutput(cleaned, source);
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
