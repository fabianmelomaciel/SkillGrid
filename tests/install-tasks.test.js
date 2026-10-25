const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SCRIPT = path.join(ROOT, 'scripts', 'install-tasks.js');
const TEMP = [];

let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function carpeta() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'it-test-'));
  TEMP.push(dir);
  return dir;
}

function correr(src, dest) {
  return spawnSync(process.execPath, [SCRIPT, 'install-commands', src, dest], { encoding: 'utf8' });
}

console.log('\nTesting install-commands...\n');

test('instala los .md de commands/ en .opencode/commands del proyecto', () => {
  const src = carpeta();
  const dest = carpeta();
  fs.mkdirSync(path.join(src, 'commands'));
  fs.writeFileSync(path.join(src, 'commands', 'codex-log.md'), '---\ndescription: prueba\n---\nHola\n');
  fs.writeFileSync(path.join(src, 'commands', 'no-va.txt'), 'x');
  const r = correr(src, dest);
  check(r.status === 0, `exit ${r.status}: ${(r.stderr || '').trim()}`);
  check(fs.existsSync(path.join(dest, '.opencode', 'commands', 'codex-log.md')), 'no copió codex-log.md');
  check(!fs.existsSync(path.join(dest, '.opencode', 'commands', 'no-va.txt')), 'copió un archivo que no es .md');
});

test('sin directorio commands no revienta y lo avisa', () => {
  const src = carpeta();
  const dest = carpeta();
  const r = correr(src, dest);
  check(r.status === 0, `exit ${r.status}: ${(r.stderr || '').trim()}`);
  check((r.stdout || '').includes('No se encuentra'), `no avisó: ${r.stdout}`);
});

test('commands/ y .opencode/commands/ están sincronizadas', () => {
  const srcDir = path.join(ROOT, 'commands');
  const dstDir = path.join(ROOT, '.opencode', 'commands');
  const fuentes = fs.readdirSync(srcDir).filter((f) => path.extname(f).toLowerCase() === '.md');
  check(fuentes.length > 0, 'no hay commands en la raíz');
  fuentes.forEach((f) => {
    const destino = path.join(dstDir, f);
    check(fs.existsSync(destino), `falta .opencode/commands/${f}`);
    check(
      fs.readFileSync(path.join(srcDir, f), 'utf8') === fs.readFileSync(destino, 'utf8'),
      `${f} difiere entre commands/ y .opencode/commands/`,
    );
  });
});

function generarAgentes(src, dest) {
  return spawnSync(process.execPath, [SCRIPT, 'generate-agents', src, dest], { encoding: 'utf8' });
}

function agenteDePrueba(src, nombre, frontmatter) {
  const dir = path.join(src, 'skills', nombre);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'SKILL.md'),
    `---\nname: ${nombre}\n${frontmatter}\ncategory: agent\n---\n\nCuerpo del agente.\n`,
    'utf8',
  );
}

console.log('\nTesting generate-agents...\n');

test('genera el agente y su comando /agente para abrirlo desde la TUI', () => {
  const src = carpeta();
  const dest = carpeta();
  agenteDePrueba(src, 'prueba-agente', 'description: Un agente de prueba');

  const r = generarAgentes(src, path.join(dest, 'agents'));
  check(r.status === 0, `exit ${r.status}: ${(r.stderr || '').trim()}`);

  const agente = path.join(dest, 'agents', 'prueba-agente.md');
  const comando = path.join(dest, 'commands', 'prueba-agente.md');
  check(fs.existsSync(agente), 'no generó el agente');
  check(fs.existsSync(comando), 'no generó el comando');

  const texto = fs.readFileSync(comando, 'utf8');
  check(/^agent: prueba-agente$/m.test(texto), 'el comando no apunta al agente');
  check(/^subagent: false$/m.test(texto), 'el comando no corre en la sesión actual');
  check(texto.includes('$ARGUMENTS'), 'el comando no recibe argumentos');

  const desc = texto.match(/^description: (.*)$/m);
  check(desc, 'el comando no tiene descripción');
  check(JSON.parse(desc[1]) === 'Un agente de prueba', 'la descripción no es YAML válido');
});

test('lee las descripciones multilínea sin dejarlas vacías', () => {
  const src = carpeta();
  const dest = carpeta();
  agenteDePrueba(src, 'agente-multilinea', 'description: >\n  Primera parte\n  segunda parte');

  const r = generarAgentes(src, path.join(dest, 'agents'));
  check(r.status === 0, `exit ${r.status}: ${(r.stderr || '').trim()}`);

  const texto = fs.readFileSync(path.join(dest, 'agents', 'agente-multilinea.md'), 'utf8');
  check(texto.includes('"Primera parte segunda parte"'), 'perdió el texto de la descripción');
});

TEMP.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }));

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
