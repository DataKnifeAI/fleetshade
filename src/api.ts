import type { FleetStatus } from "./types";

const STATUS_URL = import.meta.env.VITE_STATUS_URL || "/status.json";

export async function fetchStatus(signal?: AbortSignal): Promise<FleetStatus> {
  const res = await fetch(STATUS_URL, {
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`status ${res.status} fetching ${STATUS_URL}`);
  }
  return (await res.json()) as FleetStatus;
}
