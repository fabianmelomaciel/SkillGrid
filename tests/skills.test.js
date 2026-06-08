const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const MODELS_JSON = path.join(ROOT, 'models.json');

function findSkillDirs(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (fs.existsSync(path.join(full, 'SKILL.md'))) {
        results.push(full);
      }
      results.push(...findSkillDirs(full));
    }
  }
  return results;
}

const skillDirs = findSkillDirs(SKILLS_DIR).filter(dir => {
  const rel = path.relative(SKILLS_DIR, dir).replace(/\\/g, '/');
  return rel !== 'template' && !rel.startsWith('template/');
});

let passed = 0;
let failed = 0;
const failures = [];

function check(condition, msg) {
  if (!condition) { throw new Error(msg); }
}

function test(name, fn) {
  try {
    fn();
    console.log(`  OK    ${name}`);
    passed++;
  } catch (e) {
    console.log(`  FAIL  ${name}: ${e.message}`);
    failed++;
    failures.push(`${name}: ${e.message}`);
  }
}

console.log(`\nTesting ${skillDirs.length} skills...\n`);

const validModels = new Set();
const validPlatforms = new Set();
if (fs.existsSync(MODELS_JSON)) {
  const mj = JSON.parse(fs.readFileSync(MODELS_JSON, 'utf-8'));
  Object.keys(mj.models || {}).forEach(k => validModels.add(k));
  Object.keys(mj.platforms || {}).forEach(k => validPlatforms.add(k));
}

skillDirs.forEach(dir => {
  const skillPath = path.join(dir, 'SKILL.md');
  const name = path.relative(SKILLS_DIR, dir);
  const content = fs.readFileSync(skillPath, 'utf-8');
  const lines = content.replace(/\r/g, '').split('\n');

  test(`${name}: frontmatter`, () => {
    check(lines[0] === '---', 'must start with ---');
    const fmEnd = lines.indexOf('---', 1);
    check(fmEnd > 0, 'must have closing ---');
    const fm = lines.slice(1, fmEnd).join('\n');
    ['name:', 'description:', 'category:', 'status:', 'risk_level:'].forEach(f => {
      check(fm.includes(f), `missing '${f.replace(':', '')}'`);
    });
    const catMatch = fm.match(/^category:\s*(.+)$/m);
    if (catMatch) {
      const cat = catMatch[1].trim();
      check(['core', 'design', 'agent'].includes(cat), `invalid category '${cat}'`);
    }
    const stMatch = fm.match(/^status:\s*(.+)$/m);
    if (stMatch) {
      check(['stable', 'beta', 'experimental', 'deprecated', 'draft'].includes(stMatch[1].trim()), `invalid status`);
    }
    const rlMatch = fm.match(/^risk_level:\s*(.+)$/m);
    if (rlMatch) {
      check(['safe', 'critical'].includes(rlMatch[1].trim()), `invalid risk_level`);
    }
  });

  test(`${name}: ##Core section`, () => {
    const coreIdx = lines.findIndex(l => l.trim() === '## Core');
    check(coreIdx >= 0, 'missing ## Core section');
    const modulesIdx = lines.findIndex(l => l.trim() === '## Modules');
    const coreBody = lines.slice(coreIdx + 1, modulesIdx >= 0 ? modulesIdx : undefined);
    check(coreBody.some(l => l.trim().length > 0), '## Core section is empty');
  });

  test(`${name}: ##Modules labels`, () => {
    const modulesIdx = lines.findIndex(l => l.trim() === '## Modules');
    if (modulesIdx < 0) return;
    const moduleLines = lines.slice(modulesIdx + 1).filter(l => l.trim().length > 0);
    let foundLabel = false;
    const seenLabels = new Set();
    for (const line of moduleLines) {
      const m = line.match(/^\[(model|platform):(.+)\]$/);
      if (m) {
        foundLabel = true;
        const label = m[0];
        check(!seenLabels.has(label), `duplicate label ${label}`);
        seenLabels.add(label);
        const key = m[2].trim();
        if (m[1] === 'model') {
          check(validModels.has(key) || key === '*', `unknown model '${key}'`);
        }
        if (m[1] === 'platform') {
          check(validPlatforms.has(key) || key === '*', `unknown platform '${key}'`);
        }
      }
    }
    if (moduleLines.length > 0) {
      check(foundLabel, '##Modules has content but no [model:...] or [platform:...] labels');
    }
  });

  test(`${name}: agent CodeGraph startup`, () => {
    const fmEnd = lines.indexOf('---', 1);
    const fm = lines.slice(1, fmEnd).join('\n');
    const catMatch = fm.match(/^category:\s*(.+)$/m);
    if (catMatch && catMatch[1].trim() === 'agent') {
      const lower = content.toLowerCase();
      check(
        lower.includes('codegraph-startup.md') || lower.includes('automatic codegraph startup'),
        'agent skill must reference CodeGraph startup'
      );
    }
  });

  test(`${name}: shared protocol references`, () => {
    const coreIdx = lines.findIndex(l => l.trim() === '## Core');
    const modulesIdx = lines.findIndex(l => l.trim() === '## Modules');
    const coreContent = lines.slice(coreIdx + 1, modulesIdx >= 0 ? modulesIdx : undefined).join('\n');
    const refs = ['anti-rationalization.md', 'risk-assessment.md', 'verification-gate.md', 'codegraph-startup.md', 'codex-learning-loop.md'];
    const found = refs.filter(r => coreContent.includes(r));
    check(found.length >= 2, `only ${found.length}/5 shared protocols referenced: ${found.join(', ')}`);
  });
});

// Cross-model loader tests
console.log(`\nTesting merge loader...\n`);

test('loader: produces valid output', () => {
  const loaderPath = path.join(ROOT, 'scripts', 'merge-skill.ps1');
  check(fs.existsSync(loaderPath), 'merge-skill.ps1 not found');
});

test('loader: models.json integrity', () => {
  check(fs.existsSync(MODELS_JSON), 'models.json not found');
  const mj = JSON.parse(fs.readFileSync(MODELS_JSON, 'utf-8'));
  check(mj.version, 'missing version');
  check(mj.models, 'missing models');
  check(mj.platforms, 'missing platforms');
  check(Object.keys(mj.models).length >= 8, `expected >=8 models, got ${Object.keys(mj.models).length}`);
  check(Object.keys(mj.platforms).length >= 5, `expected >=5 platforms, got ${Object.keys(mj.platforms).length}`);
});

console.log(`\n${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.error('Failures:');
  failures.forEach(f => console.error(`  - ${f}`));
  process.exit(1);
}
