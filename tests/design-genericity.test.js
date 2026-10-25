const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

const premium = read('skills/github-premium-aesthetics/SKILL.md');
const emil = read('skills/emil-kowalski-design/SKILL.md');
const quality = read('rules/web/design-quality.md');
const pm = read('skills/project-manager/SKILL.md');
const galeria = read('skills/shared/galeria-disenos.md');

console.log('\nTesting design genericity...\n');

// La identidad fija era el problema: paleta y fondo vueltos a hardcodear
// devuelven el mismo look, por más que el resto diga "premium".
test('premium no trae paleta ni fondo hardcodeados', () => {
  const fijos = [/hsl\(240,\s*10%,\s*3\.9%\)/, /hsla\(244,\s*47%,\s*53%/, /hsla\(180,\s*70%,\s*50%/];
  const encontrados = fijos.filter((rx) => rx.test(premium));
  check(encontrados.length === 0, `vuelve la identidad fija: ${encontrados.map(String).join(', ')}`);
});

test('premium exige la ficha antes de escribir CSS de identidad', () => {
  check(premium.includes('galeria-disenos.md'), 'no cita la galería');
  check(/sin ficha citada no se escribe CSS/i.test(premium), 'falta la regla de la ficha');
});

test('premium ya no se vende como bento + mesh + HUD', () => {
  const fm = premium.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  check(fm, 'sin frontmatter');
  check(!/Bento grids, glowing borders, mesh gradients/i.test(fm[1]), 'la descripción sigue vendiendo el look fijo');
});

test('emil define los cinco ejes de dirección', () => {
  check(emil.includes('Dirección'), 'falta el bloque Dirección');
  for (const eje of ['typology', 'density', 'hierarchy', 'grid', 'voice']) {
    check(new RegExp(`\\*\\*${eje}\\*\\*`).test(emil), `falta el eje ${eje}`);
  }
});

test('emil tiene veto de repetición contra el diseño anterior', () => {
  check(/Repetition veto/i.test(emil), 'falta el veto de repetición');
  check(/at least 3 of the 5 differ/i.test(emil), 'no exige que 3 de 5 valores cambien');
});

test('el gate de diseño pide evidencia, no tildes', () => {
  check(emil.includes('Design Gate'), 'falta el Design Gate');
  check(!/Would this embarrass Stripe, Linear, or Vercel/i.test(emil), 'sigue el benchmark que produce el promedio');
  check(/The discard/i.test(emil) && /Banned Patterns/i.test(emil), 'no exige nombrar el descarte contra los patrones prohibidos');
});

test('design-quality no ofrece menú de estilos ni "4 de 10"', () => {
  check(!/at least four of these/i.test(quality), 'volvió el "elegí 4 de 10"');
  check(!/Worthwhile Style Directions/i.test(quality), 'volvió el menú de nueve estilos');
  check(quality.includes('emil-kowalski-design'), 'no manda a los cinco ejes');
});

test('project-manager no rutea por el look genérico', () => {
  check(!/Premium visual section \(bento, mesh, glass\)/i.test(pm), 'sigue el atajo "bento, mesh, glass"');
  check(!/bento grids, mesh gradients, glassmorphism/i.test(pm), 'la descripción del agente sigue vendiendo el look');
});

test('la galería aclara que los patrones son forma, no identidad', () => {
  check(/forma, no identidad/i.test(galeria), 'no advierte que los colores son de la marca');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
