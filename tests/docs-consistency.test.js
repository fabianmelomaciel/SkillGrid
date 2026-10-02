const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog.json'), 'utf8'));
const bundles = JSON.parse(fs.readFileSync(path.join(ROOT, 'skills', 'bundles', 'index.json'), 'utf8'));

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try { await fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\nTesting docs-consistency...\n');

(async () => {
  await test('catalog.json consistente por dentro (total vs skills vs categorías)', async () => {
    check(catalog.summary.total === catalog.skills.length,
      `summary.total=${catalog.summary.total} pero skills.length=${catalog.skills.length}`);
    const suma = Object.values(catalog.summary.categories).reduce((a, b) => a + b, 0);
    check(suma === catalog.skills.length, `categorías suman ${suma}, skills=${catalog.skills.length}`);
  });

  await test('README: cada conteo frío de "skills" coincide con catalog.json', async () => {
    const total = catalog.summary.total;
    const perfiles = Object.keys(bundles.profiles);
    const conteos = [];
    for (const m of readme.matchAll(/(\d+) skills/g)) {
      conteos.push({ n: Number(m[1]), linea: m[0] });
    }
    check(conteos.length >= 4, `se esperaban conteos en README, hubo ${conteos.length}`);
    for (const m of readme.matchAll(/skills-(\d+)/g)) conteos.push({ n: Number(m[1]), linea: m[0] });
    const lineas = readme.split('\n');
    for (const c of conteos) {
      const esPerfil = lineas.some((l) =>
        perfiles.some((p) => l.includes('`' + p + '`:') && l.includes(c.n + ' skills')));
      if (esPerfil) continue;
      check(c.n === total, `README dice "${c.linea}", catálogo dice ${total}`);
    }
  });

  await test('README: los conteos de perfiles coinciden con skills/bundles/index.json', async () => {
    const lineas = readme.split('\n');
    let vistos = 0;
    for (const [nombre, perfil] of Object.entries(bundles.profiles)) {
      const linea = lineas.find((l) => l.includes('`' + nombre + '`:'));
      check(linea, `el perfil ${nombre} no aparece en el README`);
      const m = linea.match(/\((\d+) skills/);
      check(m, `la línea del perfil ${nombre} no trae conteo: ${linea.slice(0, 80)}`);
      check(Number(m[1]) === perfil.skills.length,
        `README dice ${m[1]} skills para ${nombre}, el bundle tiene ${perfil.skills.length}`);
      vistos++;
    }
    check(vistos === Object.keys(bundles.profiles).length, 'no se revisaron todos los perfiles');
  });

  await test('README: los conteos por categoría coinciden con catalog.json', async () => {
    const esperados = Object.values(catalog.summary.categories).sort((a, b) => a - b);
    const vistos = [...readme.matchAll(/(\d+) (?:Skills|Agents)\b/g)].map((m) => Number(m[1])).sort((a, b) => a - b);
    check(vistos.length > 0, 'el README no tiene encabezados de categoría con conteo');
    check(JSON.stringify(vistos) === JSON.stringify(esperados),
      `README=${JSON.stringify(vistos)} vs catálogo=${JSON.stringify(esperados)}`);
    for (const m of readme.matchAll(/(\d+) agents\b/g)) {
      check(Number(m[1]) === catalog.summary.categories.agent,
        `README dice ${m[1]} agents en texto libre, catálogo dice ${catalog.summary.categories.agent}`);
    }
  });

  await test('README: sin conteo de tests hardcodeado (imposible de verificar sin correr la suite)', async () => {
    check(!/tests-\d+/.test(readme), 'badge de tests con número hardcodeado');
    check(!/\b\d+ tests\b/.test(readme), 'afirmación "N tests" hardcodeada');
  });

  await test('README: la sección del catálogo lista cada skill del catálogo', async () => {
    const ini = readme.indexOf('<!-- catalog:begin -->');
    const fin = readme.indexOf('<!-- catalog:end -->');
    check(ini >= 0 && fin > ini, 'marcadores catalog:begin/end ausentes');
    const seccion = readme.slice(ini, fin);
    const faltantes = catalog.skills.filter((s) => !seccion.includes(s.name)).map((s) => s.name);
    check(faltantes.length === 0, `skills ausentes del catálogo en README: ${faltantes.join(', ')}`);
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})();
