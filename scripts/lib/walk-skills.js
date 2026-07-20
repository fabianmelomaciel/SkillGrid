const fs = require('fs');
const path = require('path');

// Recursively finds SKILL.md files under `skillsRoot`, excluding the `template/` folder.
function walkSkillFiles(skillsRoot) {
  const results = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (dir === skillsRoot && entry.name === 'template') continue;
        walk(full);
      } else if (entry.name === 'SKILL.md') {
        results.push(full);
      }
    }
  }
  walk(skillsRoot);
  return results;
}

module.exports = { walkSkillFiles };
