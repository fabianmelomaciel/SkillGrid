#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const SKILLS_DIR = path.join(ROOT, "skills");
const MODELS_JSON = path.join(ROOT, "models.json");
const MERGE_SCRIPT = path.join(ROOT, "scripts", "merge-skill.js");
const BUNDLES_JSON = path.join(SKILLS_DIR, "bundles", "index.json");

const DEPENDENCIES = [
  { name: "git", pin: null, severity: "high", desc: "Version control" },
  { name: "node", pin: null, severity: "high", desc: "Cross-platform runtime" },
  { name: "npm", pin: null, severity: "medium", desc: "JS package manager" },
  { name: "composer", pin: null, severity: "medium", desc: "PHP package manager" },
  { name: "python3", pin: null, severity: "low", desc: "Python runtime" },
  { name: "pip-audit", pin: "2.10.1", severity: "medium", desc: "Python SCA" },
  { name: "semgrep", pin: "1.169.0", severity: "medium", desc: "SAST (OWASP Top 10)" },
  { name: "trivy", pin: "0.60.0", severity: "medium", desc: "Vulnerability scanner" },
  { name: "gitleaks", pin: "8.24.0", severity: "medium", desc: "Secret detection" },
  { name: "trufflehog", pin: "2.2.1", severity: "medium", desc: "Secret detection (entropy)" },
  { name: "checkov", pin: "3.3.8", severity: "medium", desc: "IaC security" },
  { name: "bandit", pin: "1.9.4", severity: "low", desc: "Python SAST" },
  { name: "safety", pin: "3.8.1", severity: "low", desc: "Python SCA" },
  { name: "nuclei", pin: "3.4.0", severity: "medium", desc: "Web vulnerability scanner" },
];

const CODE_IGNORES = [
  ".codegraph/", "codegraph-out/", "codegraph.json",
  "CODEGRAPH_REPORT.md", "codegraph.report.md", "codegraph.html",
  "token_comparison.json", "token_usage_comparison.json", "token_usage.json",
  "security-audit-report.html", "security-audit-report.json",
  ".cursor/rules/", ".github/instructions/", "CODEX.md",
];

function log(msg, level = "info") {
  const pre = level === "ok" ? "[+]" : level === "warn" ? "[!]" : level === "err" ? "[-]" : "[.]";
  const color = level === "ok" ? "\x1b[32m" : level === "warn" ? "\x1b[33m" : level === "err" ? "\x1b[31m" : "\x1b[36m";
  console.log(`  ${color}${pre}\x1b[0m ${msg}`);
}

function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^\s*(\w+):\s*(.+)\s*$/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^"|"$/g, "");
  }
  return fm;
}

function loadProfileSkills(profile) {
  if (!profile || profile === "all") return null;
  if (!fs.existsSync(BUNDLES_JSON)) return null;
  const bundles = JSON.parse(fs.readFileSync(BUNDLES_JSON, "utf-8"));
  const p = (bundles.profiles || {})[profile];
  if (!p || !Array.isArray(p.skills)) {
    log(`Profile '${profile}' not found. Options: ${Object.keys(bundles.profiles || {}).join(", ")} or all`, "warn");
    return null;
  }
  log(`Profile '${profile}': ${p.skills.length} skills`, "ok");
  return new Set(p.skills);
}

function detectPlatforms() {
  const home = require("os").homedir();
  const found = [];
  const checks = [
    { name: "opencode", path: path.join(home, ".config", "opencode", "skills") },
    { name: "antigravity", path: path.join(home, ".config", "antigravity", "skills") },
    { name: "antigravity (gemini)", path: path.join(home, ".gemini", "config", "skills") },
    { name: "antigravity-ide", path: path.join(home, ".gemini", "antigravity-ide", "skills") },
    { name: "claude-code", path: path.join(home, ".claude", "skills") },
  ];
  for (const c of checks) {
    const dir = path.dirname(c.path);
    if (fs.existsSync(dir)) found.push(c);
  }
  return found;
}

