// paquete.test.js — la salud del paquete npm: qué viaja, qué no y que lo que
// viaja exista de verdad.
//
// Reemplaza al guard que vigilaba que el monitor no se publicara acá. Ese
// proyecto ya no vive en este repo, así que el control quedó general: que no
// salga nada de desarrollo y que lo que sale esté completo.

const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  OK    ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL  ${name}: ${e.message}`);
    failed++;
  }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

// El paquete que arma npm, no lo que declaramos: la lista real.
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

// npm mete siempre estos, estén o no en "files".
const SIEMPRE = ['package.json', 'README.md', 'LICENSE', 'LICENCE'];

function Permitidos() {
  const permitidos = SIEMPRE.slice();
  for (const entrada of pkg.files) {
    if (entrada.startsWith('!')) continue;
    permitidos.push(entrada.endsWith('/') ? entrada : `${entrada}/`);
  }
  return permitidos;
}

function dentroDe(archivo, permitidos) {
  const limpio = archivo.replace(/\\/g, '/');
  return permitidos.some((p) => limpio === p.replace(/\/$/, '') || limpio.startsWith(p));
}

console.log('\nTesting paquete...\n');

(async () => {
  await test('el paquete se llama como el proyecto', async () => {
    check(/^@fabianmelomaciel\/skillgrid$/.test(pkg.name), pkg.name);
  });

  await test('la versión tiene forma de semver', async () => {
    check(/^\d+\.\d+\.\d+$/.test(pkg.version), pkg.version);
  });

  await test('la licencia es MIT', async () => {
    check(/^MIT$/.test(pkg.license), pkg.license);
  });

  await test('engines pide node 18 o más', async () => {
    check(/>=\s*18/.test(pkg.engines && pkg.engines.node), JSON.stringify(pkg.engines));
  });

  await test('la url del repositorio es la de origin', async () => {
    let url = '';
    try {
      url = execSync('git remote get-url origin', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    } catch {
      return; // sin git no hay contra qué comparar
    }
    check(/github\.com\/fabianmelomaciel\/SkillGrid/.test(url), url);
  });

  await test('cada entrada de files existe en disco', async () => {
    const faltan = pkg.files
      .filter((f) => !f.startsWith('!'))
      .filter((f) => !fs.existsSync(path.join(ROOT, f)));
    check(!faltan.length, `no existen: ${faltan.join(', ')}`);
  });

  await test('files no declara carpetas de desarrollo', async () => {
    check(!/scratch|node_modules|(^|\/)dev\//.test(JSON.stringify(pkg.files)), JSON.stringify(pkg.files));
  });

  await test('npm pack lista archivos', async () => {
    const archivos = listarPaquete();
    check(archivos.length > 0, 'el paquete no lista ningún archivo: el test pasaría por las dudas');
  });

  await test('npm pack no lleva nada de desarrollo', async () => {
    const malos = listarPaquete().filter((p) => /(^|\/)(scratch|dev|node_modules)\//.test(p.replace(/\\/g, '/')));
    check(!malos.length, `en el paquete: ${malos.join(', ')}`);
  });

  await test('npm pack sólo lleva lo que dice files', async () => {
    const permitidos = Permitidos();
    const extras = listarPaquete().filter((p) => !dentroDe(p, permitidos));
    check(!extras.length, `se colaron: ${extras.slice(0, 5).join(', ')}`);
  });

  await test('el paquete trae el CHANGELOG', async () => {
    check(listarPaquete().includes('CHANGELOG.md'), 'no está el CHANGELOG');
  });

  await test('el paquete trae el catálogo liviano', async () => {
    check(listarPaquete().includes('catalog-lite.json'), 'no está el catálogo liviano');
  });

  await test('el paquete trae el índice de skills', async () => {
    check(listarPaquete().includes('skills/index.json'), 'no está el índice de skills');
  });

  await test('cada skill del catálogo tiene su SKILL.md', async () => {
    const catalogo = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));
    const faltan = catalogo.skills.filter((s) => !fs.existsSync(path.join(ROOT, 'skills', s.name, 'SKILL.md')));
    check(!faltan.length, `faltan: ${faltan.map((s) => s.name).join(', ')}`);
  });

  await test('el catálogo liviano tiene el mismo total que el catálogo', async () => {
    const catalogo = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));
    const lite = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog-lite.json'), 'utf8'));
    check(catalogo.summary.total === lite.summary.total, `${catalogo.summary.total} y ${lite.summary.total}`);
  });

  await test('el total del catálogo coincide con la cantidad de skills', async () => {
    const catalogo = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));
    check(catalogo.summary.total === catalogo.skills.length, `${catalogo.summary.total} y ${catalogo.skills.length}`);
  });

  await test('la versión del catálogo es la del paquete', async () => {
    const catalogo = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));
    check(catalogo.version === pkg.version, `${catalogo.version} y ${pkg.version}`);
  });

  await test('el CHANGELOG tiene la sección [Unreleased]', async () => {
    const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
    check(/^## \[Unreleased\]/m.test(changelog), 'falta la sección');
  });

  await test('la última versión del CHANGELOG es la del paquete', async () => {
    const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
    const linea = changelog.split(/\r?\n/).find((l) => /^## \[\d/.test(l)) || '';
    check(linea.includes(pkg.version), linea);
  });

  await test('el README nombra al paquete de npm', async () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    check(/@fabianmelomaciel\/skillgrid/.test(readme), 'no lo nombra');
  });

  await test('el README nombra al repo', async () => {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    check(/github\.com\/fabianmelomaciel\/SkillGrid/.test(readme), 'no lo nombra');
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
    check(!trackeados.length, `trackeados: ${trackeados.join(', ')}`);
  });

  await test('el repo no tiene una carpeta dev/ suelta', async () => {
    check(!fs.existsSync(path.join(ROOT, 'dev')), 'está dev/');
  });

  await test('los scripts del paquete apuntan a archivos que existen', async () => {
    const nodos = new Set();
    for (const script of Object.values(pkg.scripts)) {
      for (const m of script.matchAll(/node ([A-Za-z0-9_./-]+[.]js)/g)) nodos.add(m[1]);
    }
    const rotos = [...nodos].filter((f) => !fs.existsSync(path.join(ROOT, f)));
    check(!rotos.length, `no existen: ${rotos.join(', ')}`);
  });

  await test('el repo no depende de nada de afuera', async () => {
    // Un repo que se para solo: ningun archivo trakeado puede apuntar a algo
    // que exista fuera de la raiz. Un ejemplo de docs ("../../../etc/passwd")
    // no cuenta: lo que importa es que exista.
    let salida = '';
    try {
      salida = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' });
    } catch (e) {
      if (e && e.stderr && /not a git repository/i.test(e.stderr.toString())) {
        console.log('        (sin git: se saltea la comprobación)');
        return;
      }
      throw e;
    }
    const fuera = [];
    const padre = path.dirname(ROOT);
    const casa = [process.env.USERPROFILE, process.env.HOME].filter(Boolean);
    for (const rel of salida.split('\n').map((l) => l.trim()).filter(Boolean)) {
      let texto = '';
      try { texto = fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { continue; }
      const base = path.dirname(path.join(ROOT, rel));
      const candidatos = new Set();
      for (const m of texto.matchAll(/(\.\.[/\\][A-Za-z0-9_.\/-]+)/g)) candidatos.add(m[1]);
      for (const m of texto.matchAll(/([A-Za-z]:\\[^"'<>\s|]+)/g)) candidatos.add(m[1]);
      for (const c of casa) if (texto.includes(c)) candidatos.add(c);
      for (const c of candidatos) {
        const abs = path.resolve(base, c);
        const relativo = path.relative(ROOT, abs);
        if (!relativo.startsWith('..') && !path.isAbsolute(relativo)) continue; // queda adentro
        if (!fs.existsSync(abs)) continue;                                       // no existe: es un ejemplo
        // lo que importa: otro proyecto del mismo workspace o tu carpeta personal
        const enWorkspace = abs === padre || abs.startsWith(padre + path.sep);
        const enCasa = casa.some((h) => abs === h || abs.startsWith(h + path.sep));
        if (!enWorkspace && !enCasa) continue;   // una ruta conocida (c:\laragon) no es dependencia
        fuera.push(`${rel}: ${c}`);
      }
    }
    check(!fuera.length, `apunta afuera: ${fuera.slice(0, 5).join(' | ')}`);
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})();
