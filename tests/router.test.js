const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ROUTER = path.join(ROOT, 'skills', 'router', 'SKILL.md');
const INDEX = path.join(ROOT, 'skills', 'index.json');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\nTesting router cost_tier wiring...\n');

const routerBody = fs.readFileSync(ROUTER, 'utf8');
const index = JSON.parse(fs.readFileSync(INDEX, 'utf8'));

test('router menciona cost_tier como paso de carga', () => {
  check(routerBody.includes('cost_tier'), 'el SKILL.md del router no cita cost_tier');
});

test('router prohíbe cargar high con presupuesto agotado', () => {
  check(/cost_tier: high/.test(routerBody) && /(do not load|proh)/i.test(routerBody), 'falta la regla de presupuesto bajo para cost_tier high');
});

test('risk_level critical vence al cost_tier', () => {
  check(/risk_level: critical/.test(routerBody) && /beats|nunca|never/i.test(routerBody), 'falta el veto de risk critical sobre cost_tier');
});

test('anti-cascada: una sola skill por categoría', () => {
  check(/never load two skills of the same category|anti-cascade/i.test(routerBody), 'falta la regla anti-cascada explícita');
});

test('todo skill del índice tiene cost_tier válido', () => {
  const invalid = [];
  for (const [name, s] of Object.entries(index.skills || {})) {
    if (!['low', 'medium', 'high'].includes(s.cost_tier)) invalid.push(`${name}:${s.cost_tier}`);
  }
  check(invalid.length === 0, `cost_tier inválido en: ${invalid.join(', ')}`);
});

test('cost_tier es coherente con token_estimate.input', () => {
  const bad = [];
  for (const [name, s] of Object.entries(index.skills || {})) {
    const inp = s.token_estimate && s.token_estimate.input;
    if (typeof inp !== 'number') continue;
    const esperado = inp <= 2500 ? 'low' : inp <= 4500 ? 'medium' : 'high';
    if (s.cost_tier !== esperado) bad.push(`${name}: ${s.cost_tier} pero input=${inp}`);
  }
  check(bad.length === 0, `desalineado — regenerar catálogo: ${bad.join('; ')}`);
});

test('el catálogo lite sigue siendo la fuente liviana para el router', () => {
  const lite = path.join(ROOT, 'catalog-lite.json');
  check(fs.existsSync(lite), 'falta catalog-lite.json');
  const liteSize = fs.statSync(lite).size;
  const fullSize = fs.statSync(path.join(ROOT, 'catalog.json')).size;
  check(liteSize < fullSize, 'catalog-lite debe ser más chico que catalog.json');
});

test('el catálogo lite trae el cost_tier de cada skill', () => {
  // El router consulta el cost_tier para no cargar una skill cara; si el lite
  // no lo trae, tiene que abrir skills/index.json (24KB) por un solo campo.
  const lite = JSON.parse(fs.readFileSync(path.join(ROOT, 'catalog-lite.json'), 'utf8'));
  const sinCosto = (lite.skills || []).filter((s) => !['low', 'medium', 'high'].includes(s.cost_tier));
  check(sinCosto.length === 0, `skills sin cost_tier en el lite: ${sinCosto.map((s) => s.name).join(', ')}`);
  const index = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
  const desalineados = (lite.skills || [])
    .filter((s) => index.skills[s.name] && index.skills[s.name].cost_tier !== s.cost_tier)
    .map((s) => s.name);
  check(desalineados.length === 0, `cost_tier desalineado con el índice: ${desalineados.join(', ')}`);
});

test('el router lee el cost_tier del lite, no del índice pesado', () => {
  check(routerBody.includes('catalog-lite.json'), 'el router debería leer el catálogo lite');
  const leeIndice = /cost_tier[^.]*in `skills\/index\.json`/i.test(routerBody);
  check(!leeIndice, 'el router todavía manda a buscar el cost_tier en skills/index.json');
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