function normalizePlatform(name) {
  const map = {
    "opencode": "opencode",
    "antigravity": "antigravity",
    "antigravity (gemini)": "antigravity",
    "antigravity-ide": "antigravity-ide",
    "claude-code": "claude-code",
  };
  return map[name.toLowerCase()] || name;
}

function installSkills(targetDir, sourceDir, platform, profile) {
  sourceDir = sourceDir || ROOT;
  const absTarget = path.resolve(targetDir);
  const absSource = path.resolve(sourceDir);

  if (absTarget === absSource) {
    log(`Target is same as source: ${targetDir}. Skipping copy.`, "warn");
    return;
  }

  const isSkillRoot = absTarget.toLowerCase().endsWith(path.sep + "skills");
  const skillsRoot = isSkillRoot ? absTarget : path.join(absTarget, "skills");
  const profileSkills = loadProfileSkills(profile);
  const useLoader = platform && fs.existsSync(MERGE_SCRIPT) && fs.existsSync(MODELS_JSON);
  const normalizedPlatform = normalizePlatform(platform);

  fs.mkdirSync(skillsRoot, { recursive: true });
  log(`Installing to: ${absTarget} (platform: ${normalizedPlatform || "generic"})`);

  for (const special of ["shared", "bundles"]) {
    const src = path.join(absSource, "skills", special);
    const dst = path.join(skillsRoot, special);
    if (fs.existsSync(src)) {
      fs.rmSync(dst, { recursive: true, force: true });
      fs.mkdirSync(dst, { recursive: true });
      try { execSync(`xcopy "${src}" "${dst}" /E /I /Y > nul 2>&1`, { stdio: "ignore", shell: true, windowsHide: true }); }
      catch { try { execSync(`cp -r "${src}/" "${dst}/" 2>/dev/null`, { stdio: "ignore" }); } catch {} }
    }
  }

  const skillFiles = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(fp);
      else if (entry.name === "SKILL.md" && !fp.includes(path.sep + "template" + path.sep)) skillFiles.push(fp);
    }
  }
  walk(path.join(absSource, "skills"));

  let installed = 0;
  for (const sf of skillFiles) {
    const fm = parseFrontmatter(sf);
    const name = fm && fm.name ? fm.name : path.basename(path.dirname(sf));
    if (name === "template") continue;
    if (profileSkills && !profileSkills.has(name)) continue;

    const skillDir = path.dirname(sf);
    const destPath = path.join(skillsRoot, name);
    fs.rmSync(destPath, { recursive: true, force: true });
    fs.mkdirSync(destPath, { recursive: true });

    const entries = fs.readdirSync(skillDir, { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const relPath = path.relative(skillDir, path.join(entry.parentPath, entry.name));
      const destFile = path.join(destPath, relPath);
      fs.mkdirSync(path.dirname(destFile), { recursive: true });
      if (entry.name === "SKILL.md" && useLoader) {
        const srcFull = path.join(entry.parentPath, entry.name);
        try {
          execSync(`node "${MERGE_SCRIPT}" "${srcFull}" "" "${normalizedPlatform}" "${MODELS_JSON}" "${destFile}"`, { stdio: "ignore", windowsHide: true });
        } catch {
          fs.copyFileSync(srcFull, destFile);
        }
      } else {
        fs.copyFileSync(path.join(entry.parentPath, entry.name), destFile);
      }
    }
    installed++;
  }

  if (!isSkillRoot) {
    for (const f of ["install.ps1", "install.sh", "README.md", "package.json"]) {
      const src = path.join(absSource, f);
      const dst = path.join(absTarget, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, dst);
    }
  }

  log(`${installed} skills installed`, "ok");
  return installed;
}

function checkDependencies() {
  log("Dependency check", "ok");
  for (const dep of DEPENDENCIES) {
    try {
      const cmd = dep.name === "pip-audit"
        ? "python -m pip_audit --version"
        : `${dep.name} --version`;
      execSync(cmd, { stdio: "ignore", windowsHide: true });
      log(`${dep.name} (${dep.desc}): installed`, "ok");
    } catch {
      const level = dep.severity === "high" ? "err" : "warn";
      log(`${dep.name} (${dep.desc}): missing`, level);
    }
  }
}

