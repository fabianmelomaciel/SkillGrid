const fs = require('fs');
const path = require('path');
const { walkSkillFiles } = require('./lib/walk-skills');

const VALID_CATEGORIES = ['core', 'design', 'agent'];
const VALID_STATUSES = ['stable', 'beta', 'experimental', 'deprecated', 'draft'];
const VALID_RISK_LEVELS = ['safe', 'critical'];
const ROOT = path.join(__dirname, '..');

let errors = [];
let skillCount = 0;

function validateSkill(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    errors.push(`${rel(file)}: missing YAML frontmatter`);
    return;
  }

  const fm = match[1];
  const required = ['name:', 'description:', 'category:', 'status:', 'risk_level:'];

  required.forEach(field => {
    if (!fm.includes(field)) {
      errors.push(`${rel(file)}: missing '${field.replace(':', '')}' field`);
    }
  });

  // Validate category value
  const catMatch = fm.match(/^category:\s*(.+)$/m);
  const category = catMatch ? catMatch[1].trim() : null;
  if (catMatch) {
    if (!VALID_CATEGORIES.includes(category)) {
      errors.push(`${rel(file)}: invalid category '${category}'. Valid: ${VALID_CATEGORIES.join(', ')}`);
    }
  }

  // Validate status value
  const stMatch = fm.match(/^status:\s*(.+)$/m);
  if (stMatch) {
    const val = stMatch[1].trim();
    if (!VALID_STATUSES.includes(val)) {
      errors.push(`${rel(file)}: invalid status '${val}'. Valid: ${VALID_STATUSES.join(', ')}`);
    }
  }

  // Validate risk_level value
  const rlMatch = fm.match(/^risk_level:\s*(.+)$/m);
  if (rlMatch) {
    const val = rlMatch[1].trim();
    if (!VALID_RISK_LEVELS.includes(val)) {
      errors.push(`${rel(file)}: invalid risk_level '${val}'. Valid: ${VALID_RISK_LEVELS.join(', ')}`);
    }
  }

  if (category === 'agent') {
    const lower = content.toLowerCase();
    const hasCodegraphStartup =
      lower.includes('codegraph-startup.md') ||
      lower.includes('automatic codegraph startup');
    if (!hasCodegraphStartup) {
      errors.push(`${rel(file)}: category 'agent' must include CodeGraph startup protocol (reference 'skills/shared/codegraph-startup.md' or include 'AUTOMATIC CODEGRAPH STARTUP')`);
    }
  }

  skillCount++;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function walk(dir) {
  walkSkillFiles(dir).forEach(validateSkill);
}

if (require.main === module) {
  walk(path.join(ROOT, 'skills'));
  if (errors.length > 0) {
    console.error(`\nSkill validation failed (${errors.length} errors):\n`);
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  } else {
    console.log(`\nAll ${skillCount} skills valid.`);
  }
}

module.exports = { validateSkill, walk, rel, errors, skillCount, VALID_CATEGORIES, VALID_STATUSES, VALID_RISK_LEVELS };
