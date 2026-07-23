/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.DIOPTRA_API_PROXY || "http://127.0.0.1:8787";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port: 4173,
      host: true,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
    test: {
      environment: "node",
      include: ["src/**/*.test.ts", "server/**/*.test.ts"],
    },
  };
});
