const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WORKFLOWS = path.join(ROOT, '.github', 'workflows');
const PRECOMMIT = path.join(ROOT, '.githooks', 'pre-commit');
const GITIGNORE = path.join(ROOT, '.gitignore');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try { await fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function yamlFiles() {
  return fs.readdirSync(WORKFLOWS)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map((f) => ({ name: f, text: fs.readFileSync(path.join(WORKFLOWS, f), 'utf8') }));
}

console.log('\nTesting action-pins...\n');

(async () => {
  const files = yamlFiles();
  check(files.length > 0, 'no hay workflows en .github/workflows');

  await test('todo use de una action va pineado por SHA de 40 hex (o es local/docker)', async () => {
    const malos = [];
    for (const { name, text } of files) {
      text.split('\n').forEach((line, i) => {
        const m = line.match(/^\s*uses:\s+(\S+)/);
        if (!m) return;
        const ref = m[1];
        if (ref.startsWith('./') || ref.startsWith('docker://')) return;
        if (!/@[0-9a-f]{40}(\s|$)/.test(ref)) malos.push(`${name}:${i + 1} ${ref}`);
      });
    }
    check(malos.length === 0, `uses sin SHA: ${malos.join(', ')}`);
  });

  await test('cada checkout deja persist-credentials: false', async () => {
    const malos = [];
    for (const { name, text } of files) {
      const co = (text.match(/uses:\s+actions\/checkout@/g) || []).length;
      const pc = (text.match(/persist-credentials:\s*false/g) || []).length;
      if (co !== pc) malos.push(`${name}: ${co} checkouts vs ${pc} persist-credentials`);
    }
    check(malos.length === 0, malos.join(' | '));
  });

  await test('los 3 workflows declaran permissions contents: read a nivel workflow', async () => {
    const malos = [];
    for (const { name, text } of files) {
      if (!/^permissions:\n {2}contents: read/m.test(text)) malos.push(name);
    }
    check(malos.length === 0, `sin permissions: ${malos.join(', ')}`);
  });

  await test('el guard de sesión de Playwright (E22) sigue en el pre-commit', async () => {
    const txt = fs.readFileSync(PRECOMMIT, 'utf8');
    check(/storageState\.json\|/.test(txt), 'falta el case de storageState');
    check(/\.auth\/\*/.test(txt), 'falta el case de .auth');
    check(/\.storage\/\*/.test(txt), 'falta el case de .storage');
  });

  await test('.gitignore cubre las rutas de sesión de Playwright', async () => {
    const txt = fs.readFileSync(GITIGNORE, 'utf8');
    for (const p of ['test-results/', '.storage/', '.auth/', 'storageState.json']) {
      check(new RegExp(`^${p.replace(/[.\/]/g, '\\$&')}$`, 'm').test(txt), `.gitignore sin ${p}`);
    }
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})();
