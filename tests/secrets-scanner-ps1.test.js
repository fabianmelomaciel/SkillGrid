const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SCANNER = path.join(ROOT, 'skills', 'auditor-de-seguridad', 'scanners', 'secrets-scanner.ps1');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

// Busca un intérprete de PowerShell (pwsh en CI, powershell en Windows).
function psBin() {
  for (const bin of ['pwsh', 'powershell']) {
    const r = spawnSync(bin, ['-NoProfile', '-Command', 'exit 0'], { encoding: 'utf8' });
    if (r.status === 0) return bin;
  }
  return null;
}

function correr(bin, dir) {
  const res = spawnSync(bin, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', SCANNER, '-ProjectPath', dir], { encoding: 'utf8' });
  check(res.status === 0, `el scanner salió ${res.status}: ${(res.stderr || '').slice(0, 200)}`);
  const out = (res.stdout || '').trim();
  if (!out) return [];
  const parsed = JSON.parse(out);
  return Array.isArray(parsed) ? parsed : [parsed];
}

function enTemp(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'secps-'));
  try { return fn(dir); }
  finally { try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* temp ya borrado */ } }
}

const ps = psBin();

console.log('\nTesting secrets-scanner.ps1...\n');

test('el scanner declara los prefijos modernos (E40)', () => {
  const txt = fs.readFileSync(SCANNER, 'utf8');
  for (const frag of ['glpat-', 'npm_', 'sk-proj-', 'sk-ant-', 'rk_live_', 'ghu_', 'ghs_', 'github_pat_', 'dckr_pat_']) {
    check(txt.includes(frag), `falta el patrón ${frag}`);
  }
});

if (ps) {
  test('detecta glpat- y sk-proj- al correrlo', () => {
    enTemp((dir) => {
      // Armados por concatenación: pegados, el pre-commit los bloquearía.
      fs.writeFileSync(path.join(dir, 'sample.txt'), `token=glpat-${'A'.repeat(20)}\nclave=sk-proj-${'B'.repeat(20)}\n`);
      const tipos = correr(ps, dir).map((h) => String(h.finding || ''));
      check(tipos.some((t) => /GitLab/i.test(t)), `no detectó glpat-: ${JSON.stringify(tipos)}`);
      check(tipos.some((t) => /OpenAI/i.test(t)), `no detectó sk-proj-: ${JSON.stringify(tipos)}`);
    });
  });

  test('un archivo limpio no dispara nada', () => {
    enTemp((dir) => {
      fs.writeFileSync(path.join(dir, 'sample.txt'), 'const total = a + b;\n');
      const hallazgos = correr(ps, dir);
      check(hallazgos.length === 0, `esperaba 0 hallazgos, salieron ${hallazgos.length}`);
    });
  });
} else {
  console.log('  (sin PowerShell en el sistema: se omiten los tests de ejecución)');
}

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
