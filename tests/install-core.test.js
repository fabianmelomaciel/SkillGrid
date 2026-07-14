const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  DEPENDENCIES, CODE_IGNORES,
  parseFrontmatter, normalizePlatform, loadProfileSkills,
  detectPlatforms, checkDependencies, setupGitIgnores,
} = require('../scripts/install-core.js');

const ROOT = path.join(__dirname, '..');
let passed = 0;
let failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  OK    ${name}`); passed++; }
  catch (e) { console.log(`  FAIL  ${name}: ${e.message}`); failed++; }
}

function check(cond, msg) { if (!cond) throw new Error(msg); }

console.log('\nTesting install-core.js...\n');

test('DEPENDENCIES: all required fields', () => {
  check(DEPENDENCIES.length >= 14, `expected >=14 deps, got ${DEPENDENCIES.length}`);
  for (const d of DEPENDENCIES) {
    check(typeof d.name === 'string' && d.name.length > 0, `dep missing name`);
    check(['high', 'medium', 'low'].includes(d.severity), `dep ${d.name}: invalid severity`);
    check(typeof d.desc === 'string' && d.desc.length > 0, `dep ${d.name}: missing desc`);
  }
});

test('DEPENDENCIES: pinned tools have correct structure', () => {
  const pinned = DEPENDENCIES.filter(d => d.pin);
  check(pinned.length >= 6, `expected >=6 pinned deps, got ${pinned.length}`);
  for (const d of pinned) {
    check(typeof d.pin === 'string' && d.pin.includes('.'), `dep ${d.name}: invalid pin '${d.pin}'`);
  }
});

test('CODE_IGNORES: all entries are strings', () => {
  check(CODE_IGNORES.length >= 12, `expected >=12 ignores, got ${CODE_IGNORES.length}`);
  for (const l of CODE_IGNORES) {
    check(typeof l === 'string', `ignore entry is not a string`);
  }
  check(CODE_IGNORES.some(l => l.includes('.codegraph')), 'missing .codegraph ignore');
  check(CODE_IGNORES.some(l => l.includes('CODEX.md')), 'missing CODEX.md ignore');
});

test('parseFrontmatter: parses a valid SKILL.md', () => {
  const testFile = path.join(ROOT, 'skills', 'humanizer', 'SKILL.md');
  const fm = parseFrontmatter(testFile);
  check(fm !== null, 'should return object');
  check(fm.name === 'humanizer', `expected name=humanizer, got ${fm.name}`);
  check(fm.category === 'core' || fm.category === 'agent' || fm.category === 'design', `invalid category ${fm.category}`);
  check(fm.status === 'stable', `expected stable, got ${fm.status}`);
});

test('parseFrontmatter: returns null for file without frontmatter', () => {
  const tmp = path.join(ROOT, 'scratch_test_no_fm.md');
  fs.writeFileSync(tmp, 'no frontmatter here\n');
  const result = parseFrontmatter(tmp);
  fs.unlinkSync(tmp);
  check(result === null, 'should return null');
});

test('normalizePlatform: maps known platforms', () => {
  check(normalizePlatform('opencode') === 'opencode');
  check(normalizePlatform('antigravity') === 'antigravity');
  check(normalizePlatform('antigravity (gemini)') === 'antigravity');
  check(normalizePlatform('antigravity-ide') === 'antigravity-ide');
  check(normalizePlatform('claude-code') === 'claude-code');
});

test('normalizePlatform: returns unknown as-is', () => {
  check(normalizePlatform('custom') === 'custom');
});

test('normalizePlatform: empty/undefined returns generic', () => {
  check(normalizePlatform('') === 'generic');
  check(normalizePlatform(undefined) === 'generic');
  check(normalizePlatform(null) === 'generic');
});

test('loadProfileSkills: invalid profile returns null', () => {
  const result = loadProfileSkills('nonexistent_profile_xyz');
  check(result === null, 'should return null for invalid profile');
});

test('loadProfileSkills: valid profile returns Set', () => {
  const bundlesPath = path.join(ROOT, 'skills', 'bundles', 'index.json');
  if (!fs.existsSync(bundlesPath)) return;
  const bundles = JSON.parse(fs.readFileSync(bundlesPath, 'utf-8'));
  const profiles = Object.keys(bundles.profiles || {});
  if (profiles.length === 0) return;
  const result = loadProfileSkills(profiles[0]);
  check(result instanceof Set, `should return Set, got ${typeof result}`);
  check(result.size > 0, 'profile should have skills');
});

test('detectPlatforms: returns array', () => {
  const result = detectPlatforms();
  check(Array.isArray(result), 'should return array');
  for (const p of result) {
    check(typeof p.name === 'string', `platform missing name`);
    check(typeof p.path === 'string' && p.path.length > 0, `platform ${p.name} missing path`);
  }
});

test('cli --deps-only exits cleanly', () => {
  const out = execSync('node scripts/install-core.js --deps-only', { cwd: ROOT, encoding: 'utf-8', timeout: 15000 });
  check(out.includes('Dependency check'), 'should print dependency check');
  check(out.includes('git'), 'should check git');
  check(out.includes('node'), 'should check node');
});

test('cli --help prints usage', () => {
  const out = execSync('node scripts/install-core.js --help', { cwd: ROOT, encoding: 'utf-8', timeout: 10000 });
  check(out.includes('Usage:'), 'should show usage');
  check(out.includes('--target'), 'should mention --target');
  check(out.includes('--profile'), 'should mention --profile');
});

test('setupGitIgnores: creates exclusions in temp dir', () => {
  const tmpDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'sg-test-'));
  setupGitIgnores(tmpDir);
  const gitignorePath = path.join(tmpDir, '.gitignore');
  check(fs.existsSync(gitignorePath), '.gitignore should exist');
  const content = fs.readFileSync(gitignorePath, 'utf-8');
  check(content.includes('.codegraph/'), 'should contain .codegraph/');
  check(content.includes('CODEX.md'), 'should contain CODEX.md');
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) { process.exit(1); }
