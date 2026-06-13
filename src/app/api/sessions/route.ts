import { NextRequest, NextResponse } from "next/server";
import { fetchSessions, type SessionsQueryParams } from "@/lib/agentSight";

/**
 * GET /api/sessions
 *
 * Query agent-sight for conversation history and return session titles.
 *
 * Query Parameters:
 *   - since  — Time window (e.g. "24h", "7d", "30m"). Default: "24h"
 *   - source — One of: opencode, claude, pi, nexus. Default: all sources
 *   - full   — "true" to return expanded conversation objects. Default: "false"
 *
 * Example: GET /api/sessions?since=7d&source=pi&full=true
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const params: SessionsQueryParams = {
    since: searchParams.get("since") || undefined,
    source: searchParams.get("source") || undefined,
    full: searchParams.get("full") || undefined,
  };

  const result = fetchSessions(params);

  const status = result.error ? 400 : 200;

  return NextResponse.json(result, { status });
}
