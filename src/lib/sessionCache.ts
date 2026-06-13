import fs from "fs";
import path from "path";
import type { SessionsResponse } from "./agentSight";

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
 * Read the cache for a given key. Returns the stale entry or undefined.
 *
 * @param key - Cache key string
 * @returns The cached entry or undefined if not present / expired.
 */
export function readCache(key: string): CacheEntry | undefined {
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
    // Corrupt file — remove and return undefined
    fs.unlinkSync(filePath);
    return undefined;
  }
}

/**
 * Write a response into the cache file.
 *
 * @param key - Cache key string
 * @param data - The response to cache
 */
export function writeCache(key: string, data: SessionsResponse): void {
  ensureCacheDir();
  const filePath = cacheFilePath(key);
  const entry: CacheEntry = { data, timestamp: Date.now() };
  fs.writeFileSync(filePath, JSON.stringify(entry), "utf8");
}
