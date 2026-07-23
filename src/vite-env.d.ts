/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Status endpoint (default /api/status) */
  readonly VITE_STATUS_URL?: string;
  /** Shared site marker sent as X-Dioptra-Site (must match API DIOPTRA_SITE_MARKER) */
  readonly VITE_SITE_MARKER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
