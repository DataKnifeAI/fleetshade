#!/usr/bin/env bash
# Deploy Dioptra to Rancher-managed prd-apps (images from Harbor).
# Prereq: kubectl context prd-apps, harbor-registry-secret in namespace dioptra.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

CONTEXT="${KUBE_CONTEXT:-prd-apps}"
NAMESPACE="dioptra"

echo "Deploying Dioptra to context=${CONTEXT} namespace=${NAMESPACE}"

if ! kubectl config get-contexts -o name | grep -qx "$CONTEXT"; then
  echo "kubectl context '$CONTEXT' not found" >&2
  exit 1
fi

kubectl config use-context "$CONTEXT"
kubectl apply -f k8s/namespace.yaml

if ! kubectl -n "$NAMESPACE" get secret harbor-registry-secret >/dev/null 2>&1; then
  echo "warning: harbor-registry-secret missing in $NAMESPACE (image pulls may fail)" >&2
fi

if ! kubectl -n "$NAMESPACE" get secret dioptra-api >/dev/null 2>&1; then
  echo "warning: secret/dioptra-api missing — create from k8s/examples/secret.example.yaml" >&2
fi

kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml

kubectl -n "$NAMESPACE" rollout status deployment/dioptra-api --timeout=180s
kubectl -n "$NAMESPACE" rollout status deployment/dioptra-web --timeout=180s

echo "Done. Services: dioptra-web (80) → proxies /api to dioptra-api (8787)"
kubectl -n "$NAMESPACE" get deploy,svc
