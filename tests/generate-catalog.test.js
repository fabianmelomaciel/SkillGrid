const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseFrontmatter, resolveCatalogVersion } = require('../scripts/generate-catalog.js');

let passed = 0;
let failed = 0;

function check(condition, msg) {
  if (!condition) throw new Error(msg);
}

function test(name, fn) {
  try {
    fn();
    console.log(`  OK    ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL  ${name}: ${e.message}`);
    failed++;
  }
}

function withTempFile(content, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skillgrid-catalog-test-'));
  const file = path.join(dir, 'SKILL.md');
  fs.writeFileSync(file, content, 'utf-8');
  try {
    return fn(file);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

console.log('\nTesting generate-catalog.js...\n');

test('parseFrontmatter: parses basic scalar fields', () => {
  withTempFile(
    '---\nname: my-skill\ndescription: "Use when testing"\ncategory: core\nstatus: stable\nrisk_level: safe\n---\n\n## Core\nbody\n',
    (file) => {
      const meta = parseFrontmatter(file);
      check(meta.name === 'my-skill', `expected name my-skill, got ${meta.name}`);
      check(meta.description === 'Use when testing', `expected description, got ${meta.description}`);
      check(meta.category === 'core', `expected category core, got ${meta.category}`);
      check(meta.status === 'stable', `expected status stable, got ${meta.status}`);
      check(meta.risk_level === 'safe', `expected risk_level safe, got ${meta.risk_level}`);
    }
  );
});

test('parseFrontmatter: parses inline object (token_estimate)', () => {
  withTempFile(
    '---\nname: my-skill\ntoken_estimate: { input: 1200, output: 400 }\n---\n\n## Core\n',
    (file) => {
      const meta = parseFrontmatter(file);
      check(typeof meta.token_estimate === 'object', 'token_estimate should parse as object');
      check(meta.token_estimate.input === 1200, `expected input 1200, got ${meta.token_estimate.input}`);
      check(meta.token_estimate.output === 400, `expected output 400, got ${meta.token_estimate.output}`);
    }
  );
});

test('parseFrontmatter: parses YAML block scalar (>)', () => {
  withTempFile(
    '---\nname: my-skill\ndescription: >\n  first line\n  second line\n---\n\n## Core\n',
    (file) => {
      const meta = parseFrontmatter(file);
      check(meta.description === 'first line second line', `unexpected description: ${meta.description}`);
    }
  );
});

test('parseFrontmatter: returns null when no frontmatter present', () => {
  withTempFile('# Just a heading\n\nno frontmatter here\n', (file) => {
    check(parseFrontmatter(file) === null, 'expected null for missing frontmatter');
  });
});

test('parseFrontmatter: handles CRLF line endings', () => {
  withTempFile(
    '---\r\nname: my-skill\r\ncategory: core\r\n---\r\n\r\n## Core\r\n',
    (file) => {
      const meta = parseFrontmatter(file);
      check(meta.name === 'my-skill', `expected name my-skill, got ${meta.name}`);
      check(meta.category === 'core', `expected category core, got ${meta.category}`);
    }
  );
});

test('resolveCatalogVersion: reads version from package.json', () => {
  const version = resolveCatalogVersion();
  check(typeof version === 'string' && /^\d+\.\d+\.\d+$/.test(version), `unexpected version format: ${version}`);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
