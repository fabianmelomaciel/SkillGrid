const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { armarEstado, ultimaMemoria, filasAbiertas } = require(path.join(__dirname, '..', 'scripts', 'session-state.js'));

const ROOT = path.join(__dirname, '..');
const TEMP = [];

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function carpeta() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ss-test-'));
  TEMP.push(dir);
  return dir;
}

const CODEX = [
  '# CODEX', '',
  '## 💻 Mission Logs & Tactical Learnings', '',
  '- 2026-10-17 - consejo viejo - detalle',
  '- 2026-11-05 - cierre normal — lo último que se hizo',
  '',
  '## Deliberaciones', '',
  '- 2026-10-18 | fila vieja | 1o A | x.js:1 | estado: resuelto',
  '',
].join('\n');

const EVOLUCION = [
  '# Evolución', '',
  '## Abiertas', '',
  '- E1 | docs | fila abierta | P1 | 2026-10-01 | README.md:6',
  '- E2 | ux | otra abierta | P2 | 2026-10-02 | y:2',
  '',
  '## Cerradas', '',
].join('\n');

console.log('\nTesting session-state...\n');

test('la última memoria es la de fecha más nueva, no la última del archivo', () => {
  const linea = ultimaMemoria(CODEX);
  check(linea.includes('cierre normal'), `trajo ${linea}`);
  check(!linea.includes('fila vieja'), 'se quedó con la deliberación vieja');
});

test('las abiertas del ledger salen sin el preámbulo', () => {
  const filas = filasAbiertas(EVOLUCION);
  check(filas.length === 2, `trajo ${filas.length}`);
  check(filas[0].includes('E1'), 'falta E1');
});

test('el estado resume rama, abiertas, memoria y plan abierto', () => {
  const raiz = carpeta();
  fs.writeFileSync(path.join(raiz, 'CODEX.md'), CODEX);
  fs.writeFileSync(path.join(raiz, 'EVOLUCION.md'), EVOLUCION);
  const plans = path.join(raiz, 'docs', 'SkillGrid', 'plans');
  fs.mkdirSync(plans, { recursive: true });
  fs.writeFileSync(path.join(plans, '2026-11-06-viaje.md'), '# Plan\n\n- [ ] arrancar\n- [x] listo\n');

  const texto = armarEstado(raiz);
  check(texto.includes('sin repo git'), 'no avisó que no hay repo');
  check(texto.includes('EVOLUCION abiertas: 2'), 'no contó las abiertas');
  check(texto.includes('cierre normal'), 'no trajo la última memoria');
  check(texto.includes('2026-11-06-viaje.md'), 'no vio el plan abierto');
});

test('el CLI corre y sale 0 aunque no haya nada', () => {
  const raiz = carpeta();
  const salida = execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'session-state.js')], {
    cwd: raiz,
    encoding: 'utf8',
  });
  check(salida.includes('rama:'), 'no imprimió el estado');
});

test('el script es dev-only: viaja fuera del paquete npm', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  check((pkg.files || []).includes('!scripts/session-state.js'), 'falta la negación !scripts/session-state.js en files');
});

test('el test está cableado en npm test y en el gate', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  check((pkg.scripts.test || '').includes('session-state.test.js'), 'no está en npm test');
  check((pkg.scripts.gate || '').includes('session-state.test.js'), 'no está en el gate');
});

TEMP.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }));

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
