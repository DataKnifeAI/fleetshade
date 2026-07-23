import type { FleetStatus } from "./types";

const STATUS_URL = import.meta.env.VITE_STATUS_URL || "/api/status";
const SITE_MARKER = import.meta.env.VITE_SITE_MARKER || "";

export async function fetchStatus(signal?: AbortSignal): Promise<FleetStatus> {
  if (!SITE_MARKER) {
    throw new Error("VITE_SITE_MARKER is not configured");
  }

  const res = await fetch(STATUS_URL, {
    signal,
    headers: {
      Accept: "application/json",
      "X-Dioptra-Site": SITE_MARKER,
    },
    cache: "no-store",
    credentials: "omit",
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { reason?: string; error?: string };
      detail = body.reason || body.error || "";
    } catch {
      /* ignore */
    }
    throw new Error(
      `status ${res.status} fetching ${STATUS_URL}${detail ? ` (${detail})` : ""}`,
    );
  }

  return (await res.json()) as FleetStatus;
}
