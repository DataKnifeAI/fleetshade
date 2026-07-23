# DIOPTRA

**Dioptra** — DataKnife agent-fleet status board.

Named for the ancient Greek surveying instrument: measure the fleet, see the angles.

## Surfaces

1. **Agent infra** — topology: GitHub / GitLab → Dioptra → Cursor & Hermes → Kubernetes  
2. **Kubernetes nodes** — Ready / pressure, coarse CPU · mem  
3. **Agent health** — Cursor (Coder + cloud) and Hermes (Enodios / vLLM)  
4. **Issue backlog** — GitHub and GitLab issues, top 10 by priority per platform, with total open counts  

The UI is a static SPA that polls a single **`/status.json`** snapshot (GET only).

## Quick start

```bash
npm install
npm run dev
# → http://127.0.0.1:5173
```

```bash
npm test
npm run build
npm run preview
```

Design mock (static HTML): [`mock/index.html`](./mock/index.html)

## Status snapshot

Schema: see [`public/status.json`](./public/status.json) and [`src/types.ts`](./src/types.ts).

Publish / refresh issues from GitHub (and optionally GitLab):

```bash
# uses `gh` auth or GITHUB_TOKEN
npm run publish:status

# optional GitLab
GITLAB_TOKEN=… DIOPTRA_GITLAB_GROUP=mygroup npm run publish:status
```

Nodes and agents are read from the existing snapshot (or `DIOPTRA_NODES_JSON` / `DIOPTRA_AGENTS_JSON` overrides) so scrape credentials never ship in the browser bundle.

Priority comes from issue labels (`P0`…`P3`, `priority: p1`, etc.). Unlabeled issues default to **P3**.

## Container

```bash
docker build -t dioptra:local .
docker run --rm -p 8080:8080 dioptra:local
# → http://127.0.0.1:8080
```

Nginx serves the built assets and `/status.json` with GET/HEAD only. Mount a fresh `status.json` over `/usr/share/nginx/html/status.json` from a CronJob or ConfigMap when wiring live data.

## License

Apache-2.0 · DataKnifeAI
