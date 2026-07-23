# DIOPTRA mock — approval brief

## Codename

**Dioptra** — ancient Greek instrument for observation and angular measurement.  
Unused on GitHub (no meaningful collisions); free under `DataKnifeAI`.  
Renamed from Argus (too common).

Other free short options if you dislike it: `fleetglass`, `heliostat`, `eyry`, `watchglass`, `vaneboard`.

## Mock contents

| Section | Shows |
|--------|--------|
| Summary | nodes, agents online, open issues (GH+GL), in progress |
| Agent infra | visual map: GitHub/GitLab → Dioptra → Cursor/Hermes → Kubernetes |
| Kubernetes nodes | Ready / pressure + CPU·mem |
| Agent health | Cursor + Hermes rows |
| Issue backlog | **GitHub** and **GitLab** side by side — top **10** by priority each, plus **total open** counts |

## Open questions

1. Priority source — labels (`P0`…`P3`), GitHub Projects, GitLab weight/priority?
2. Which orgs/groups/repos are in scope for issue scrape?
3. Clusters first — `prd-apps`, `nprd-apps`, Coder pool, or all?
