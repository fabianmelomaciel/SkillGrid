#!/usr/bin/env node
// Escáner de evolución. Junta lo que se movió desde el último ciclo y lo deja
// como borrador para priorizar: propone, no registra — nunca escribe
// EVOLUCION.md. El ancla vive en .opencode/state/ y el borrador en scratch/,
// los dos fuera del repo. Es herramienta de dev, no viaja en el paquete.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const LEDGER = path.join(ROOT, 'EVOLUCION.md');
const WATERMARK = path.join(ROOT, '.opencode', 'state', 'evolve-watermark');
const DRAFT = path.join(ROOT, 'scratch', 'evolucion-candidatas.md');

// Lo que ensucia el delta: artefactos generados y estado local.
const RUIDO = [
  /^node_modules\//, /^graphify-out\//, /^scratch\//, /^\.opencode\/state\//,
  /^\.codegraph\//, /^test-results\//, /^\.storage\//, /^\.auth\//,
  /^package-lock\.json$/, /^CHANGELOG\.md$/,
];

const AREAS = [
  [/^skills\//, 'skills'],
  [/^scripts\//, 'scripts'],
  [/^tests\//, 'tests'],
  [/^\.github\//, 'ci'],
  [/^rules\//, 'rules'],
  [/^commands\//, 'commands'],
  [/^docs\//, 'docs'],
  [/^\.opencode\//, 'dev'],
];

// Archivo, con o sin `:línea`, o test suelto. Admite rutas que arrancan con punto.
const RX_ARCHIVO = /\.?[A-Za-z0-9_][A-Za-z0-9_./-]*\.[A-Za-z0-9]+/g;

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: ROOT, encoding: 'utf8', windowsHide: true }).trim();
  } catch {
    return '';
  }
}

function esRuido(archivo) {
  return RUIDO.some((rx) => rx.test(archivo));
}

function areaDe(archivo) {
  for (const [rx, area] of AREAS) if (rx.test(archivo)) return area;
  return 'otro';
}

// Filas de Abiertas y Cerradas. Las archivadas quedan afuera: ya perdieron el texto.
function filasDelLedger(texto) {
  const filas = [];
  let seccion = '';
  for (const linea of texto.split(/\r?\n/)) {
    const h = linea.match(/^##\s+(.+)$/);
    if (h) { seccion = h[1].trim(); continue; }
    if (seccion !== 'Abiertas' && seccion !== 'Cerradas') continue;
    if (!linea.startsWith('- ') || linea.includes('| archivadas')) continue;
    const c = linea.slice(2).split('|').map((x) => x.trim());
    filas.push({
      seccion,
      id: c[0],
      categoria: c[1],
      mejora: c[2],
      evidencia: c[5] || '',
      evidenciaCierre: c[7] || '',
    });
  }
  return filas;
}

// Archivos que alguna fila ya cita como evidencia (hallazgo o cierre).
function archivosCitados(filas) {
  const citados = new Set();
  for (const fila of filas) {
    for (const campo of [fila.evidencia, fila.evidenciaCierre]) {
      for (const m of campo.matchAll(RX_ARCHIVO)) citados.add(m[0]);
    }
  }
  return citados;
}

function candidatos(archivos, citados) {
  return archivos.filter((a) => !esRuido(a) && !citados.has(a));
}

// F2: priorizar barato y explicable — nada de magia ni de tokens. Tres señales:
// si la zona es sensible (CI, scripts, hooks, instalación), si el archivo viaja
// en el paquete npm, y si ningún test lo cita.
const ZONAS_SENSIBLES = [
  /^\.github\//, /^\.githooks\//, /^scripts\//, /^\.opencode\//,
  /(^|\/)(install|remote-install|pre-commit|post-commit|audit)\.(sh|ps1|js)$/i,
];

function esZonaSensible(archivo) {
  return ZONAS_SENSIBLES.some((rx) => rx.test(archivo));
}

// Igual que npm: una entrada `carpeta/` incluye, `!ruta` la saca de vuelta.
function viajaEnPaquete(rel, files) {
  let incluir = false;
  for (const entrada of files || []) {
    if (entrada.startsWith('!')) {
      if (entrada.slice(1).replace(/\/$/, '') === rel) incluir = false;
      continue;
    }
    const e = entrada.replace(/\/$/, '');
    if (e === rel || rel.startsWith(e + '/')) incluir = true;
  }
  return incluir;
}

function puntuarCandidato(archivo, senales) {
  const motivos = [];
  let puntos = 0;
  if (esZonaSensible(archivo)) { puntos += 3; motivos.push('zona sensible'); }
  if (senales.enPaquete) { puntos += 2; motivos.push('va en el paquete npm'); }
  if (!senales.tieneTest) { puntos += 2; motivos.push('sin test que lo cite'); }
  return { archivo, puntos, motivos };
}

function priorizarCandidatos(archivos, contexto) {
  return archivos
    .map((a) => puntuarCandidato(a, { enPaquete: contexto.enPaquete(a), tieneTest: contexto.tieneTest(a) }))
    .sort((x, y) => y.puntos - x.puntos || x.archivo.localeCompare(y.archivo));
}

function leerWatermark() {
  try { return fs.readFileSync(WATERMARK, 'utf8').trim() || null; } catch { return null; }
}

function baseDelDelta() {
  const wm = leerWatermark();
  if (wm && git(`cat-file -t ${wm}`) === 'commit') return wm;
  return git('rev-parse --verify HEAD~1') || git('rev-parse HEAD');
}

function armarBorrador(datos) {
  const { fecha, base, head, commits, delta, filas, cands } = datos;
  const corto = (s) => (s || '').slice(0, 8);
  const utiles = delta.filter((f) => !esRuido(f));
  const out = [];

  out.push(`# Candidatas de evolución — ${fecha}`, '');
  out.push(`Delta ${corto(base)}..${corto(head)}: ${commits.length} commit(s), ${utiles.length} archivo(s).`, '');
  out.push('Borrador para priorizar. No es un hallazgo y no se registra solo:');
  out.push('si vale la pena, se agrega la fila a EVOLUCION.md a mano.', '');

  out.push('## Cambios desde el último ciclo');
  const porArea = {};
  for (const f of utiles) (porArea[areaDe(f)] || (porArea[areaDe(f)] = [])).push(f);
  if (Object.keys(porArea).length === 0) out.push('- (sin cambios)');
  for (const area of Object.keys(porArea).sort()) {
    out.push(`- ${area}:`);
    for (const f of porArea[area]) out.push(`  - ${f}`);
  }
  out.push('');

  out.push('## Abiertas (no re-reportar)');
  const abiertas = filas.filter((f) => f.seccion === 'Abiertas');
  if (abiertas.length === 0) out.push('- (ninguna)');
  for (const f of abiertas) out.push(`- ${f.id} | ${f.categoria} | ${f.mejora}`);
  out.push('');

  out.push('## Candidatas ordenadas por prioridad (posible hueco, no hallazgo)');
  if (cands.length === 0) out.push('- (ninguna)');
  for (const c of cands) {
    const detalle = c.motivos && c.motivos.length ? ` — ${c.motivos.join(', ')}` : '';
    out.push(`- [${c.puntos}] ${c.archivo}${detalle}`);
  }
  out.push('');
  return out.join('\n');
}

function leerPaquete() {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).files || []; } catch { return []; }
}

function textoDeTests() {
  let texto = '';
  try {
    const dir = path.join(ROOT, 'tests');
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.js')) texto += fs.readFileSync(path.join(dir, f), 'utf8');
  } catch {
    // sin tests: todas las candidatas quedan como "sin test"
  }
  return texto;
}

function armarContexto() {
  const files = leerPaquete();
  const tests = textoDeTests();
  return {
    enPaquete: (a) => viajaEnPaquete(a, files),
    tieneTest: (a) => tests.includes(path.basename(a)),
  };
}

// Junta el estado del ciclo en un objeto, sin tocar disco. La usa el CLI de acá
// y también el orquestador (evolve.js).
function correr() {
  const fecha = new Date().toISOString().slice(0, 10);
  const head = git('rev-parse HEAD');
  const base = baseDelDelta();
  const commits = head && base ? git(`log --oneline ${base}..${head}`).split('\n').filter(Boolean) : [];
  const delta = head && base ? git(`diff --name-only ${base} ${head}`).split('\n').filter(Boolean) : [];
  const filas = fs.existsSync(LEDGER) ? filasDelLedger(fs.readFileSync(LEDGER, 'utf8')) : [];
  const cands = priorizarCandidatos(candidatos(delta, archivosCitados(filas)), armarContexto());
  const borrador = armarBorrador({ fecha, base, head, commits, delta, filas, cands });
  return { fecha, base, head, commits, delta, filas, cands, borrador };
}

function escribirBorrador(borrador) {
  fs.mkdirSync(path.dirname(DRAFT), { recursive: true });
  fs.writeFileSync(DRAFT, borrador);
  return path.relative(ROOT, DRAFT).split(path.sep).join('/');
}

function main(argv) {
  const flags = new Set(argv);
  const { head, commits, cands, borrador } = correr();

  if (flags.has('--stdout')) {
    process.stdout.write(borrador + '\n');
  } else {
    const rel = escribirBorrador(borrador);
    console.log(`Candidatas: ${rel} — ${commits.length} commit(s), ${cands.length} sin fila`);
  }

  if (flags.has('--mark') && head) {
    fs.mkdirSync(path.dirname(WATERMARK), { recursive: true });
    fs.writeFileSync(WATERMARK, head + '\n');
    console.log(`Watermark → ${head.slice(0, 8)}`);
  }
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { esRuido, areaDe, filasDelLedger, archivosCitados, candidatos, armarBorrador, esZonaSensible, viajaEnPaquete, puntuarCandidato, priorizarCandidatos, correr, escribirBorrador };
