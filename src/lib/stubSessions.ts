import { SessionEntry, Source, SOURCES } from "./agentSight";

/**
 * Deterministic pseudo-random number generator (mulberry32).
 * Seeded by a string so stub data is reproducible across renders.
 */
function mulberry32(seed: string): () => number {
  let h = 0x80000000;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 1274126177);
    return ((h >>> 0) / 4294967296) as unknown as number;
  };
}

const rand = mulberry32("stub-seed-2026");

/**
 * Sample title fragments for composing realistic-looking stub session titles.
 */
const prefixes = [
  "Debug auth flow",
  "Fix API route",
  "Implement search",
  "Refactor utils",
  "Add error handling",
  "Optimize query",
  "Migrate database",
  "Setup CI pipeline",
  "Review PR #42",
  "Write unit tests",
  "Deploy staging",
  "Update dependencies",
  "Fix memory leak",
  "Add rate limiting",
  "Config webpack",
  "Implement caching",
  "Setup monitoring",
  "Debug CORS issue",
  "Add logging",
  "Refactor hooks",
];

const suffixes = [
  "in Next.js app",
  "for the dashboard",
  "on production",
  "with TypeScript",
  "using PostgreSQL",
  "with Docker",
  "in the API layer",
  "for mobile users",
  "during migration",
  "after the update",
  "with Redis cache",
  "on the staging env",
  "using GraphQL",
  "with WebSocket",
  "for the admin panel",
  "in the microservice",
  "with OAuth2",
  "on AWS Lambda",
  "using gRPC",
  "for the analytics",
];

/**
 * Generate a single random stub session entry.
 *
 * @param index - Unique index used as the seed for reproducibility.
 * @returns A SessionEntry object with realistic demo data.
 */
function generateStubSession(index: number): SessionEntry {
  const source = SOURCES[index % SOURCES.length] as Source;
  const prefix = prefixes[Math.floor(rand() * prefixes.length)];
  const suffix = suffixes[Math.floor(rand() * suffixes.length)];
  const title = `${prefix} ${suffix}`;
  const userMessageCount = Math.floor(rand() * 50) + 1;
  const minutesAgo = Math.floor(rand() * 7 * 24 * 60);
  const updatedAt = new Date(Date.now() - minutesAgo * 60000).toISOString();
  const directory = rand() > 0.3 ? `/home/user/projects/demo/src/${source}/${prefix.replace(/\s+/g, "-").toLowerCase()}` : undefined;

  return {
    id: `stub-${String(index).padStart(4, "0")}`,
    source,
    title,
    directory,
    createdAt: new Date(Date.now() - (minutesAgo + Math.floor(rand() * 1440)) * 60000).toISOString(),
    updatedAt,
    userMessageCount,
    messages: [],
    timestamp: updatedAt,
  };
}

/**
 * Generate 100 deterministic stub sessions for demo / production use.
 *
 * When agent-sight is unavailable (NODE_ENV=production), this replaces
 * the real CLI query so the UI still renders a populated table.
 *
 * @returns Array of 100 SessionEntry objects sorted by updatedAt descending.
 */
export function generateStubSessions(): SessionEntry[] {
  const sessions = Array.from({ length: 100 }, (_, i) => generateStubSession(i));
  return sessions.sort(
    (a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
  );
}
