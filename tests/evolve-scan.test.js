const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const scan = require('../scripts/evolve-scan.js');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'evolve-scan.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\nTesting evolve-scan...\n');

test('esRuido descarta lo generado y deja el código', () => {
  check(scan.esRuido('node_modules/x/index.js'), 'node_modules debería ser ruido');
  check(scan.esRuido('graphify-out/graph.json'), 'graphify-out debería ser ruido');
  check(scan.esRuido('scratch/borrador.md'), 'scratch debería ser ruido');
  check(!scan.esRuido('scripts/evolve-scan.js'), 'un script no es ruido');
  check(!scan.esRuido('skills/router/SKILL.md'), 'una skill no es ruido');
});

test('areaDe clasifica por carpeta', () => {
  check(scan.areaDe('skills/router/SKILL.md') === 'skills', 'skills mal');
  check(scan.areaDe('scripts/evolve-scan.js') === 'scripts', 'scripts mal');
  check(scan.areaDe('tests/evolve-scan.test.js') === 'tests', 'tests mal');
  check(scan.areaDe('.github/workflows/ci.yml') === 'ci', 'ci mal');
  check(scan.areaDe('algo.raro') === 'otro', 'otro mal');
});

test('filasDelLedger lee abiertas y cerradas y saltea archivadas', () => {
  const texto = [
    '# Evolución', '',
    '## Abiertas', '',
    '- E99 | ux | algo abierto | P2 | 2026-01-01 | a/b.js:1', '',
    '## Cerradas', '',
    '- E1..E3 | archivadas 2026-01-01 — viejo',
    '- E98 | ci | algo cerrado | P2 | 2026-01-01 | a/b.js:2 | cerrado 2026-01-02 | a/b.js:3',
  ].join('\n');
  const filas = scan.filasDelLedger(texto);
  check(filas.length === 2, `esperaba 2 filas, salieron ${filas.length}`);
  check(filas[0].seccion === 'Abiertas' && filas[0].id === 'E99', 'la abierta mal');
  check(filas[1].seccion === 'Cerradas' && filas[1].evidenciaCierre === 'a/b.js:3', 'la cerrada mal');
});

test('archivosCitados saca archivo:línea, test suelto y rutas con punto inicial', () => {
  const filas = [
    { evidencia: 'scripts/install-tasks.js:146', evidenciaCierre: '' },
    { evidencia: '', evidenciaCierre: 'tests/x.test.js, .opencode/plugins/session-memory.js:99' },
  ];
  const citados = scan.archivosCitados(filas);
  check(citados.has('scripts/install-tasks.js'), 'no sacó el archivo con línea');
  check(citados.has('tests/x.test.js'), 'no sacó el test suelto');
  check(citados.has('.opencode/plugins/session-memory.js'), 'no sacó la ruta con punto inicial');
});

test('candidatos descarta lo citado y el ruido', () => {
  const archivos = ['scripts/evolve-scan.js', 'scripts/install-tasks.js', 'node_modules/x.js'];
  const cands = scan.candidatos(archivos, new Set(['scripts/install-tasks.js']));
  check(cands.length === 1 && cands[0] === 'scripts/evolve-scan.js', `salió ${JSON.stringify(cands)}`);
});

test('armarBorrador arma las secciones y no promete escribir el ledger', () => {
  const txt = scan.armarBorrador({
    fecha: '2026-01-01', base: 'aaaa1111', head: 'bbbb2222',
    commits: ['abc un commit'],
    delta: ['skills/router/SKILL.md', 'node_modules/x.js'],
    filas: [{ seccion: 'Abiertas', id: 'E99', categoria: 'ux', mejora: 'algo' }],
    cands: ['skills/router/SKILL.md'],
  });
  check(/Candidatas de evolución/.test(txt), 'falta el título');
  check(/skills\/router\/SKILL\.md/.test(txt), 'falta el archivo del delta');
  check(!/node_modules/.test(txt), 'el ruido no debería aparecer');
  check(/E99/.test(txt), 'falta la fila abierta');
  check(/a mano/.test(txt), 'debería aclarar que se registra a mano');
});

test('el script corre y sale 0 (--stdout, sin efectos)', () => {
  const salida = execFileSync(process.execPath, [SCRIPT, '--stdout'], { encoding: 'utf8' });
  check(/Candidatas de evolución/.test(salida), `salida inesperada: ${salida.slice(0, 120)}`);
  check(/## Abiertas/.test(salida), 'faltan las abiertas');
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

test('evolve-scan.js es dev-only: no viaja en el paquete ni en el instalador', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const files = pkg.files || [];
  check(!publicado('scripts/evolve-scan.js', files), 'evolve-scan.js se publicaría: el escáner es del dev, no del usuario');
  check(publicado('scripts/check-evolution.js', files), 'sanity: un script hermano sí debería publicarse');
  const installer = fs.readFileSync(path.join(ROOT, 'scripts', 'install-core.js'), 'utf8');
  check(!installer.includes('evolve-scan'), 'install-core.js copiaría el escáner a los IDEs');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
