const fs = require('fs');
const path = require('path');

const SKILL = path.join(__dirname, '..', 'skills', 'ponytail-gain', 'SKILL.md');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\nTesting ponytail-gain-source...\n');

test('la skill decla su sección de Fuente (E93)', () => {
  const skill = fs.readFileSync(SKILL, 'utf8');
  check(/##\s+Fuente/i.test(skill), 'falta la sección de Fuente');
});

test('la Fuente confiesa que el dato no es verificable desde el repo', () => {
  const skill = fs.readFileSync(SKILL, 'utf8');
  check(/NO es verificable desde acá/.test(skill), 'la confesión de no-verificabilidad desapareció');
});

test('la Fuente lleva la fecha en que se registró el dato', () => {
  const skill = fs.readFileSync(SKILL, 'utf8');
  check(/registrado el \d{4}-\d{2}-\d{2}/.test(skill), 'falta la fecha del registro de la fuente');
});

test('la Fuente pide retirar la skill si la fuente se cae', () => {
  const skill = fs.readFileSync(SKILL, 'utf8');
  check(/sacarla del catálogo/.test(skill), 'falta la regla de retiro');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
