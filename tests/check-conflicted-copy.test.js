const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'check-conflicted-copy.js');
const HOOK = path.join(ROOT, '.githooks', 'pre-commit');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function correr(files) {
  return spawnSync(process.execPath, [SCRIPT, '--files', files.join('\n')], { encoding: 'utf8' });
}

console.log('\nTesting check-conflicted-copy...\n');

test('una copia conflicto stageada termina en exit 1', () => {
  const r = correr(['CHANGELOG(Conflicted copy 2026-10-31 from ASUS).md']);
  check(r.status === 1, `esperaba exit 1 y salió ${r.status}`);
  check(r.stderr.includes('snapshots viejos'), `mensaje raro: ${(r.stderr || '').trim()}`);
});

test('un nombre limpio sale en 0', () => {
  const r = correr(['README.md', 'skills/index.json']);
  check(r.status === 0, `esperaba exit 0 y salió ${r.status}: ${(r.stderr || '').trim()}`);
});

test('detecta el patrón sin importar mayúsculas ni host', () => {
  const r = correr(['notes(conflicted copy 2026-11-02 from CASA).txt']);
  check(r.status === 1, `esperaba exit 1 y salió ${r.status}`);
});

test('el hook invoca la guarda antes del escaneo de secretos', () => {
  const hook = fs.readFileSync(HOOK, 'utf8');
  check(hook.includes('scripts/check-conflicted-copy.js'), 'el pre-commit no llama a check-conflicted-copy.js');
});

test('la guarda está cableada en npm test y en el gate', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  check((pkg.scripts.test || '').includes('tests/check-conflicted-copy.test.js'), 'el test de la guarda no está en npm test');
  check((pkg.scripts.gate || '').includes('tests/check-conflicted-copy.test.js'), 'el test de la guarda no está en el gate');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
