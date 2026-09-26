#!/usr/bin/env node
// Soft, non-blocking check: warns (and logs) when graphify-out/graph.json is
// stale relative to HEAD, because the post-commit rebuild hook runs detached
// (nohup) and fails silently on stderr if the Python interpreter probe misses —
// see .githooks/post-commit. Never exits non-zero: staleness is a cost/quality
// signal, not a reason to block a commit.
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const GRAPH_JSON = path.join(ROOT, "graphify-out", "graph.json");
const LOG_FILE = path.join(os.homedir(), ".cache", "graphify-freshness.log");
const STALE_COMMIT_THRESHOLD = 1; // >1 commit behind HEAD is worth a warning
const SMALL_DIFF_FILE_THRESHOLD = 20; // auto-refresh only when the catch-up diff is small

function git(cmd) {
  return execSync(`git ${cmd}`, { cwd: ROOT, encoding: "utf8", windowsHide: true }).trim();
}

function log(msg) {
  console.warn(msg);
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`);
  } catch {
    // best-effort logging only
  }
}

function main() {
  if (!fs.existsSync(GRAPH_JSON)) return; // no graph built yet, nothing to check

  let builtAtCommit;
  try {
    builtAtCommit = JSON.parse(fs.readFileSync(GRAPH_JSON, "utf8")).built_at_commit;
  } catch {
    return; // malformed/unreadable graph.json — not this script's job to fix
  }
  if (!builtAtCommit) return;

  let head, gap;
  try {
    head = git("rev-parse HEAD");
    gap = parseInt(git(`rev-list --count ${builtAtCommit}..HEAD`), 10);
  } catch {
    return; // rewritten history / shallow clone / commit not found — skip silently
  }
  if (!Number.isFinite(gap) || gap <= STALE_COMMIT_THRESHOLD) return;

  let changedFiles = 0;
  try {
    changedFiles = git(`diff --name-only ${builtAtCommit} ${head}`)
      .split("\n").filter((f) => f && !f.startsWith("graphify-out/")).length;
  } catch {
    changedFiles = Infinity;
  }

  log(`[graphify freshness] graph.json is ${gap} commits behind HEAD (built_at_commit=${builtAtCommit.slice(0, 8)}, HEAD=${head.slice(0, 8)}). Run 'graphify update .' to refresh.`);

  if (changedFiles > 0 && changedFiles <= SMALL_DIFF_FILE_THRESHOLD) {
    try {
      execSync("graphify update .", { cwd: ROOT, stdio: "ignore", windowsHide: true });
      log("[graphify freshness] auto-refreshed via 'graphify update .' (small diff, foreground, AST-only).");
    } catch {
      log("[graphify freshness] auto-refresh attempt failed or 'graphify' CLI not on PATH — run 'graphify update .' manually.");
    }
  }
}

main();
