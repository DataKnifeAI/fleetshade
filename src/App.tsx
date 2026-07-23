import { useEffect, useState } from "react";
import { fetchStatus } from "./api";
import type { FleetStatus } from "./types";
import { formatUtc } from "./lib/format";
import { SummaryStrip } from "./components/SummaryStrip";
import { Topology } from "./components/Topology";
import { NodesPanel } from "./components/NodesPanel";
import { AgentsPanel } from "./components/AgentsPanel";
import { BacklogPanel } from "./components/BacklogPanel";

const DEFAULT_REFRESH = 30;

export default function App() {
  const [status, setStatus] = useState<FleetStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const controller = new AbortController();

    async function load() {
      try {
        const data = await fetchStatus(controller.signal);
        if (cancelled) return;
        setStatus(data);
        setError(null);
        setLoading(false);
        const secs = data.refreshSeconds ?? DEFAULT_REFRESH;
        timer = window.setTimeout(load, secs * 1000);
      } catch (e) {
        if (cancelled || (e instanceof DOMException && e.name === "AbortError")) return;
        setError(e instanceof Error ? e.message : "failed to load status");
        setLoading(false);
        timer = window.setTimeout(load, DEFAULT_REFRESH * 1000);
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (loading && !status) {
    return <div className="state">Loading fleet status…</div>;
  }

  if (error && !status) {
    return <div className="state error">Unable to load status.json — {error}</div>;
  }

  if (!status) return null;

  return (
    <div className="shell">
      <header className="top">
        <div>
          <h1 className="brand">DIOPTRA</h1>
          <p className="tagline">DataKnife agent fleet</p>
        </div>
        <div className="meta">
          <span className={`badge${error ? " error" : ""}`}>
            <span className="dot" />
            {error ? "Stale" : "Live"}
          </span>
          <div className="clock">
            UTC {formatUtc(status.generatedAt)} · refresh{" "}
            {status.refreshSeconds ?? DEFAULT_REFRESH}s
          </div>
        </div>
      </header>

      <SummaryStrip status={status} />

      <div className="grid">
        <Topology status={status} />
        <NodesPanel nodes={status.nodes} />
        <AgentsPanel agents={status.agents} />
        <BacklogPanel github={status.backlog.github} gitlab={status.backlog.gitlab} />
      </div>

      <footer className="note">
        <div>DIOPTRA · DataKnifeAI</div>
        <div>{error ? `last error: ${error}` : "status.json"}</div>
      </footer>
    </div>
  );
}
