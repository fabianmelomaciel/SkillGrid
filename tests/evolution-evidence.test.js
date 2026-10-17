const fs = require('fs');
const path = require('path');

// Cruza la evidencia de cierre de EVOLUCION.md contra el disco. Hasta ahora
// check-evolution.js sólo validaba la forma (`algo:un-número`), así que una
// cita inventada pasaba el gate igual. Acá se exige que el archivo exista y
// que la línea caiga adentro. Si el ledger miente, esto lo caza.
const ROOT = path.join(__dirname, '..');
const LEDGER = path.join(ROOT, 'EVOLUCION.md');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function totalDeLineas(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8').split(/\r?\n/).length;
}

// El campo de cierre puede traer varios `archivo:línea` separados por coma y
// prosa entre paréntesis (p. ej. "ci.yml:35 (el job se separó)"). La prosa se
// descarta: adentro de los paréntesis puede haber `:` que no son citas.
function tokens(evidencia) {
  return evidencia
    .replace(/\([^)]*\)/g, ' ')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// Devuelve los problemas de un campo de evidencia de cierre.
function problemasDeEvidencia(evidencia) {
  const fallas = [];
  for (const tok of tokens(evidencia)) {
    const cita = tok.match(/^([^\s:]+):(\d+)$/);
    if (cita) {
      const [, rel, nro] = cita;
      if (!fs.existsSync(path.join(ROOT, rel))) { fallas.push(`${rel}:${nro} — el archivo no existe`); continue; }
      const total = totalDeLineas(rel);
      if (Number(nro) < 1 || Number(nro) > total) fallas.push(`${rel}:${nro} — fuera de rango (el archivo tiene ${total} líneas)`);
      continue;
    }
    // Referencia suelta a un test (`tests/loquesea.test.js`) sin línea.
    const suelto = tok.match(/^(tests\/[^\s]+\.js)$/);
    if (suelto) {
      if (!fs.existsSync(path.join(ROOT, suelto[1]))) fallas.push(`${suelto[1]} — el test citado no existe`);
      continue;
    }
    if (/test/i.test(tok)) continue; // "test" a secas: no hay más para verificar
    fallas.push(`"${tok}" — no es ni archivo:línea ni una referencia a un test`);
  }
  return fallas;
}

// Filas crudas de una sección (## Abiertas / ## Cerradas), salteando archivadas.
function filasDe(seccion) {
  const lineas = fs.readFileSync(LEDGER, 'utf8').split(/\r?\n/);
  let actual = '';
  const out = [];
  lineas.forEach((linea, i) => {
    const h = linea.match(/^##\s+(.+)$/);
    if (h) { actual = h[1].trim(); return; }
    if (actual !== seccion || !linea.startsWith('- ') || linea.includes('| archivadas')) return;
    out.push({ n: i + 1, campos: linea.slice(2).split('|').map((c) => c.trim()) });
  });
  return out;
}

console.log('\nTesting evolution-evidence...\n');

test('cada evidencia de cierre de ## Cerradas existe de verdad', () => {
  const fallas = [];
  for (const { n, campos } of filasDe('Cerradas')) {
    if (campos.length < 8) { fallas.push(`L${n}: fila cerrada con ${campos.length} campos`); continue; }
    for (const f of problemasDeEvidencia(campos[7])) fallas.push(`L${n}: ${f}`);
  }
  check(fallas.length === 0, 'evidencia de cierre rota:\n    ' + fallas.join('\n    '));
});

test('una cita a un archivo inexistente se detecta', () => {
  const fallas = problemasDeEvidencia('no/existe.md:3');
  check(fallas.length === 1 && /no existe/.test(fallas[0]), `esperaba el problema, salió: ${JSON.stringify(fallas)}`);
});

test('una línea fuera del archivo se detecta', () => {
  const fallas = problemasDeEvidencia('package.json:99999');
  check(fallas.some((f) => /fuera de rango/.test(f)), `esperaba fuera de rango, salió: ${JSON.stringify(fallas)}`);
});

test('los archivo:línea separados por coma se validan todos', () => {
  const fallas = problemasDeEvidencia('package.json:1, no/existe.md:2');
  check(fallas.length === 1 && /no\/existe\.md/.test(fallas[0]), `esperaba 1 falla (la segunda), salió: ${JSON.stringify(fallas)}`);
});

test('la prosa entre paréntesis no se toma como cita', () => {
  const fallas = problemasDeEvidencia('package.json:1 (prune: true es el único cambio real)');
  check(fallas.length === 0, `no debía fallar, salió: ${JSON.stringify(fallas)}`);
});

test('una referencia suelta a un test se valida si no existe', () => {
  const rota = problemasDeEvidencia('tests/no-existe.test.js');
  check(rota.length === 1 && /no existe/.test(rota[0]), `esperaba la falta, salió: ${JSON.stringify(rota)}`);
  const ok = problemasDeEvidencia('tests/check-evolution.test.js');
  check(ok.length === 0, `el test real no debía fallar: ${JSON.stringify(ok)}`);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
