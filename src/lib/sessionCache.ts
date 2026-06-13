import fs from "fs";
import path from "path";
import type { SessionsResponse } from "./agentSight";

/** Whether we're in production (stub mode) — skip file caching entirely. */
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * File-based cache entry holding a stale response and the timestamp it was cached.
 */
interface CacheEntry {
  /** The cached API response. */
  data: SessionsResponse;
  /** When this entry was populated (epoch ms). */
  timestamp: number;
}

/** Cache directory on disk — one file per cache key. */
const CACHE_DIR = path.join(process.cwd(), ".cache", "sessions");

/** Cache TTL — entries older than this (ms) are considered expired. */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Ensure the cache directory exists. */
function ensureCacheDir(): void {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

/**
 * Build a deterministic cache key from session query params.
 *
 * @param params - Query parameters object
 * @returns A string suitable as a map key
 */
export function buildCacheKey(params: Record<string, string | undefined>): string {
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.map(([k, v]) => `${k}=${v}`).join("&");
}

/**
 * Get the file path for a cache key.
 *
 * @param key - Cache key string
 * @returns Absolute path to the cache file
 */
function cacheFilePath(key: string): string {
  // Sanitize key to be a valid filename
  const safeName = key.replace(/[&=]/g, "_").replace(/_/g, "-");
  return path.join(CACHE_DIR, `${safeName}.json`);
}

/**
 * Get the temporary file path for atomic writes.
 * Temp files use a .tmp extension so readers never see partial data.
 *
 * @param key - Cache key string
 * @returns Absolute path to the temporary cache file
 */
function cacheTempPath(key: string): string {
  const safeName = key.replace(/[&=]/g, "_").replace(/_/g, "-");
  return path.join(CACHE_DIR, `${safeName}.json.tmp`);
}

/**
 * Read the cache for a given key. Returns the stale entry or undefined.
 *
 * In production (stub mode), caching is disabled — always returns undefined.
 *
 * @param key - Cache key string
 * @returns The cached entry or undefined if not present / expired / corrupt.
 */
export function readCache(key: string): CacheEntry | undefined {
  if (IS_PRODUCTION) return undefined;
  ensureCacheDir();
  const filePath = cacheFilePath(key);
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      fs.unlinkSync(filePath);
      return undefined;
    }
    return entry;
  } catch {
    // Corrupt or partial file (e.g., from concurrent write) — remove and return undefined
    try {
      fs.unlinkSync(filePath);
    } catch {
      // File may have been removed by another process — ignore
    }
    return undefined;
  }
}

/**
 * Write a response into the cache file using an atomic rename pattern.
 *
 * In production (stub mode), caching is disabled — this is a no-op.
 *
 * In development, writes to a temporary file first, then renames it to
 * the target path. This prevents readers from seeing partial/truncated
 * JSON during a write, which causes "Unexpected end of JSON input" errors
 * on Vercel serverless.
 *
 * @param key - Cache key string
 * @param data - The response to cache
 */
export function writeCache(key: string, data: SessionsResponse): void {
  if (IS_PRODUCTION) return; // Stub data is deterministic — no cache needed.
  ensureCacheDir();
  const filePath = cacheFilePath(key);
  const tempPath = cacheTempPath(key);
  const entry: CacheEntry = { data, timestamp: Date.now() };
  const serialized = JSON.stringify(entry);

  // Write to temp file first
  fs.writeFileSync(tempPath, serialized, "utf8");

  // Atomic rename: readers always see either the old complete file or the new one
  try {
    fs.renameSync(tempPath, filePath);
  } catch {
    // rename may fail on some filesystems (e.g., cross-device mounts)
    // fall back to direct write and clean up temp file
    fs.writeFileSync(filePath, serialized, "utf8");
    try {
      fs.unlinkSync(tempPath);
    } catch {
      // Temp file may have been removed — ignore
    }
  }
}
