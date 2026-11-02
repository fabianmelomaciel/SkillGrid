const fs = require('fs');
const path = require('path');
const { extraerAgregados, filtrarCitas, armarSeccion } = require(path.join(__dirname, '..', 'scripts', 'headroom-learn-sync.js'));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

const DIFF = [
  'diff --git a/AGENTS.md b/AGENTS.md',
  '--- a/AGENTS.md',
  '+++ b/AGENTS.md',
  '## vendaje',
  '+Antes de depurar, abrí el log del servidor y confirmá el error real.',
  '+',
  '',
].join('\n');

console.log('\nTesting headroom-learn-sync...\n');

test('extraerAgregados saca lo agregado y saltea cabeceras y contexto', () => {
  const agregados = extraerAgregados(DIFF);
  check(agregados.length === 1, `esperaba 1 y trajo ${agregados.length}: ${JSON.stringify(agregados)}`);
  check(agregados[0].includes('log del servidor'), `línea equivocada: ${agregados[0]}`);
});

test('lo vacío y lo comentado no llega a ser propuesta', () => {
  const agregados = extraerAgregados('+ \n+++ nada\n+<!-- comentario -->\n');
  check(agregados.length === 0, `debe quedar 0 y hay ${agregados.length}`);
});

test('lo que ya está citado en el ledger no se propone otra vez', () => {
  const finales = filtrarCitas(['regla A concreta', 'otra regla B'], 'ledger ... regla A concreta ...');
  check(finales.length === 1 && finales[0] === 'otra regla B', `quedó ${JSON.stringify(finales)}`);
});

test('armarSeccion queda vacío sin agregados', () => {
  check(armarSeccion([], 'AGENTS.md') === '', 'no debía armar sección');
});

test('el script es dev-only: viaja fuera del paquete npm', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  check((pkg.files || []).includes('!scripts/headroom-learn-sync.js'), 'falta la negación !scripts/headroom-learn-sync.js en files');
});

test('el test está cableado en npm test y en el gate', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  check((pkg.scripts.test || '').includes('headroom-learn-sync.test.js'), 'no está en npm test');
  check((pkg.scripts.gate || '').includes('headroom-learn-sync.test.js'), 'no está en el gate');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
