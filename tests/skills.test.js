const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');

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

const skillDirs = findSkillDirs(SKILLS_DIR);

// Basic structure tests
console.log(`\nTesting ${skillDirs.length} skills...\n`);
let passed = 0;
let failed = 0;

skillDirs.forEach(dir => {
  const skillPath = path.join(dir, 'SKILL.md');
  const name = path.relative(SKILLS_DIR, dir);

  try {
    const content = fs.readFileSync(skillPath, 'utf-8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    if (!match) {
      console.log(`  FAIL  ${name}: missing frontmatter`);
      failed++; return;
    }

    const fm = match[1];
    const checks = [
      ['name', fm.includes('name:')],
      ['description', fm.includes('description:')],
      ['category', fm.includes('category:')],
      ['status', fm.includes('status:')],
      ['risk_level', fm.includes('risk_level:')],
    ];

    const missing = checks.filter(c => !c[1]).map(c => c[0]);
    if (missing.length > 0) {
      console.log(`  FAIL  ${name}: missing fields: ${missing.join(', ')}`);
      failed++;
    } else {
      console.log(`  OK    ${name}`);
      passed++;
    }
  } catch (e) {
    console.log(`  FAIL  ${name}: ${e.message}`);
    failed++;
  }
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
