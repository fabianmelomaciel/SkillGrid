const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GATE = path.join(ROOT, 'skills', 'shared', 'finding-gate.md');
const AUDITOR = path.join(ROOT, 'skills', 'auditor-de-seguridad', 'SKILL.md');
const HACK = path.join(ROOT, 'skills', 'hack-audit', 'SKILL.md');
const REPOS = path.join(ROOT, 'skills', 'auditor-de-seguridad', 'references', 'external-repos.md');
const NOTICE = path.join(ROOT, 'NOTICE');

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

test('el NOTICE atribuye las fuentes y viaja en el paquete', () => {
  check(fs.existsSync(NOTICE), 'falta NOTICE');
  const t = leer(NOTICE);
  for (const repo of ['claude-code-security-review', 'Claude-BugHunter', 'Claude-Red', 'Consensys/repo-security-review']) check(t.includes(repo), `falta ${repo} en NOTICE`);
  check(/CC BY 4\.0/.test(t), 'falta la licencia CC BY 4.0');
  check(/sin licencia declarada/i.test(t), 'falta la aclaración de Consensys');
  check(require('../package.json').files.includes('NOTICE'), 'NOTICE no viaja en el paquete');
});

// El test de arriba mira la prosa; este mira el filtro. Un hallazgo que no
// puede sostener lo que afirma no entra al informe, y eso tiene que fallar en
// un fixture roto, no en una keyword ausente.
function validateFinding(f) {
  const errores = [];
  if (!f || typeof f !== 'object') return ['hallazgo vacío'];

  if (!Number.isInteger(f.confidence) || f.confidence < 1 || f.confidence > 10)
    errores.push('confidence fuera de 1-10');

  const estados = ['confirmed', 'needs-validation', 'discarded'];
  if (!estados.includes(f.validation_status)) errores.push('validation_status inválido');
  else if (f.validation_status === 'confirmed' && f.confidence < 8)
    errores.push('confirmed exige confidence >= 8');
  else if (f.validation_status === 'discarded' && !f.motivo)
    errores.push('discarded exige motivo');

  if (f.validation_status !== 'discarded' && !/^[^\s:]+:\d+$/.test(f.evidencia || ''))
    errores.push('falta archivo:línea');

  if (f.validation_status !== 'discarded' && !/^AV:[NALP]\//.test(f.cvss || ''))
    errores.push('falta vector CVSS v3.1');

  if (/(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|-----BEGIN [A-Z ]+PRIVATE KEY-----)/.test(JSON.stringify(f)))
    errores.push('evidencia con secreto crudo: usar placeholder');

  return errores;
}

const hallazgoValido = {
  id: 'F-1', confidence: 9, validation_status: 'confirmed',
  evidencia: 'src/auth.js:42', cvss: 'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H',
  estado: 'abierto', retest: 'pendiente',
};

test('finding gate: un hallazgo sostenido pasa el filtro', () => {
  const errores = validateFinding(hallazgoValido);
  check(errores.length === 0, `el fixture válido falló: ${errores.join(', ')}`);
});

test('finding gate: rechaza lo que no puede sostener', () => {
  const casos = [
    { ...hallazgoValido, confidence: 5 },
    { ...hallazgoValido, confidence: undefined },
    { ...hallazgoValido, evidencia: 'src/auth.js' },
    { ...hallazgoValido, cvss: '' },
    { ...hallazgoValido, validation_status: 'discarded' },
    { ...hallazgoValido, evidencia: 'src/auth.js:42 token=ghp_' + 'a'.repeat(36) },
  ];
  for (const caso of casos) {
    check(validateFinding(caso).length > 0, `debería rechazar: ${JSON.stringify(caso)}`);
  }
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