function setupGitIgnores(projectDir) {
  const gitDir = path.join(projectDir, ".git");
  const excludePath = path.join(gitDir, "info", "exclude");
  const gitignorePath = path.join(projectDir, ".gitignore");
  let targetFile;

  if (fs.existsSync(gitDir)) {
    fs.mkdirSync(path.dirname(excludePath), { recursive: true });
    if (!fs.existsSync(excludePath)) fs.writeFileSync(excludePath, "");
    targetFile = excludePath;
  } else {
    targetFile = gitignorePath;
  }

  const existing = fs.existsSync(targetFile) ? fs.readFileSync(targetFile, "utf-8") : "";
  const header = "# SkillGrid local-only (CodeGraph + generated rules)";
  const lines = ["", header, ...CODE_IGNORES];

  const newLines = [];
  for (const l of lines) {
    if (!l.trim()) continue;
    if (!existing.includes(l)) newLines.push(l);
  }

  if (newLines.length > 0) {
    const sep = existing.endsWith("\n") ? "" : "\n";
    const add = newLines.map(l => l === header ? `\n${l}` : l).join("\n");
    fs.appendFileSync(targetFile, sep + add + "\n");
    log(`Updated ${path.basename(targetFile)} with SkillGrid ignores`, "ok");
  } else {
    log("Ignores already present", "ok");
  }
}

function installCodeGraph(autoInstall) {
  log("CodeGraph check", "ok");
  try {
    execSync("codegraph --version", { stdio: "ignore", windowsHide: true });
    log("codegraph: already installed", "ok");
  } catch {
    if (!autoInstall) {
      log("codegraph: not found. Use --install-codegraph to auto-install", "warn");
      return;
    }
    log("codegraph: installing...", "ok");
    try {
      execSync("npm install -g @colbymchenry/codegraph@1.4.1", { stdio: "ignore", windowsHide: true });
    } catch {
      try { execSync("pip install codegraph-cli==2.1.4 --user", { stdio: "ignore", windowsHide: true }); } catch {}
    }
    try {
      execSync("codegraph --version", { stdio: "ignore", windowsHide: true });
      log("codegraph: installed", "ok");
    } catch {
      log("codegraph: could not verify after install", "warn");
    }
  }
}

function setupProjectCodeGraph(projectDir) {
  if (!projectDir) return;
  const absProject = path.resolve(projectDir);
  const codegraphDir = path.join(absProject, ".codegraph");

  fs.mkdirSync(codegraphDir, { recursive: true });
  log(`CodeGraph dir: ${codegraphDir}`, "ok");
  setupGitIgnores(absProject);

  try {
    execSync("codegraph --version", { stdio: "ignore", windowsHide: true });
    log("Initializing codegraph...", "ok");
    try { execSync("codegraph init", { cwd: absProject, stdio: "ignore", windowsHide: true }); } catch {}
    try { execSync("codegraph sync", { cwd: absProject, stdio: "ignore", windowsHide: true }); } catch {}
    log("CodeGraph index completed", "ok");
  } catch {
    log("codegraph CLI not found, skipping index", "warn");
  }
}

function calcTokens(projectDir) {
  try {
    const files = execSync(
      `node -e "
        const fs = require('fs');
        const p = ${JSON.stringify(projectDir)};
        let total = 0, count = 0;
        function walk(d) {
          try {
            for (const e of fs.readdirSync(d, { withFileTypes: true })) {
              if (e.name.startsWith('.')) continue;
              if (['node_modules','vendor','dist','build'].includes(e.name)) continue;
              const fp = require('path').join(d, e.name);
              if (e.isDirectory()) walk(fp);
              else if (e.isFile()) { total += fs.statSync(fp).size; count++; }
            }
          } catch {}
        }
        walk(p);
        console.log(JSON.stringify({ total, count }));
      "`, { encoding: "utf-8", windowsHide: true }
    );
    const { total, count } = JSON.parse(files.trim());
    const baseline = Math.max(Math.round(total / 4), 1000);
    const codegraphTokens = Math.round(baseline * 0.1) + 2000;
    log(`Project: ${count} files, ${(total / 1024 / 1024).toFixed(1)} MB`, "ok");
    log(`Estimated token savings: ${baseline - codegraphTokens} (${Math.round((baseline - codegraphTokens) / baseline * 100)}%)`, "ok");
  } catch {
    log("Could not calculate token stats", "warn");
  }
}

