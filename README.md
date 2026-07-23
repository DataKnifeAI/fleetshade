# ARGUS

**Argus** (Ἀργος / Argus Panoptes) — DataKnife’s public, read-only agent-fleet status board.

> All eyes on the fleet: Kubernetes node health, Cursor & Hermes agent presence, and the public task queue.

## Status

**Mock phase.** The static mock under [`mock/`](./mock/) is for design approval before implementation.

Open locally:

```bash
# from repo root
python3 -m http.server 8787 --directory mock
# → http://127.0.0.1:8787
```

## Intent

| Concern | Approach |
|--------|----------|
| Audience | Public indicator of active agent work |
| Mutating APIs | None — GET-only snapshots |
| Secrets / kubectl | Never exposed to the browser |
| Data | Aggregated health + public task titles only |

## Planned surfaces (after approval)

1. **Kubernetes nodes** — Ready / pressure / coarse CPU·mem (from a scraped snapshot, not live API credentials in the frontend)
2. **Agent health** — Cursor (Coder + cloud agents) and Hermes (Enodios / vLLM workers)
3. **Task · queue** — running / queued / recent done, public titles only

## Codename

Named for **Argus Panoptes**, the hundred-eyed watchman — a fit next to DataKnife’s **Enodios** (Hermes) line.

## License

TBD · DataKnifeAI
