const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..');
const PLUGIN = path.join(ROOT, '.opencode', 'plugins', 'session-memory.js');
const TEMP = [];

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try { await fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function carpeta() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sm-test-'));
  TEMP.push(dir);
  return dir;
}

// el plugin es ESM y el paquete es CommonJS: lo pasamos por .mjs para que
// cualquier versión de node lo parsee igual que lo hace opencode
async function cargar() {
  const copia = path.join(os.tmpdir(), `sm-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
  fs.copyFileSync(PLUGIN, copia);
  TEMP.push(copia);
  const mod = await import(pathToFileURL(copia).href);
  return mod.SessionMemory;
}

const EVOLUCION = [
  '# Evolución',
  '',
  'Este texto cita `## Abiertas` en prosa, como pasa en el archivo real.',
  '',
  '## Abiertas',
  '',
  '- E5 | docs | readme hardcodea conteos | P1 | 2026-10-01 | README.md:6',
  '- E12 | memoria | falta el nudge | P1 | 2026-10-02 | x:1',
  '',
  '## Cerradas',
  '',
  '- E1 | calidad | vieja | P1 | 2026-10-01 | a:1 | cerrado 2026-10-01 | b:1',
  '',
].join('\n');

const CODEX = [
  '# CODEX',
  '',
  '## 💻 Mission Logs',
  '',
  'Esto menciona `## Deliberaciones` pero es prosa, no el heading.',
  '',
  '## Deliberaciones',
  '',
  '- 2026-10-02 | prueba de fila | veredicto | archivo.md:1 | estado: resuelto',
  '',
].join('\n');

console.log('\nTesting session-memory plugin...\n');

(async () => {
  const SessionMemory = await cargar();

  await test('el hook de compactación trae las filas abiertas, no el preámbulo', async () => {
    const raiz = carpeta();
    fs.writeFileSync(path.join(raiz, 'EVOLUCION.md'), EVOLUCION);
    fs.writeFileSync(path.join(raiz, 'CODEX.md'), CODEX);
    const plugin = await SessionMemory({ directory: raiz });
    const output = { context: [] };
    await plugin['experimental.session.compacting']({}, output);
    const joined = output.context.join('\n');
    check(joined.includes('- E5'), 'falta la fila E5');
    check(joined.includes('- E12'), 'falta la fila E12');
    check(!joined.includes('cita `## Abiertas` en prosa'), 'metió el preámbulo en vez de las filas');
    check(joined.includes('para seguir desde donde estábamos'), 'falta el header de Deliberaciones');
    check(joined.includes('- 2026-10-02 | prueba de fila'), 'no llegó la fila de CODEX');
    check(!joined.includes('es prosa, no el heading'), 'metió la prosa de Mission Logs');
  });

  await test('sin CODEX ni EVOLUCION no revienta y no inyecta nada', async () => {
    const plugin = await SessionMemory({ directory: carpeta() });
    const output = { context: [] };
    await plugin['experimental.session.compacting']({}, output);
    check(output.context.length === 0, 'inyectó algo con los archivos ausentes');
  });

  await test('session.idle deja el breadcrumb con el id de sesión', async () => {
    const raiz = carpeta();
    const plugin = await SessionMemory({ directory: raiz });
    await plugin.event({ event: { type: 'session.idle', properties: { sessionID: 'abc123' } } });
    const breadcrumb = path.join(raiz, '.opencode', 'state', 'last-session.md');
    check(fs.existsSync(breadcrumb), 'no escribió el breadcrumb');
    check(fs.readFileSync(breadcrumb, 'utf8').includes('abc123'), 'no guardó el sessionID');
  });

  await test('otro tipo de evento se ignora', async () => {
    const raiz = carpeta();
    const plugin = await SessionMemory({ directory: raiz });
    await plugin.event({ event: { type: 'session.created' } });
    check(!fs.existsSync(path.join(raiz, '.opencode', 'state', 'last-session.md')), 'escribió con un evento que no era idle');
  });

  TEMP.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }));

  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})();
