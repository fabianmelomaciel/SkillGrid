// visor-dev-only.test.js — la garantía de que el visor ya no es parte de este
// paquete. El visor pasó a ser un producto público aparte (repo visor-ia) y
// desde acá no se publica, no se copia y no se trackea.
//
// Verifica hechos estructurales, no que el visor exista: en una máquina
// limpia este test tiene que pasar igual.

const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const REPO_VISOR = path.join(ROOT, '..', 'visor-ia');

let passed = 0;
let failed = 0;
let skipped = 0;

async function test(name, fn) {
  try {
    const r = await fn();
    if (r === 'skip') { skipped++; console.log(`  SKIP  ${name}`); return; }
    console.log(`  OK    ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL  ${name}: ${e.message}`);
    failed++;
  }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function listarPaquete() {
  // --ignore-scripts: el prepack regenera el catálogo y no tiene nada que ver
  // con esto. Con un comando fijo no hay escapado que hacer.
  const salida = execSync('npm pack --dry-run --json --ignore-scripts', {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const datos = JSON.parse(salida);
  const item = Array.isArray(datos) ? datos[0] : datos;
  return (item && item.files ? item.files : []).map((f) => f.path);
}

// El repo del visor, si está en la máquina. Si no está, las invariantes se
// saltan: el guardián de acá no puede verificar código que no tiene.
function repoVisor() {
  if (!fs.existsSync(path.join(REPO_VISOR, 'src', 'fuentes.js'))) return null;
  return REPO_VISOR;
}

function leerVisor(rel) {
  const repo = repoVisor();
  if (!repo) return null;
  try { return fs.readFileSync(path.join(repo, rel), 'utf8'); } catch { return null; }
}

console.log('\nTesting visor-dev-only...\n');

(async () => {
  await test('package.json no publica el visor', async () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const files = Array.isArray(pkg.files) ? pkg.files : [];
    const malos = files.filter((f) => /visor/i.test(f));
    check(malos.length === 0, `files: ${malos.join(', ')}`);
    // el guardián sí se queda en el test de este repo: lo que no se publica
    // es el visor, no la comprobación de que no se publique
  });

  await test('install-core.js no copia el visor', async () => {
    const fuente = fs.readFileSync(path.join(ROOT, 'scripts', 'install-core.js'), 'utf8');
    check(!/scratch/i.test(fuente), 'install-core.js menciona scratch/');
    check(!/visor/i.test(fuente), 'install-core.js menciona el visor');
    check(!/['"`]dev['"`]/.test(fuente), 'install-core.js copia dev/');
    check(!/[\\/]dev[\\/]/.test(fuente), 'install-core.js copia dev/');
  });

  await test('npm pack no incluye nada del visor', async () => {
    const archivos = listarPaquete();
    check(archivos.length > 0, 'el paquete no lista ningún archivo: el test pasaría por las dudas');
    const malos = archivos.filter((p) =>
      /^scratch[\\/]/.test(p) ||
      /^dev[\\/]/.test(p) ||
      /(^|[\\/])dev[\\/]/.test(p) ||
      /visor/i.test(p));
    check(malos.length === 0, `en el paquete: ${malos.join(', ')}`);
  });

  await test('git no trackea nada de scratch/', async () => {
    let salida = '';
    try {
      salida = execFileSync('git', ['ls-files', 'scratch/'], { cwd: ROOT, encoding: 'utf8' });
    } catch (e) {
      if (e && e.stderr && /not a git repository/i.test(e.stderr.toString())) {
        console.log('        (sin git: se saltea la comprobación)');
        return;
      }
      throw e;
    }
    const trackeados = salida.split('\n').map((l) => l.trim()).filter(Boolean);
    check(trackeados.length === 0, `trackeados: ${trackeados.join(', ')}`);
  });

  await test('el visor ya no vive en este repo', async () => {
    check(!fs.existsSync(path.join(ROOT, 'scratch', 'visor')), 'scratch/visor sigue acá');
    const intrusos = [];
    (function caminar(dir, prof) {
      if (prof > 3) return;
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === '.git' || e.name === 'node_modules' || e.name === 'scratch') continue;
        if (/visor/i.test(e.name) && e.name !== 'visor-dev-only.test.js') intrusos.push(e.name);
        if (e.isDirectory()) caminar(path.join(dir, e.name), prof + 1);
      }
    }(ROOT, 0));
    check(intrusos.length === 0, `quedó: ${intrusos.join(', ')}`);
  });

  // --- las invariantes que el visor de mesa dejó ----------------------------
  // E73: la base del IDE se abre en sólo lectura. E75: la CSP no lleva
  // unsafe-inline. E76: no hay select * from part. E74: las sesiones de
  // opencode salen de la base, no del plugin.

  await test('E73 el visor abre la base del IDE en sólo lectura', async () => {
    const fuente = leerVisor('src/fuentes.js');
    if (fuente === null) return 'skip';
    check(/readOnly:\s*true/.test(fuente), 'la base no se abre con readOnly');
    check(/PRAGMA query_only=1/.test(fuente), 'falta PRAGMA query_only=1');
    check(!/new DatabaseSync\([^)]*\)\s*;/.test(fuente.replace(/readOnly[^)]*\)/g, '')), 'la base se abre sin readOnly');
  });

  await test('E74 el visor lee las sesiones de opencode de la base', async () => {
    const servidor = leerVisor('src/servidor.js');
    const fuentes = leerVisor('src/fuentes.js');
    if (servidor === null || fuentes === null) return 'skip';
    check(/sesionesOpencode/.test(servidor), 'el server no llama a sesionesOpencode');
    check(/from session/.test(fuentes), 'el visor no lee la tabla session');
  });

  await test('E75 la CSP del visor no lleva unsafe-inline', async () => {
    const servidor = leerVisor('src/servidor.js');
    if (servidor === null) return 'skip';
    check(!/unsafe-inline/.test(servidor), 'la CSP del visor lleva unsafe-inline');
    check(/script-src 'nonce-/.test(servidor), 'la CSP no usa nonce');
  });

  await test('E76 el visor no hace select * from part', async () => {
    const fuente = leerVisor('src/fuentes.js');
    if (fuente === null) return 'skip';
    // los comentarios hablan del problema: lo que cuenta es el SQL que corre
    const codigo = fuente.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    check(!/select\s+\*\s+from\s+part/i.test(codigo), 'el visor hace select * from part');
    check(/json_extract/.test(codigo), 'el visor no consulta las columnas sueltas');
  });

  console.log(`\n${passed} passed, ${failed} failed${skipped ? `, ${skipped} skipped` : ''}\n`);
  if (failed > 0) process.exit(1);
})();
