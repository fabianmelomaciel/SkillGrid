const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Los pisos de seguridad de los runtimes viven en un solo archivo y se inyectan
// en las rules y en el checklist del auditor. Acá se vigila que el dato no se
// pudra: que nadie lo edite a mano, que los pisos no bajen y que no venza.

const ROOT = path.join(__dirname, '..');
const DATOS = path.join(ROOT, 'skills', 'shared', 'runtime-floors.json');
const SCRIPT = path.join(ROOT, 'scripts', 'sync-floors.js');

// El mínimo con el que no se negocia: el release que trajo los arreglos críticos.
const PISOS_MINIMOS = {
  php: { '8.5': '8.5.12', '8.4': '8.4.27', '8.3': '8.3.36', '8.2': '8.2.35' },
  node: '22',
  python: '3.13',
};

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try { await fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function leer(ruta) { return fs.readFileSync(ruta, 'utf8'); }

function partes(version) { return version.split('.').map(Number); }

// 8.5.13 > 8.5.9: comparar por partes, no como texto
function mayorOIgual(a, b) {
  const x = partes(a);
  const y = partes(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const p = x[i] || 0;
    const q = y[i] || 0;
    if (p > q) return true;
    if (p < q) return false;
  }
  return true;
}

console.log('\nTesting runtime-floors...\n');

(async () => {
  const datos = JSON.parse(leer(DATOS));

  await test('el JSON de pisos tiene la forma esperada', async () => {
    check(/^\d{4}-\d{2}-\d{2}$/.test(datos.checked_at), `checked_at inválido: ${datos.checked_at}`);
    check(datos.ttl_days > 0, 'ttl_days tiene que ser un número positivo');
    for (const rt of ['php', 'node', 'python']) {
      check(datos.runtimes[rt], `falta el runtime ${rt}`);
      check(datos.runtimes[rt].supported.length > 0, `${rt} no tiene líneas soportadas`);
      check(datos.runtimes[rt].source, `${rt} no declara de dónde salió el dato`);
      for (const linea of datos.runtimes[rt].supported) {
        check(linea.line, `${rt} tiene una línea sin nombre`);
        check(/^\d{4}-\d{2}-\d{2}$/.test(linea.eol), `${rt} ${linea.line}: eol inválido`);
      }
    }
  });

  await test('las rules y el checklist están sincronizados con el JSON', async () => {
    try {
      execFileSync(process.execPath, [SCRIPT, '--check'], { cwd: ROOT, encoding: 'utf8' });
    } catch (e) {
      throw new Error((e.stderr || e.message || '').trim().split('\n').slice(0, 4).join(' | '));
    }
  });

  await test('el dato no está vencido', async () => {
    const edad = Math.floor((Date.now() - Date.parse(datos.checked_at)) / 86400000);
    if (edad > datos.ttl_days) {
      // En CI no se corta: el release exige el gate local, y romper el CI por
      // un dato viejo suma ruido sin evitar que se publique.
      if (process.env.CI) {
        console.log(`       (dato vencido hace ${edad - datos.ttl_days} días, saltado en CI)`);
        return;
      }
      throw new Error(`el dato tiene ${edad} días y el ttl es ${datos.ttl_days}: refrescá runtime-floors.json`);
    }
  });

  await test('ningún piso queda por debajo del mínimo conocido', async () => {
    for (const [linea, minimo] of Object.entries(PISOS_MINIMOS.php)) {
      const entrada = datos.runtimes.php.supported.find((s) => s.line === linea);
      check(entrada, `php ${linea} no está en el JSON`);
      check(entrada.floor, `php ${linea} no declara piso`);
      check(mayorOIgual(entrada.floor, minimo), `php ${linea} declara ${entrada.floor} y el mínimo es ${minimo}`);
    }
    const node = datos.runtimes.node.supported.map((s) => s.line).sort()[0];
    check(mayorOIgual(node, PISOS_MINIMOS.node), `node arranca en ${node} y el mínimo es ${PISOS_MINIMOS.node}`);
    const python = datos.runtimes.python.supported.map((s) => s.line).sort()[0];
    check(mayorOIgual(python, PISOS_MINIMOS.python), `python arranca en ${python} y el mínimo es ${PISOS_MINIMOS.python}`);
  });

  await test('la regla de PHP no manda exponer phpinfo()', async () => {
    const regla = leer(path.join(ROOT, 'rules', 'php', 'security.md'));
    check(!/phpinfo/i.test(regla), 'la regla sigue mandando leer la versión con phpinfo()');
    check(regla.includes('PHP_VERSION'), 'la regla no menciona PHP_VERSION');
  });

  await test('cada runtime con piso tiene su bloque en su rule', async () => {
    const targets = [
      ['rules/typescript/security.md', 'node'],
      ['rules/python/security.md', 'python'],
      ['rules/php/security.md', 'php'],
    ];
    for (const [rel, runtime] of targets) {
      const texto = leer(path.join(ROOT, rel));
      check(texto.includes(`<!-- floors:start ${runtime} -->`), `${rel} no tiene el bloque de ${runtime}`);
      check(texto.includes(`<!-- floors:end -->`), `${rel} no cierra el bloque de pisos`);
    }
  });

  await test('el repo no pide un runtime sin parches', async () => {
    const pkg = JSON.parse(leer(path.join(ROOT, 'package.json')));
    const engines = (pkg.engines && pkg.engines.node) || '';
    const pedido = engines.match(/>=\s*(\d+)/);
    check(pedido, `no se puede leer el mínimo de node de engines: ${engines}`);
    check(Number(pedido[1]) >= 22, `engines pide node ${pedido[1]} y 20/18 están EOL`);
    const version = leer(path.join(ROOT, '.node-version')).trim();
    check(mayorOIgual(version, '22'), `.node-version dice ${version} y 20 está EOL`);
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})();
