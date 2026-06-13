import { NextRequest, NextResponse } from "next/server";
import { fetchSessions, type SessionsQueryParams } from "@/lib/agentSight";
import { buildCacheKey, readCache, writeCache } from "@/lib/sessionCache";

/**
 * GET /api/sessions
 *
 * Query agent-sight for conversation history and return session titles.
 * Uses in-memory stale-while-revalidate caching:
 *   1. Returns the cached response immediately (may be stale).
 *   2. Fetches fresh data in the background and updates the cache.
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

  const cacheKey = buildCacheKey(params);
  const cached = readCache(cacheKey);

  // Return stale cache immediately if available.
  if (cached) {
    console.log(`[sessionCache] HIT key=${cacheKey}`);
    const status = cached.data.error ? 400 : 200;
    // Fire background refresh (does NOT block the response).
    queueMicrotask(() => {
      const fresh = fetchSessions(params);
      writeCache(cacheKey, fresh);
    });
    const response = NextResponse.json(cached.data, { status });
    response.headers.set("X-Cache", "HIT");
    return response;
  }

  // No cache — fetch fresh data.
  console.log(`[sessionCache] MISS key=${cacheKey}`);
  const result = fetchSessions(params);
  writeCache(cacheKey, result);

  const status = result.error ? 400 : 200;
  const response = NextResponse.json(result, { status });
  response.headers.set("X-Cache", "MISS");
  return response;
}
