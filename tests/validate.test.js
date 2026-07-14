const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const v = require('../scripts/validate-skills.js');

const ROOT = path.join(__dirname, '..');
let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

function makeTempSkill(fields) {
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'vg-test-'));
  const fm = ['---', ...Object.entries(fields).map(([k, v]) => `${k}: ${v}`), '---', '', '## Core', '', '# Test Skill', '', 'Content'];
  const file = path.join(dir, 'SKILL.md');
  fs.writeFileSync(file, fm.join('\n'));
  return { dir, file };
}

function cleanup(dir) { fs.rmSync(dir, { recursive: true, force: true }); }

console.log('\nTesting validate-skills.js...\n');

test('VALID_CATEGORIES constant', () => {
  check(Array.isArray(v.VALID_CATEGORIES), 'should be array');
  check(v.VALID_CATEGORIES.includes('core'), 'should include core');
  check(v.VALID_CATEGORIES.includes('design'), 'should include design');
  check(v.VALID_CATEGORIES.includes('agent'), 'should include agent');
  check(v.VALID_CATEGORIES.length === 3, 'should have exactly 3');
});

test('VALID_STATUSES constant', () => {
  check(v.VALID_STATUSES.includes('stable'), 'should include stable');
  check(v.VALID_STATUSES.includes('beta'), 'should include beta');
  check(v.VALID_STATUSES.includes('experimental'), 'should include experimental');
  check(v.VALID_STATUSES.includes('deprecated'), 'should include deprecated');
  check(v.VALID_STATUSES.includes('draft'), 'should include draft');
});

test('VALID_RISK_LEVELS constant', () => {
  check(v.VALID_RISK_LEVELS.includes('safe'), 'should include safe');
  check(v.VALID_RISK_LEVELS.includes('critical'), 'should include critical');
  check(v.VALID_RISK_LEVELS.length === 2, 'should have exactly 2');
});

test('validateSkill: accepts valid frontmatter', () => {
  const { dir, file } = makeTempSkill({
    name: 'test-skill', description: 'A test skill',
    category: 'core', status: 'stable', risk_level: 'safe'
  });
  v.errors.length = 0;
  v.validateSkill(file);
  check(v.errors.length === 0, `expected 0 errors, got ${JSON.stringify(v.errors)}`);
  cleanup(dir);
});

test('validateSkill: rejects missing name', () => {
  const { dir, file } = makeTempSkill({
    description: 'no name', category: 'core', status: 'stable', risk_level: 'safe'
  });
  v.errors.length = 0; v.skillCount = 0;
  v.validateSkill(file);
  check(v.errors.length === 1, `expected 1 error, got ${v.errors.length}`);
  check(v.errors[0].includes('name'), 'error should mention name');
  cleanup(dir);
});

test('validateSkill: rejects invalid category', () => {
  const { dir, file } = makeTempSkill({
    name: 'bad-cat', description: 'x', category: 'invalid', status: 'stable', risk_level: 'safe'
  });
  v.errors.length = 0; v.skillCount = 0;
  v.validateSkill(file);
  check(v.errors.some(e => e.includes('invalid category')), 'should flag invalid category');
  cleanup(dir);
});

test('validateSkill: rejects invalid status', () => {
  const { dir, file } = makeTempSkill({
    name: 'bad-st', description: 'x', category: 'core', status: 'unknown', risk_level: 'safe'
  });
  v.errors.length = 0; v.skillCount = 0;
  v.validateSkill(file);
  check(v.errors.some(e => e.includes('invalid status')), 'should flag invalid status');
  cleanup(dir);
});

test('validateSkill: rejects invalid risk_level', () => {
  const { dir, file } = makeTempSkill({
    name: 'bad-rl', description: 'x', category: 'core', status: 'stable', risk_level: 'extreme'
  });
  v.errors.length = 0; v.skillCount = 0;
  v.validateSkill(file);
  check(v.errors.some(e => e.includes('invalid risk_level')), 'should flag invalid risk_level');
  cleanup(dir);
});

test('validateSkill: agent category must reference CodeGraph startup', () => {
  const { dir, file } = makeTempSkill({
    name: 'agent-no-cg', description: 'x', category: 'agent', status: 'stable', risk_level: 'critical'
  });
  v.errors.length = 0; v.skillCount = 0;
  v.validateSkill(file);
  check(v.errors.some(e => e.includes('CodeGraph')), 'agent must include CodeGraph startup');
  cleanup(dir);
});

test('validateSkill: agent with codegraph-startup.md reference passes', () => {
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'vg-test-'));
  const content = [
    '---', 'name: agent-ok', 'description: x', 'category: agent',
    'status: stable', 'risk_level: critical', '---', '',
    '## Core', '', '# Test', '', 'See skills/shared/codegraph-startup.md', ''
  ].join('\n');
  const file = path.join(dir, 'SKILL.md');
  fs.writeFileSync(file, content);
  v.errors.length = 0; v.skillCount = 0;
  v.validateSkill(file);
  check(v.errors.length === 0, `expected 0 errors, got ${JSON.stringify(v.errors)}`);
  cleanup(dir);
});

test('validateSkill: agent with AUTOMATIC CODEGRAPH STARTUP passes', () => {
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'vg-test-'));
  const content = [
    '---', 'name: agent-ok2', 'description: x', 'category: agent',
    'status: stable', 'risk_level: critical', '---', '',
    '## Core', '', '# Test', '', '> **AUTOMATIC CODEGRAPH STARTUP:** check cli', ''
  ].join('\n');
  const file = path.join(dir, 'SKILL.md');
  fs.writeFileSync(file, content);
  v.errors.length = 0; v.skillCount = 0;
  v.validateSkill(file);
  check(v.errors.length === 0, `expected 0 errors, got ${JSON.stringify(v.errors)}`);
  cleanup(dir);
});

test('validateSkill: missing frontmatter', () => {
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'vg-test-'));
  const file = path.join(dir, 'SKILL.md');
  fs.writeFileSync(file, 'no frontmatter here');
  v.errors.length = 0; v.skillCount = 0;
  v.validateSkill(file);
  check(v.errors.some(e => e.includes('missing YAML frontmatter')), 'should flag missing fm');
  cleanup(dir);
});

test('cli: exits 0 for valid skills dir', () => {
  const out = execSync('node scripts/validate-skills.js', { cwd: ROOT, encoding: 'utf-8', timeout: 10000 });
  check(out.includes('All'), 'should print success message');
  check(out.includes('skills valid'), 'should confirm validity');
});

test('walk: discovers SKILL.md files', () => {
  const dir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'vg-walk-'));
  const skillDir = path.join(dir, 'myskill');
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), [
    '---', 'name: walk-test', 'description: x', 'category: core',
    'status: stable', 'risk_level: safe', '---', '', '## Core', '', '# Test'
  ].join('\n'));
  v.errors.length = 0;
  v.walk(dir);
  check(v.errors.length === 0, `expected 0 errors, got ${JSON.stringify(v.errors)}`);
  cleanup(dir);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
