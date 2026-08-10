const mod = require('../scripts/install-omniroute.js');

let passed = 0;
let failed = 0;
const pending = [];

function test(name, fn) {
  try {
    const r = fn();
    if (r && typeof r.then === 'function') {
      pending.push(r.then(
        () => { console.log(`  OK    ${name}`); passed++; },
        (e) => { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
      ));
    } else {
      console.log(`  OK    ${name}`); passed++;
    }
  } catch (e) {
    console.log(`  FAIL  ${name}: ${e.message}`); failed++;
  }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\nTesting install-omniroute.js...\n');

test('generateEnvContent: claves y formato', () => {
  const c = mod.generateEnvContent();
  check(c.includes('JWT_SECRET='), 'falta JWT_SECRET');
  check(c.includes('API_KEY_SECRET='), 'falta API_KEY_SECRET');
  check(c.includes('STORAGE_ENCRYPTION_KEY='), 'falta STORAGE_ENCRYPTION_KEY');
  check(c.includes('INITIAL_PASSWORD='), 'falta INITIAL_PASSWORD');
  check(c.includes('API_HOST=127.0.0.1'), 'falta API_HOST');
  const jwt = c.match(/^JWT_SECRET=([0-9a-f]{96})$/m);
  check(jwt, 'JWT_SECRET debe tener exactamente 96 chars hex');
  const pass = c.match(/^INITIAL_PASSWORD=(.*)$/m);
  check(pass && pass[1].startsWith('Cambiame-'), 'INITIAL_PASSWORD debe empezar con Cambiame-');
  check(c.includes('# MITM/TPROXY: OFF'), 'falta el comentario de config sample');
});

test('mergeClaudeConfig: preserva props desconocidas y setea base', () => {
  const src = JSON.stringify({ env: { ANTHROPIC_MODEL: 'x' }, extraFlag: true, baseUrl: 'http://old' });
  const out = mod.mergeClaudeConfig(src, 'sk-abc', 'auto');
  check(out.env && out.env.ANTHROPIC_MODEL === 'x', 'env debe preservarse');
  check(out.extraFlag === true, 'extraFlag debe preservarse');
  check(out.baseUrl === 'http://localhost:20128/v1', `baseUrl incorrecto: ${out.baseUrl}`);
  check(out.authToken === 'sk-abc', `authToken incorrecto: ${out.authToken}`);
  check(Array.isArray(out.models) && out.models[0].id === 'auto', 'models debe ser [{id: auto}]');
});

test('mergeClaudeConfig: idempotente en doble aplicación', () => {
  const src = JSON.stringify({ env: { FOO: '1' }, apiKeyAlt: 7 });
  const once = mod.mergeClaudeConfig(src, 'sk-x', 'auto');
  const twice = mod.mergeClaudeConfig(JSON.stringify(once), 'sk-x', 'auto');
  check(JSON.stringify(once) === JSON.stringify(twice), 'doble aplicación debe ser estable');
});

test('mergeOpenCodeConfig: preserva skills.paths y providers existentes', () => {
  const src = {
    $schema: 'https://x',
    skills: { paths: ['C:\\a'] },
    provider: { other: { name: 'X', npm: '@ai-sdk/y' } },
  };
  const out = mod.mergeOpenCodeConfig(src, 'sk-test');
  check(JSON.stringify(out.skills) === JSON.stringify(src.skills), 'skills.paths debe preservarse');
  check(out.provider.other && out.provider.other.name === 'X', 'provider.other debe preservarse');
  check(out.provider.omniroute, 'falta provider.omniroute');
  check(out.provider.omniroute.name === 'OmniRoute', 'nombre de provider incorrecto');
  check(out.provider.omniroute.options.baseURL === 'http://localhost:20128/v1', 'baseURL incorrecto');
  check(out.provider.omniroute.options.apiKey === 'sk-test', 'apiKey incorrecta');
  check(out.provider.omniroute.models['auto/coding'], 'falta modelo auto/coding');
  check(
    out.provider.omniroute.models['auto/coding'].limit &&
    out.provider.omniroute.models['auto/coding'].limit.context === 1048576,
    'modelo auto/coding debe tener limit.context',
  );
  check(Array.isArray(out.provider.omniroute.models) === false, 'models debe ser objeto clave-valor, no array');
  const l = out.provider.omniroute.models;
  check(
    l['oc/deepseek-v4-flash-free'].limit.context === 1000000,
    'deepseek-free debe tener 1M de contexto (no inventado)',
  );
  check(
    l['oc/big-pickle'].limit.context === 200000,
    'big-pickle debe tener 200k de contexto (no inventado)',
  );
});

test('mergeOpenCodeConfig: no duplica un omniroute existente', () => {
  const src = { provider: { omniroute: { name: 'Old', npm: 'x' } } };
  const out = mod.mergeOpenCodeConfig(src, 'sk-2');
  check(out.provider.omniroute.name === 'Old', 'debe mantener el omniroute existente');
  const names = Object.keys(out.provider);
  check(names.filter(n => n === 'omniroute').length === 1, 'omniroute duplicado');
});

test('mergeOpenCodeConfig: tolera config vacía', () => {
  const out = mod.mergeOpenCodeConfig(null, 'sk-3');
  check(out.provider.omniroute, 'debe crear provider.omniroute desde cero');
});

test('serverAlreadyRunning: puerto muerto devuelve false', async () => {
  const r = await mod.serverAlreadyRunning(1);
  check(r === false, `expected false, got ${r}`);
});

test('exports: API pública completa', () => {
  const names = [
    'generateEnvContent', 'mergeClaudeConfig', 'mergeOpenCodeConfig',
    'serverAlreadyRunning', 'ensureInstalled', 'ensureEnvFile', 'ensureServer',
    'createApiKey', 'configureClaude', 'configureOpenCode', 'ensureAutoStart', 'main',
  ];
  for (const n of names) check(typeof mod[n] === 'function', `falta export '${n}'`);
});

Promise.all(pending).then(() => {
  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) { process.exit(1); }
});