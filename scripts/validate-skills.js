const fs = require('fs');
const path = require('path');

const VALID_CATEGORIES = ['core', 'design', 'agent'];
const VALID_STATUSES = ['stable', 'beta', 'experimental', 'deprecated'];
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
  const required = ['name:', 'description:', 'category:', 'status:'];

  required.forEach(field => {
    if (!fm.includes(field)) {
      errors.push(`${rel(file)}: missing '${field.replace(':', '')}' field`);
    }
  });

  // Validate category value
  const catMatch = fm.match(/^category:\s*(.+)$/m);
  if (catMatch) {
    const val = catMatch[1].trim();
    if (!VALID_CATEGORIES.includes(val)) {
      errors.push(`${rel(file)}: invalid category '${val}'. Valid: ${VALID_CATEGORIES.join(', ')}`);
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

  skillCount++;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'SKILL.md') validateSkill(full);
  }
}

walk(path.join(ROOT, 'skills'));

if (errors.length > 0) {
  console.error(`\nSkill validation failed (${errors.length} errors):\n`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log(`\nAll ${skillCount} skills valid.`);
}
