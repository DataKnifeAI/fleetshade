#!/usr/bin/env node
/**
 * Dioptra read-only live status API.
 *
 * GET  /api/status  — fleet snapshot (requires X-Dioptra-Site + allowed Origin)
 * GET  /healthz     — liveness (no marker; for probes only)
 * OPTIONS /api/*    — CORS preflight for allowlisted origins
 *
 * Non-GET/HEAD → 405. No write routes.
 */
import { createServer } from "node:http";
import { buildStatus, readJson, root } from "../scripts/lib/build-status.mjs";
import { resolve } from "node:path";
import {
  authorizePreflight,
  authorizeRequest,
  corsHeaders,
  parseAllowlist,
} from "./auth.mjs";
import { createRateLimiter } from "./ratelimit.mjs";

const PORT = Number(process.env.DIOPTRA_API_PORT || 8787);
const HOST = process.env.DIOPTRA_API_HOST || "0.0.0.0";
const SITE_MARKER = process.env.DIOPTRA_SITE_MARKER || "";
const ALLOWED_ORIGINS = parseAllowlist(
  process.env.DIOPTRA_ALLOWED_ORIGINS || "http://127.0.0.1:5173,http://localhost:5173",
);
const REQUIRE_ORIGIN = process.env.DIOPTRA_REQUIRE_ORIGIN === "1";
const REFRESH_MS = Number(process.env.DIOPTRA_REFRESH_SECONDS || 30) * 1000;
const RATE_MAX = Number(process.env.DIOPTRA_RATE_LIMIT_PER_MIN || 60);

if (!SITE_MARKER) {
  console.error("DIOPTRA_SITE_MARKER is required");
  process.exit(1);
}

const authCfg = {
  siteMarker: SITE_MARKER,
  allowedOrigins: ALLOWED_ORIGINS,
  requireOrigin: REQUIRE_ORIGIN,
};

const limiter = createRateLimiter({ windowMs: 60_000, max: RATE_MAX });

/** @type {{ status: any, error: string | null, inflight: Promise<void> | null }} */
const cache = {
  status: readJson(resolve(root, "public/status.json"), null),
  error: null,
  inflight: null,
};

function refresh() {
  if (cache.inflight) return cache.inflight;
  cache.inflight = (async () => {
    try {
      cache.status = await buildStatus();
      cache.error = null;
      console.log(
        `[dioptra-api] refreshed ${cache.status.generatedAt} gh=${cache.status.summary.issuesGithub} gl=${cache.status.summary.issuesGitlab}`,
      );
    } catch (err) {
      cache.error = err instanceof Error ? err.message : String(err);
      console.error("[dioptra-api] refresh failed:", cache.error);
    } finally {
      cache.inflight = null;
    }
  })();
  return cache.inflight;
}

function send(res, req, statusCode, body, extraHeaders = {}) {
  const method = (req.method || "GET").toUpperCase();
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  const headers = {
    "Content-Type":
      typeof body === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Length": Buffer.byteLength(payload),
    ...extraHeaders,
  };
  res.writeHead(statusCode, headers);
  if (method === "HEAD") {
    res.end();
    return;
  }
  res.end(payload);
}

function deny(res, req, status, reason, cors = {}) {
  send(res, req, status, { error: "forbidden", reason }, cors);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const method = (req.method || "GET").toUpperCase();

  if (url.pathname === "/healthz") {
    if (method !== "GET" && method !== "HEAD") {
      send(res, req, 405, "method not allowed");
      return;
    }
    send(res, req, 200, cache.error ? `degraded: ${cache.error}` : "ok");
    return;
  }

  if (!url.pathname.startsWith("/api/")) {
    send(res, req, 404, { error: "not_found" });
    return;
  }

  if (method === "OPTIONS") {
    const pre = authorizePreflight(req, authCfg);
    if (!pre.ok) {
      deny(res, req, pre.status, pre.reason);
      return;
    }
    res.writeHead(204, corsHeaders(pre.origin));
    res.end();
    return;
  }

  if (method !== "GET" && method !== "HEAD") {
    send(res, req, 405, { error: "method_not_allowed" });
    return;
  }

  const auth = authorizeRequest(req, authCfg);
  const cors = corsHeaders(auth.origin || req.headers.origin || undefined);
  if (!auth.ok) {
    deny(res, req, auth.status, auth.reason, cors);
    return;
  }

  const rl = limiter.check(req);
  if (!rl.ok) {
    send(
      res,
      req,
      429,
      { error: "rate_limited", retryAfterSec: rl.retryAfterSec },
      {
        ...cors,
        "Retry-After": String(rl.retryAfterSec),
        "X-RateLimit-Remaining": "0",
      },
    );
    return;
  }

  if (url.pathname === "/api/status") {
    if (!cache.status) {
      await refresh();
    }
    if (!cache.status) {
      send(
        res,
        req,
        503,
        { error: "unavailable", reason: cache.error || "no-data" },
        cors,
      );
      return;
    }
    send(res, req, 200, cache.status, {
      ...cors,
      "X-RateLimit-Remaining": String(rl.remaining),
      "X-Dioptra-Generated-At": cache.status.generatedAt,
    });
    return;
  }

  send(res, req, 404, { error: "not_found" }, cors);
});

await refresh();
setInterval(() => {
  void refresh();
}, REFRESH_MS);

server.listen(PORT, HOST, () => {
  console.log(`[dioptra-api] read-only listening on http://${HOST}:${PORT}`);
  console.log(`[dioptra-api] allowed origins: ${ALLOWED_ORIGINS.join(", ") || "(none)"}`);
  console.log(`[dioptra-api] rate limit: ${RATE_MAX}/min · refresh ${REFRESH_MS / 1000}s`);
});
