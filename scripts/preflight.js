#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, cwd) {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

const root = run('git rev-parse --show-toplevel');
if (!root) {
  console.log('preflight: entorno=desconocido | sin repo | NO-GO');
  process.exit(1);
}

const rules = [];
for (const rel of ['.gitignore', path.join('.git', 'info', 'exclude')]) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const rule = line.trim();
    if (rule && !rule.startsWith('#')) rules.push(rule);
  }
}

const prodSignals = ['.env.production', 'docker-compose.prod.yml', 'fly.toml', 'Procfile']
  .filter((f) => fs.existsSync(path.join(root, f)));

const hooks = run('git config core.hooksPath', root) || '(sin hooks)';
const status = run('git status --porcelain', root) || '';
const untracked = status.split('\n').filter((l) => l.startsWith('??')).length;
const drift = (run('git ls-files -ci --exclude-standard', root) || '').split('\n').filter(Boolean).length;

const entorno = prodSignals.length ? 'prod?' : 'dev';
const ok = !prodSignals.length && drift === 0;
const verdict = ok ? 'GO' : 'REVISAR';

console.log(
  `preflight: entorno=${entorno} | ignore=${rules.length} reglas | drift=${drift} | untracked=${untracked} | hooks=${hooks} | ${verdict}`
);
process.exit(ok ? 0 : 1);
