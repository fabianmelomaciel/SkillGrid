const fs = require('fs');
const os = require('os');
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

test('la fila comprimida sigue citando lo que cerró', () => {
  // Al comprimir las cerradas viejas en una línea, el texto se pierde pero las
  // citas quedan: sin esto el escáner volvía a proponer lo ya resuelto.
  const texto = [
    '## Cerradas', '',
    '- E1..E3 | archivadas 2026-01-01 — viejo, scripts/malo.js:12, tests/x.test.js',
  ].join('\n');
  const filas = scan.filasDelLedger(texto);
  check(filas.length === 0, 'la archivada no es una fila');
  const citados = scan.archivosCitados(filas);
  check(citados.has('scripts/malo.js'), `no sacó la cita de la comprimida: ${[...citados].join(', ')}`);
  check(citados.has('tests/x.test.js'), 'no sacó el test citado en la comprimida');
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

test('buscarAtajos levanta los shortcut: y no revienta sin ellos', () => {
  // git grep sale con 1 cuando no hay hits: eso no es un error del escáner
  const conMarca = fs.mkdtempSync(path.join(os.tmpdir(), 'atajos-'));
  fs.writeFileSync(path.join(conMarca, 'nota.js'), '// shortcut: techo temporal, cuando llegue X\n');
  const hits = scan.buscarAtajos(conMarca);
  check(hits.length === 1, `esperaba 1 atajo, salieron ${hits.length}`);
  check(hits[0].archivo === 'nota.js' && hits[0].linea === '1', `parseo raro: ${JSON.stringify(hits[0])}`);
  check(/techo temporal/.test(hits[0].contenido), 'perdió el texto del atajo');

  const limpio = fs.mkdtempSync(path.join(os.tmpdir(), 'atajos-vacio-'));
  fs.writeFileSync(path.join(limpio, 'ok.js'), 'let a = 1;\n');
  check(scan.buscarAtajos(limpio).length === 0, 'sin hits debería devolver la lista vacía');
  fs.rmSync(conMarca, { recursive: true, force: true });
  fs.rmSync(limpio, { recursive: true, force: true });
});

test('mezclarAtajos suma la deuda nueva y saltea lo ya citado', () => {
  const cands = [{ archivo: 'scripts/viejo.js', puntos: 3, motivos: ['sin test'] }];
  const atajos = [
    { archivo: 'scripts/viejo.js', linea: '10', contenido: 'ya está en el ledger' },
    { archivo: 'skills/nueva/SKILL.md', linea: '4', contenido: 'atajo sin disparador' },
  ];
  const out = scan.mezclarAtajos(cands, atajos, new Set(['scripts/viejo.js']));
  check(out.length === 2, `esperaba 2 candidatas, salieron ${out.length}`);
  check(!out.some((c) => c.archivo === 'scripts/viejo.js:10'), 'entró un atajo de un archivo ya citado');
  check(out[0].archivo === 'skills/nueva/SKILL.md:4', 'la deuda nueva tendría que ir arriba por los 10 puntos');
  check(/deuda técnica/.test(out[0].motivos[0]), 'falta el motivo');
});

test('armarBorrador arma las secciones y no promete escribir el ledger', () => {
  const txt = scan.armarBorrador({
    fecha: '2026-01-01', base: 'aaaa1111', head: 'bbbb2222',
    commits: ['abc un commit'],
    delta: ['skills/router/SKILL.md', 'node_modules/x.js'],
    filas: [{ seccion: 'Abiertas', id: 'E99', categoria: 'ux', mejora: 'algo' }],
    cands: [{ archivo: 'skills/router/SKILL.md', puntos: 2, motivos: ['sin test que lo cite'] }],
  });
  check(/Candidatas de evolución/.test(txt), 'falta el título');
  check(/skills\/router\/SKILL\.md/.test(txt), 'falta el archivo del delta');
  check(!/node_modules/.test(txt), 'el ruido no debería aparecer');
  check(/E99/.test(txt), 'falta la fila abierta');
  check(/a mano/.test(txt), 'debería aclarar que se registra a mano');
  check(/\[2\] skills\/router\/SKILL\.md/.test(txt), 'no muestra el puntaje de la candidata');
});

test('esZonaSensible marca CI, scripts y hooks', () => {
  check(scan.esZonaSensible('.github/workflows/ci.yml'), 'ci debería ser sensible');
  check(scan.esZonaSensible('scripts/install-core.js'), 'scripts debería ser sensible');
  check(scan.esZonaSensible('.githooks/pre-commit'), 'hooks debería ser sensible');
  check(!scan.esZonaSensible('skills/router/SKILL.md'), 'una skill no es zona sensible');
});

test('viajaEnPaquete modela la inclusión de npm con negación', () => {
  const files = ['skills/', 'scripts/', '!scripts/evolve-scan.js'];
  check(scan.viajaEnPaquete('scripts/check-evolution.js', files), 'un script hermano debería viajar');
  check(!scan.viajaEnPaquete('scripts/evolve-scan.js', files), 'el negado no debería viajar');
  check(!scan.viajaEnPaquete('docs/x.md', ['skills/']), 'fuera de las entradas no viaja');
});

test('puntuarCandidato suma señales y explica', () => {
  const r = scan.puntuarCandidato('scripts/evolve-scan.js', { enPaquete: true, tieneTest: false });
  check(r.puntos === 7, `esperaba 7 (3 sensible + 2 paquete + 2 sin test), salió ${r.puntos}`);
  check(r.motivos.length === 3, `esperaba 3 motivos, salieron ${r.motivos.length}`);
  const r2 = scan.puntuarCandidato('skills/x/SKILL.md', { enPaquete: false, tieneTest: true });
  check(r2.puntos === 0, `esperaba 0, salió ${r2.puntos}`);
});

test('priorizarCandidatos ordena por puntaje y desempata por nombre', () => {
  const ctx = { enPaquete: () => false, tieneTest: () => false };
  const orden = scan.priorizarCandidatos(['skills/z.md', '.github/a.yml', 'skills/a.md'], ctx);
  check(orden[0].archivo === '.github/a.yml', `primero debería ser el sensible, fue ${orden[0].archivo}`);
  check(orden[1].archivo === 'skills/a.md' && orden[2].archivo === 'skills/z.md', 'el desempate por nombre falló');
});

test('el script corre y sale 0 (--stdout, sin efectos)', () => {
  const salida = execFileSync(process.execPath, [SCRIPT, '--stdout'], { encoding: 'utf8' });
  check(/Candidatas de evolución/.test(salida), `salida inesperada: ${salida.slice(0, 120)}`);
  check(/## Abiertas/.test(salida), 'faltan las abiertas');
});

test('la cobertura mira tests/ y scripts/, no sólo tests/', () => {
  // Los checkers del gate viven en scripts/: remote-install.ps1 lo cubre
  // check-remote-install-pin.js y el escáner lo reportaba como hueco.
  const ctx = scan.armarContexto();
  check(ctx.tieneTest('remote-install.ps1'), 'remote-install.ps1 está cubierto por scripts/check-remote-install-pin.js');
  check(ctx.tieneTest('scripts/install-core.js'), 'install-core.js tiene su test');
  // el nombre se arma por partes: escrito entero, el basename aparecería en el
  // propio test —que es parte del corpus— y la señal lo daría por cubierto
  const relleno = 'z'.repeat(7);
  const nombre = `${relleno}.md`;
  check(!ctx.tieneTest(`skills/lo-que-no-existe/${nombre}`), 'un archivo sin cubrir no debería contar como cubierto');
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
