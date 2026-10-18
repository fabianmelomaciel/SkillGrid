const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const loop = require('../scripts/evolve.js');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'evolve.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\nTesting evolve-loop...\n');

test('evaluarGuardas frena lo prohibido y deja pasar lo normal', () => {
  const ok = loop.evaluarGuardas(['scripts/evolve.js', 'EVOLUCION.md', 'skills/x/SKILL.md']);
  check(ok.ok, 'lo normal no debería violar');
  const mal = loop.evaluarGuardas(['scripts/x.js', '.env']);
  check(!mal.ok, '.env debería violar');
  check(/\.env/.test(mal.violaciones[0].archivo), 'la violación debería apuntar al .env');
});

test('evaluarGuardas respeta la allowlist', () => {
  const r = loop.evaluarGuardas(['scripts/evolve.js', 'skills/x/SKILL.md'], ['scripts']);
  check(!r.ok && r.violaciones.length === 1, 'skills/ debería quedar fuera');
  check(/fuera de la allowlist/.test(r.violaciones[0].motivo), `motivo inesperado: ${r.violaciones[0].motivo}`);
});

test('armarInforme muestra candidatas, ledger, guardas y borrador', () => {
  const txt = loop.armarInforme({
    base: 'aaaa1111', head: 'bbbb2222', commits: ['abc x', 'def y'],
    filas: [{ seccion: 'Abiertas', id: 'E99' }, { seccion: 'Cerradas', id: 'E1' }],
    cands: [{ archivo: 'scripts/ralph-loop.sh', puntos: 7, motivos: ['zona sensible'] }],
    ledger: { ok: true, salida: '' },
    guardas: { ok: true, violaciones: [] },
    borrador: 'scratch/evolucion-candidatas.md',
  });
  check(/# Ciclo de evolución/.test(txt), 'falta el título');
  check(/2 commit\(s\) \| abiertas: 1 \| candidatas: 1/.test(txt), 'falta el resumen del delta');
  check(/\[7\] scripts\/ralph-loop\.sh/.test(txt), 'falta la candidata priorizada');
  check(/## Ledger: OK/.test(txt), 'falta el estado del ledger');
  check(/## Guardas: OK/.test(txt), 'falta el estado de las guardas');
  check(/scratch\/evolucion-candidatas\.md/.test(txt), 'falta el path del borrador');
});

test('armarInforme grita cuando el ledger está roto o hay violaciones', () => {
  const txt = loop.armarInforme({
    base: '', head: '', commits: [], filas: [], cands: [],
    ledger: { ok: false, salida: 'fila sin evidencia' },
    guardas: { ok: false, violaciones: [{ archivo: '.env', motivo: 'toca ".env"' }] },
    borrador: 'scratch/x.md',
  });
  check(/## Ledger: ROTO/.test(txt), 'no marcó el ledger roto');
  check(/fila sin evidencia/.test(txt), 'no mostró la salida del ledger');
  check(/## Guardas: 1 violación\(es\)/.test(txt), 'no contó la violación');
  check(/\.env: toca/.test(txt), 'no listó la violación');
});

test('el ciclo corre y arma el informe (no mergea nada)', () => {
  let salida = '';
  try { salida = execFileSync(process.execPath, [SCRIPT], { encoding: 'utf8' }); }
  catch (e) { salida = `${e.stdout || ''}${e.stderr || ''}`; }
  check(/# Ciclo de evolución/.test(salida), `salida inesperada: ${salida.slice(0, 120)}`);
  check(/## Ledger:/.test(salida), 'falta la sección del ledger');
  check(/## Guardas:/.test(salida), 'falta la sección de guardas');
  check(/Borrador:/.test(salida), 'falta el path del borrador');
});

test('calcularMetricas cuenta abiertas por prioridad y la más vieja', () => {
  const filas = [
    { seccion: 'Abiertas', id: 'E1', prioridad: 'P1', fecha: '2026-10-01' },
    { seccion: 'Abiertas', id: 'E2', prioridad: 'P2', fecha: '2026-10-10' },
    { seccion: 'Abiertas', id: 'E3', prioridad: 'P2', fecha: '2026-10-12' },
    { seccion: 'Abiertas', id: 'E4', prioridad: '', fecha: '2026-10-12' },
    { seccion: 'Cerradas', id: 'E0', cierre: 'cerrado 2026-10-15' },
  ];
  const m = loop.calcularMetricas(filas, '2026-10-17');
  check(m.abiertas === 4, `abiertas mal: ${m.abiertas}`);
  check(m.porPrioridad.P2 === 2 && m.porPrioridad['sin P'] === 1, `por prioridad mal: ${JSON.stringify(m.porPrioridad)}`);
  check(m.masVieja.id === 'E1' && m.masVieja.dias === 16, `más vieja mal: ${JSON.stringify(m.masVieja)}`);
  check(m.cerradas === 1 && m.cerradasRecientes === 1, 'cerradas mal');
});

test('armarInforme muestra las métricas del ledger', () => {
  const txt = loop.armarInforme({
    base: 'aaaa1111', head: 'bbbb2222', commits: [], filas: [], cands: [],
    ledger: { ok: true }, guardas: { ok: true, violaciones: [] },
    borrador: 'scratch/x.md',
    metricas: loop.calcularMetricas([
      { seccion: 'Abiertas', id: 'E9', prioridad: 'P1', fecha: '2026-10-01' },
      { seccion: 'Cerradas', id: 'E0', cierre: 'cerrado 2026-10-16' },
    ], '2026-10-17'),
  });
  check(/## Métricas/.test(txt), 'falta la sección de métricas');
  check(/Abiertas: 1 \(P1: 1\)/.test(txt), 'faltan las abiertas por prioridad');
  check(/Más vieja: E9/.test(txt), 'falta la más vieja');
  check(/Cerradas: 1 — últimos 30 días: 1/.test(txt), 'faltan las cerradas');
});

// Modela la inclusión de npm: `scripts/` mete la carpeta, `!...` la saca de vuelta.
function publicado(rel, files) {
  let incluir = false;
  for (const entrada of files) {
    if (entrada.startsWith('!')) {
      if (entrada.slice(1).replace(/\/$/, '') === rel) incluir = false;
      continue;
    }
    const e = entrada.replace(/\/$/, '');
    if (e === rel || rel.startsWith(e + '/')) incluir = true;
  }
  return incluir;
}

test('evolve.js es dev-only: no viaja en el paquete ni en el instalador', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const files = pkg.files || [];
  check(!publicado('scripts/evolve.js', files), 'evolve.js se publicaría: el orquestador es del dev, no del usuario');
  check(publicado('scripts/check-evolution.js', files), 'sanity: un script hermano sí debería publicarse');
  const installer = fs.readFileSync(path.join(ROOT, 'scripts', 'install-core.js'), 'utf8');
  check(!installer.includes('evolve.js'), 'install-core.js copiaría el orquestador a los IDEs');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
