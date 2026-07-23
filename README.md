# DIOPTRA

**Dioptra** — DataKnife agent-fleet status board.

Named for the ancient Greek surveying instrument: measure the fleet, see the angles.

## Architecture

```
GitHub / GitLab / (nodes · agents)     Dioptra site (SPA)
            │                                │
            ▼                                │ GET /api/status
     read-only API  ◄── X-Dioptra-Site marker ┘
   (collect + cache)      + Origin allowlist
                          + rate limit
```

### GitLab mirror → Harbor → Rancher

Canonical source is **GitHub**. A **GitLab mirror** publishes images and deploys to Rancher:

| | |
|--|--|
| GitHub | `DataKnifeAI/dioptra` |
| GitLab mirror | [`dk-raas/dkai/tools/dioptra`](https://gitlab.com/dk-raas/dkai/tools/dioptra) |
| Harbor | `harbor.dataknife.net/library/dioptra` · `…/dioptra-api` |
| Cluster | Rancher **prd-apps** · namespace `dioptra` |

Details: [`docs/GITLAB_MIRROR.md`](./docs/GITLAB_MIRROR.md) · manifests: [`k8s/`](./k8s/)

- **API** refreshes live data on an interval and serves **GET-only** `/api/status`.
- **Site** sends a shared **site marker** header (`X-Dioptra-Site`) and must come from an **allowlisted Origin**.
- Scrape tokens (`GITHUB_TOKEN`, `GITLAB_TOKEN`, kube credentials) stay on the API host — never in the browser.

> The marker is embedded in the SPA, so a determined client can extract it. Combined with Origin checks and rate limits it stops casual overload; it is not a substitute for keeping collector secrets server-side. Put the API behind your edge (Cloudflare / ingress) for extra throttling.

## Surfaces

**Fleet** tab (live):

1. **Kubernetes nodes** — Ready / pressure, coarse CPU · mem  
2. **Agent health** — Cursor (Coder + cloud) and Hermes (Enodios / vLLM)  
3. **Issue backlog** — GitHub and GitLab issues, top 10 by priority per platform, with totals  

**Setup** tab (diagrams):

1. **Agent workspace setup** — Coder deploys template desktop spaces (`dkai-agent`, `dkai-arch`, `dkai-dev`, …) with tools/resources; outside router or inside vLLM via API  
2. **Agent flow** — outer lifecycle plus inner observe → plan → act → verify loops (tool loop, CI/review re-entry, blocked/handoff exits)  
3. **Fleet wiring** — GitHub / GitLab → Dioptra → agents → Kubernetes  



## Quick start (live API + site)

```bash
cp .env.example .env
# set matching VITE_SITE_MARKER and DIOPTRA_SITE_MARKER

# terminal 1 — read-only API
npm run dev:api

# terminal 2 — site (proxies /api → API)
npm install
npm run dev
# → http://127.0.0.1:5173
```

```bash
npm test
npm run build
```

### API contract

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/status` | `X-Dioptra-Site: <marker>` + allowlisted `Origin`/`Referer` when present |
| `OPTIONS` | `/api/*` | allowlisted `Origin` (CORS preflight) |
| `GET` | `/healthz` | none (probes only) |

Everything else → `404` / non-GET → `405`. Over limit → `429`.

Env knobs: see [`.env.example`](./.env.example).

### Docker Compose

```bash
export DIOPTRA_SITE_MARKER="$(openssl rand -hex 24)"
export DIOPTRA_ALLOWED_ORIGINS=http://127.0.0.1:8080,http://localhost:8080
docker compose up --build
# site http://127.0.0.1:8080  · api http://127.0.0.1:8787
```

## Offline snapshot (optional)

```bash
npm run publish:status   # writes public/status.json
```

The API seeds from that file and refreshes live sources on its timer.

## License

Apache-2.0 · DataKnifeAI
