const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'check-evolution.js');
const TEMP = [];

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function correr(contenido) {
  let args = [SCRIPT];
  if (contenido !== undefined) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ev-test-'));
    TEMP.push(dir);
    const file = path.join(dir, 'EVOLUCION.md');
    fs.writeFileSync(file, contenido);
    args = [SCRIPT, file];
  }
  return spawnSync(process.execPath, args, { encoding: 'utf8' });
}

const VALIDA = [
  '# Evolución',
  '',
  '## Abiertas',
  '',
  '- E2 | supply-chain | el instalador cae a main si falta el tag | P0 | 2026-10-01 | remote-install.sh:31',
  '',
  '## Cerradas',
  '',
  '- E1 | calidad | pin-check solo en CI | P1 | 2026-10-01 | ci.yml:26 | cerrado 2026-10-01 | package.json:41',
  '',
].join('\n');

console.log('\nTesting check-evolution.js...\n');

test('EVOLUCION.md del repo está bien formado', () => {
  const r = correr();
  check(r.status === 0, `exit ${r.status}: ${(r.stderr || '').trim()}`);
});

test('una fila corta (campos de menos) hace fallar', () => {
  const rota = VALIDA.replace('- E2 | supply-chain | el instalador cae a main si falta el tag | P0 | 2026-10-01 | remote-install.sh:31', '- E2 | supply-chain | cortada | P0 | 2026-10-01');
  const r = correr(rota);
  check(r.status === 1, `esperaba exit 1 y salió ${r.status}`);
  check(r.stderr.includes('campos esperados'), `mensaje raro: ${r.stderr.trim()}`);
});

test('cerrar sin evidencia verificable hace fallar', () => {
  const floja = VALIDA.replace('cerrado 2026-10-01 | package.json:41', 'cerrado 2026-10-01 | quedo arreglado');
  const r = correr(floja);
  check(r.status === 1, `esperaba exit 1 y salió ${r.status}`);
  check(r.stderr.includes('cierre sin evidencia'), `mensaje raro: ${r.stderr.trim()}`);
});

test('un id repetido hace fallar', () => {
  const dup = VALIDA.replace('## Cerradas', '- E2 | docs | repetida | P1 | 2026-10-01 | README.md:6\n\n## Cerradas');
  const r = correr(dup);
  check(r.status === 1, `esperaba exit 1 y salió ${r.status}`);
  check(r.stderr.includes('repetido'), `mensaje raro: ${r.stderr.trim()}`);
});

TEMP.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }));

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
