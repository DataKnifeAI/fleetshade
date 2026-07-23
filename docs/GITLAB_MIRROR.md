# GitLab mirror → Harbor → Rancher

Dioptra’s **canonical source** is GitHub:

`https://github.com/DataKnifeAI/dioptra`

A **GitLab mirror** exists so CI can publish images to Harbor and deploy onto Rancher-managed clusters:

```
GitHub DataKnifeAI/dioptra
        │  (Actions mirror on main)
        ▼
GitLab  dk-raas/dkai/tools/dioptra
        │  (GitLab CI · tag: kubernetes)
        ▼
Harbor  harbor.dataknife.net/library/dioptra
        harbor.dataknife.net/library/dioptra-api
        │
        ▼
Rancher / kubectl → prd-apps · namespace dioptra
```

Mirror project: [gitlab.com/dk-raas/dkai/tools/dioptra](https://gitlab.com/dk-raas/dkai/tools/dioptra)

## One-time setup

### 1. GitLab project

If missing:

```bash
glab repo create dk-raas/dkai/tools/dioptra \
  --private \
  --defaultBranch main \
  -d "Mirror of DataKnifeAI/dioptra for Harbor publish and Rancher deploy"
```

### 2. GitHub secret

On `DataKnifeAI/dioptra`, set repository secret:

| Secret | Purpose |
|--------|---------|
| `GITLAB_TOKEN` | Push mirror (`write_repository` on the GitLab project) |

Workflow: [`.github/workflows/mirror-gitlab.yml`](../.github/workflows/mirror-gitlab.yml) runs after CI succeeds on `main`.

### 3. GitLab CI variables (Harbor)

Set on the project or parent group `dk-raas/dkai/tools` (masked):

| Variable | Example |
|----------|---------|
| `HARBOR_REGISTRY` | `harbor.dataknife.net` |
| `HARBOR_PROJECT` | `library` |
| `HARBOR_USER` | robot / user |
| `HARBOR_PASSWORD` | secret |

Optional deploy:

| Variable | Purpose |
|----------|---------|
| `PRD_APPS_KUBECONFIG` | kubeconfig for `prd-apps` (GitLab deploy job) |

### 4. Cluster pull secret

Namespace `dioptra` on `prd-apps` needs `harbor-registry-secret` (same pattern as other DataKnife apps).

## Publish & deploy

| Step | How |
|------|-----|
| Mirror | Push/merge to GitHub `main` → Actions pushes to GitLab |
| Images | GitLab CI [`.gitlab-ci.yml`](../.gitlab-ci.yml) builds `dioptra` + `dioptra-api` → Harbor |
| Deploy | `./k8s/deploy-to-prd-apps.sh` or GitLab `deploy` job when kubeconfig is set |

Manifests: [`k8s/`](../k8s/).

## Authenticate `glab` (local)

```bash
glab auth login --hostname gitlab.com
# or: export GITLAB_TOKEN=glpat-…
glab auth status
```
