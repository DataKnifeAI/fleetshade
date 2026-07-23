#!/usr/bin/env node
/**
 * Write a status.json snapshot (CLI). Prefer the read-only API for live serving.
 *
 * Env: see scripts/lib/build-status.mjs and .env.example
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildStatus, root } from "./lib/build-status.mjs";

const OUT = resolve(root, process.env.DIOPTRA_OUT || "public/status.json");

const status = await buildStatus();
writeFileSync(OUT, `${JSON.stringify(status, null, 2)}\n`);
console.log(`wrote ${OUT}`);
console.log(
  `github open=${status.summary.issuesGithub} · gitlab open=${status.summary.issuesGitlab}`,
);