function installProjectRules(source, project, lang) {
  try {
    execSync(`node "${path.join(ROOT, "scripts", "install-tasks.js")}" install-rules "${source}" "${project}" "${lang}"`, { stdio: "inherit", windowsHide: true });
  } catch {
    log("Node.js required for project rules", "err");
  }
}

function generateAgents(source) {
  const agentsDir = path.join(require("os").homedir(), ".config", "opencode", "agents");
  fs.mkdirSync(agentsDir, { recursive: true });
  try {
    execSync(`node "${path.join(ROOT, "scripts", "install-tasks.js")}" generate-agents "${source}" "${agentsDir}"`, { stdio: "inherit", windowsHide: true });
    log("Agents generated", "ok");
  } catch {
    log("Node.js required for agent generation", "err");
  }
}

function main() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--target" && args[i + 1]) opts.target = args[++i];
    else if (args[i] === "--project" && args[i + 1]) opts.project = args[++i];
    else if (args[i] === "--language" && args[i + 1]) opts.language = args[++i];
    else if (args[i] === "--profile" && args[i + 1]) opts.profile = args[++i];
    else if (args[i] === "--install-codegraph") opts.installCodeGraph = true;
    else if (args[i] === "--generate-codex") opts.generateCodex = true;
    else if (args[i] === "--platform" && args[i + 1]) opts.platform = args[++i];
    else if (args[i] === "--deps-only") opts.depsOnly = true;
    else if (args[i] === "--help" || args[i] === "-h") { printHelp(); return; }
  }

  console.log("\n=== SkillGrid Installer Core ===\n");

  if (opts.depsOnly) { checkDependencies(); return; }

  checkDependencies();

  if (opts.project) {
    setupGitIgnores(path.resolve(opts.project));
    setupProjectCodeGraph(opts.project);
    installProjectRules(ROOT, opts.project, opts.language || "");
    calcTokens(opts.project);
    return;
  }

  if (opts.target) {
    installSkills(opts.target, ROOT, opts.platform, opts.profile);
    return;
  }

  const platforms = detectPlatforms();
  if (platforms.length === 0) {
    const fallback = path.join(require("os").homedir(), ".skillgrid");
    log(`No platform detected. Installing to: ${fallback}`, "warn");
    installSkills(fallback, ROOT, "", opts.profile);
    return;
  }

  installCodeGraph(opts.installCodeGraph);

  for (const p of platforms) {
    log(`Detected: ${p.name} -> ${p.path}`, "ok");
    installSkills(p.path, ROOT, p.name, opts.profile);
  }

  if (platforms.some(p => p.name === "opencode")) {
    generateAgents(ROOT);
  }
}

function printHelp() {
  console.log(`
SkillGrid Installer Core
========================
Usage:
  node scripts/install-core.js                         Auto-detect & install
  node scripts/install-core.js --target <dir>           Install to custom path
  node scripts/install-core.js --project <dir>          Setup CodeGraph + project rules
  node scripts/install-core.js --project <dir> --language php
  node scripts/install-core.js --profile minimal        Install by profile
  node scripts/install-core.js --platform opencode      Override platform detection
  node scripts/install-core.js --deps-only              Check dependencies only
  node scripts/install-core.js --install-codegraph      Auto-install CodeGraph
`);
}

if (require.main === module) { main(); }

module.exports = {
  DEPENDENCIES, CODE_IGNORES,
  parseFrontmatter, normalizePlatform, loadProfileSkills,
  detectPlatforms, checkDependencies, setupGitIgnores,
  installSkills, installCore: main,
};
