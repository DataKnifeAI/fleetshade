/**
 * Simple fixed-window rate limiter keyed by client IP.
 */
export function createRateLimiter({ windowMs = 60_000, max = 60 } = {}) {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const buckets = new Map();

  function clientKey(req) {
    const xf = req.headers["x-forwarded-for"];
    if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
    return req.socket?.remoteAddress || "unknown";
  }

  return {
    check(req) {
      const key = clientKey(req);
      const now = Date.now();
      let bucket = buckets.get(key);
      if (!bucket || now >= bucket.resetAt) {
        bucket = { count: 0, resetAt: now + windowMs };
        buckets.set(key, bucket);
      }
      bucket.count += 1;
      const remaining = Math.max(0, max - bucket.count);
      const ok = bucket.count <= max;
      return {
        ok,
        remaining,
        resetAt: bucket.resetAt,
        retryAfterSec: ok ? 0 : Math.ceil((bucket.resetAt - now) / 1000),
      };
    },
    // test helper
    _reset() {
      buckets.clear();
    },
  };
}
