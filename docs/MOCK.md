# ARGUS mock — approval brief

## Codename

**Argus** — after Argus Panoptes (hundred-eyed watchman). Sits next to DataKnife’s Hermes line (**Enodios**).

## What you are approving

A **public, read-only** status board that shows:

1. **Kubernetes node health** — Ready / pressure, coarse CPU & memory
2. **Agent health** — Cursor (Coder workspaces + cloud agents) and Hermes (Enodios / vLLM)
3. **Task · queue** — running / queued / recent done, **public titles only**

## Security posture (non-negotiable)

| Do | Don't |
|----|--------|
| Serve static UI + GET-only JSON snapshots | Expose kubeconfig, tokens, or agent control |
| Coarse, public fields | Secrets, prompts, private diffs, internal URLs |
| Aggregate upstream in a trusted scraper/job | Let the browser talk to k8s / Coder / Hermes APIs |
| Fail closed to “unknown” | Write/mutate endpoints of any kind |

Minimal attack surface: static site (or CDN) + periodically published snapshot files. No login required for the public view; no session cookies.

## Visual mock

- Concept render: [`argus-dashboard-mock.png`](./argus-dashboard-mock.png)
- Interactive HTML (sample data): [`../mock/index.html`](../mock/index.html)

```bash
python3 -m http.server 8787 --directory mock
```

## Proposed build (after approval)

- **Frontend**: static or tiny Vite SPA, no backend write paths
- **Publisher**: in-cluster CronJob / GitHub Action that writes `status.json` (nodes, agents, queue)
- **Hosting**: Cloudflare / static ingress on the existing GitOps edge
- **Repo**: `DataKnifeAI/argus`

## Open questions for you

1. Public repo + public site, or public site with private repo?
2. Which clusters first — `prd-apps`, `nprd-apps`, Coder pool, or all?
3. Task feed source of truth — Cursor cloud agents API, Coder, Hermes jobs, or a thin internal aggregator?
4. Any fields that must **never** appear even in titles (repo names, customer tags, etc.)?
