const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GATE = path.join(ROOT, 'skills', 'shared', 'finding-gate.md');
const AUDITOR = path.join(ROOT, 'skills', 'auditor-de-seguridad', 'SKILL.md');
const HACK = path.join(ROOT, 'skills', 'hack-audit', 'SKILL.md');
const REPOS = path.join(ROOT, 'skills', 'auditor-de-seguridad', 'references', 'external-repos.md');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }
function leer(p) { return fs.readFileSync(p, 'utf8'); }

console.log('\nTesting finding-gate...\n');

test('el gate compartido existe y tiene las cinco preguntas', () => {
  check(fs.existsSync(GATE), 'falta skills/shared/finding-gate.md');
  const t = leer(GATE);
  for (const n of ['1.', '2.', '3.', '4.', '5.']) check(t.includes(n), `falta la pregunta ${n}`);
  check(/descart/i.test(t), 'el gate tiene que hablar de descarte');
  check(/CVSS v3\.1/.test(t), 'falta el anclaje CVSS v3.1');
  check(/\[email_usuario\]/.test(t), 'faltan los placeholders de evidencia');
  check(/git diff --name-only/.test(t), 'falta el modo diff');
  check(/needs-validation/.test(t), 'falta el estado needs-validation');
  check(/confidence/i.test(t), 'falta el score de confianza');
  check(/Pre-Severity Gate/i.test(t), 'falta el Pre-Severity Gate');
  check(/retest/i.test(t), 'falta el campo retest');
});

test('los auditores referencian el gate compartido', () => {
  check(leer(AUDITOR).includes('skills/shared/finding-gate.md'), 'auditor-de-seguridad no referencia el gate');
  check(leer(HACK).includes('skills/shared/finding-gate.md'), 'hack-audit no referencia el gate');
});

test('el gate no importa armamento ofensivo', () => {
  const t = leer(GATE);
  for (const termino of ['Cobalt Strike', 'Mimikatz', 'EDR evasion', 'shellcode', 'persistencia']) {
    check(!new RegExp(termino, 'i').test(t), `el gate no debe hablar de ${termino}`);
  }
});

test('external-repos atribuye las tres fuentes y marca lo que quedó afuera', () => {
  const t = leer(REPOS);
  for (const repo of ['claude-code-security-review', 'Claude-BugHunter', 'Claude-Red']) check(t.includes(repo), `falta ${repo}`);
  check(/MIT/.test(t), 'falta la licencia');
  check(/CC BY 4\.0/.test(t), 'falta la licencia CC BY 4.0 de BugHunter');
  check(/Consensys/.test(t), 'falta Consensys (sin licencia)');
  check(/Qué quedó afuera/.test(t), 'falta la lista de lo que NO se tomó');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
