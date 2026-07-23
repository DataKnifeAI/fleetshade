import { timingSafeEqual } from "node:crypto";

/**
 * Read-only API trust checks:
 * 1. X-Dioptra-Site marker (shared secret embedded in the Dioptra SPA)
 * 2. Origin / Referer allowlist when present
 *
 * Note: anything shipped to the browser can be extracted. Marker + Origin +
 * rate limits deter casual scrapers; scrape credentials stay on this server only.
 */

export function parseAllowlist(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function originFromReferer(referer) {
  if (!referer) return null;
  try {
    const u = new URL(referer);
    return u.origin;
  } catch {
    return null;
  }
}

export function safeEqualString(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {{ siteMarker: string, allowedOrigins: string[], requireOrigin?: boolean }} cfg
 */
export function authorizeRequest(req, cfg) {
  const marker = req.headers["x-dioptra-site"];
  if (!cfg.siteMarker) {
    return { ok: false, status: 503, reason: "marker-not-configured" };
  }
  if (!safeEqualString(String(marker || ""), cfg.siteMarker)) {
    return { ok: false, status: 401, reason: "marker" };
  }

  const originHeader = req.headers.origin ? String(req.headers.origin) : null;
  const refererOrigin = originFromReferer(
    req.headers.referer ? String(req.headers.referer) : "",
  );
  const origin = originHeader || refererOrigin;

  if (origin) {
    const normalized = origin.replace(/\/$/, "");
    if (!cfg.allowedOrigins.includes(normalized)) {
      return { ok: false, status: 403, reason: "origin", origin: normalized };
    }
    return { ok: true, origin: normalized };
  }

  if (cfg.requireOrigin) {
    return { ok: false, status: 403, reason: "origin-missing" };
  }

  // Same-origin GET often omits Origin; marker is enough.
  return { ok: true, origin: null };
}

/**
 * CORS preflight: Origin must be allowlisted. Marker is not sent on OPTIONS.
 */
export function authorizePreflight(req, cfg) {
  const origin = req.headers.origin ? String(req.headers.origin).replace(/\/$/, "") : null;
  if (!origin || !cfg.allowedOrigins.includes(origin)) {
    return { ok: false, status: 403, reason: "origin" };
  }
  return { ok: true, origin };
}

export function corsHeaders(origin) {
  if (!origin) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "Accept, X-Dioptra-Site",
    "Access-Control-Max-Age": "600",
  };
}
