const fs = require('fs');
const path = require('path');

// La política de runtime PHP vive en la regla que se instala en cada proyecto.
// Si alguien la ablanda (un piso más bajo, un "8.5.11 está bien"), esto tiene
// que romper: la nota es lo único que frena un despliegue sobre un host viejo.

const ROOT = path.join(__dirname, '..');
const REGLA = path.join(ROOT, 'rules', 'php', 'security.md');
const CHECKLIST = path.join(ROOT, 'skills', 'auditor-de-seguridad', 'references', 'checklists.md');
const SKILL_AUDITOR = path.join(ROOT, 'skills', 'auditor-de-seguridad', 'SKILL.md');

// Piso mínimo por rama: la versión que trae el arreglo de los RCE críticos de
// octubre 2026. Un piso más alto está bien (conservador); más bajo, no.
const PISOS_MINIMOS = {
  '8.5': '8.5.12',
  '8.4': '8.4.27',
  '8.3': '8.3.36',
  '8.2': '8.2.35',
};

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try { await fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function leer(ruta) { return fs.readFileSync(ruta, 'utf8'); }

// Compara dos versiones por partes: 8.5.12 > 8.5.9, 8.4.27 < 8.5.0
function pisoOk(declarado, minimo) {
  const a = declarado.split('.').map(Number);
  const b = minimo.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return true;
}

function pisoDeclarado(regla, rama) {
  const m = regla.match(new RegExp(rama.replace('.', '\\.') + ':\\s*(8\\.\\d+\\.\\d+)'));
  check(m, `la regla no declara un piso para la rama ${rama}`);
  return m[1];
}

console.log('\nTesting php-policy...\n');

(async () => {
  const regla = leer(REGLA);
  const checklist = leer(CHECKLIST);

  await test('la regla declara un piso para cada rama soportada', async () => {
    for (const rama of Object.keys(PISOS_MINIMOS)) pisoDeclarado(regla, rama);
  });

  await test('ningún piso queda por debajo del mínimo conocido', async () => {
    for (const [rama, minimo] of Object.entries(PISOS_MINIMOS)) {
      const declarado = pisoDeclarado(regla, rama);
      check(pisoOk(declarado, minimo),
        `la rama ${rama} declara ${declarado} y el mínimo es ${minimo}`);
    }
  });

  await test('nadie declara 8.5.11 como seguro', async () => {
    const falso = /8\.5\.11[^\n]{0,80}\b(safe|secure|patched|up to date|fully patched|seguro|parcheado|corregido)\b/i;
    check(!falso.test(regla), 'la regla dice que 8.5.11 está parcheado');
    check(!falso.test(checklist), 'el checklist dice que 8.5.11 está parcheado');
  });

  await test('la nota pide la evidencia del host, no un archivo del repo', async () => {
    for (const token of ['PHP_VERSION', 'SAPI', 'require.php', 'unverified']) {
      check(regla.includes(token), `la regla no menciona ${token}`);
    }
  });

  await test('la nota está fechada y apunta a la fuente', async () => {
    check(/\d{4}-\d{2}-\d{2}/.test(regla), 'la regla no tiene fecha');
    check(regla.includes('php.net/releases'), 'la regla no enlaza a php.net/releases');
  });

  await test('el checklist del auditor declara los mismos pisos', async () => {
    for (const piso of Object.values(PISOS_MINIMOS)) {
      check(checklist.includes(piso), `el checklist no menciona el piso ${piso}`);
    }
  });

  await test('el conteo de checks del auditor coincide con la checklist', async () => {
    const ini = checklist.indexOf('## Infrastructure & Cloud Security');
    const fin = checklist.indexOf('## Database Security');
    check(ini >= 0 && fin > ini, 'no encontré la sección de infraestructura');
    const bullets = checklist.slice(ini, fin).split('\n').filter((l) => /^ {2,}- \*\*/.test(l)).length;
    const linea = leer(SKILL_AUDITOR).split('\n')
      .find((l) => l.includes('references/checklists.md#infrastructure--cloud-security'));
    check(linea, 'el SKILL.md del auditor no apunta a la sección de infraestructura');
    const m = linea.match(/Checks:\*\*\s*(\d+)/);
    check(m, 'el SKILL.md del auditor no declara el conteo de checks');
    check(Number(m[1]) === bullets, `el SKILL.md dice ${m[1]} checks y la checklist tiene ${bullets}`);
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})();
