const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const TEMPLATES = [
  'skills/auditor-de-seguridad/reports/dashboard-template.html',
  'skills/cyber-neo/reports/cyber-neo-template.html',
  'skills/prompt-injection-guard/reports/prompt-injection-template.html',
  'skills/hack-audit/reports/hack-audit-template.html',
  'skills/optimizador-finops/reports/finops-template.html',
  'skills/auditor-de-marketing/reports/marketing-template.html',
  'skills/agente-devops/reports/devops-template.html',
  'skills/brainstorming/scripts/frame-template.html',
];

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try { await fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function read(rel) { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); }

function extractBlock(text, file) {
  const m = text.match(/\/\* MOTION:INICIO[\s\S]*?\/\* MOTION:FIN \*\//);
  check(m, `${file}: falta el bloque MOTION`);
  return m[0];
}

function norm(s) {
  return s.replace(/\s+/g, ' ').trim();
}

console.log('\nTesting motion-block...\n');

(async () => {
  const files = TEMPLATES.map((rel) => ({ rel, text: read(rel) }));

  await test('los 8 templates declaran el bloque MOTION', async () => {
    const malos = files.filter(({ text }) => !/\/\* MOTION:INICIO/.test(text) || !/\/\* MOTION:FIN \*\//.test(text));
    check(malos.length === 0, `sin bloque MOTION: ${malos.map((f) => f.rel).join(', ')}`);
  });

  await test('el bloque MOTION es idéntico (normalizado) en los 8 templates', async () => {
    const base = { rel: files[0].rel, block: norm(extractBlock(files[0].text, files[0].rel)) };
    const malos = [];
    for (const f of files.slice(1)) {
      const block = norm(extractBlock(f.text, f.rel));
      if (block !== base.block) malos.push(`${f.rel} difiere de ${base.rel}`);
    }
    check(malos.length === 0, malos.join(' | '));
  });

  await test('el bloque exige prefers-reduced-motion: no-preference', async () => {
    const malos = files.filter(({ rel, text }) => !/@media \(prefers-reduced-motion: no-preference\)/.test(extractBlock(text, rel)));
    check(malos.length === 0, `sin guarda reduced-motion: ${malos.map((f) => f.rel).join(', ')}`);
  });

  await test('ningún template carga Google Fonts por CDN', async () => {
    const malos = files.filter(({ text }) => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(text));
    check(malos.length === 0, `CDN presente: ${malos.map((f) => f.rel).join(', ')}`);
  });

  await test('ningún template usa transition: all', async () => {
    const malos = files.filter(({ text }) => /transition:\s*all/.test(text));
    check(malos.length === 0, `transition: all en: ${malos.map((f) => f.rel).join(', ')}`);
  });

  await test('los acordeones usan <button aria-expanded>, no <div onclick>', async () => {
    const malos = files.filter(({ text }) => /<div class="finding-header" onclick=/.test(text));
    check(malos.length === 0, `div onclick en: ${malos.map((f) => f.rel).join(', ')}`);
  });

  await test('los 7 templates de reporte traen la barra de progreso con guarda @supports', async () => {
    const reports = files.filter(({ rel }) => !rel.includes('frame-template'));
    const malos = reports.filter(({ text }) =>
      !/class="sg-progress"/.test(text)
      || !/@supports \(animation-timeline: scroll\(\)\)/.test(text)
      || !/animation-timeline: scroll\(root block\)/.test(text)
      || !/aria-hidden="true"/.test(text));
    check(malos.length === 0, `sin barra de progreso completa: ${malos.map((f) => f.rel).join(', ')}`);
    const frame = files.find(({ rel }) => rel.includes('frame-template'));
    check(!/sg-progress/.test(frame.text), 'frame no debe tener la barra (sin scroll de documento)');
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})();
