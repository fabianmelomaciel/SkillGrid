const fs = require('fs');
const path = require('path');
const { walkSkillFiles } = require('./lib/walk-skills');

const ROOT = path.join(__dirname, '..');
const CATALOG_JSON_PATH = path.join(ROOT, 'catalog.json');
const PACKAGE_JSON_PATH = path.join(ROOT, 'package.json');

function resolveCatalogVersion() {
  if (fs.existsSync(PACKAGE_JSON_PATH)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
      if (pkg && typeof pkg.version === 'string' && pkg.version.trim().length > 0) {
        return pkg.version.trim();
      }
    } catch (err) {
      console.warn('Warning: Could not parse package.json version:', err.message);
    }
  }

  if (fs.existsSync(CATALOG_JSON_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(CATALOG_JSON_PATH, 'utf-8'));
      if (existing && typeof existing.version === 'string' && existing.version.trim().length > 0) {
        return existing.version.trim();
      }
    } catch (err) {
      console.warn('Warning: Could not parse catalog.json version:', err.message);
    }
  }

  return '1.0.0';
}

function parseFrontmatter(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const lines = match[1].split('\n').map(l => l.replace(/\r$/, ''));
  const fm = {};
  let currentKey = null;
  let currentVal = null;
  let inBlock = false;

  for (const line of lines) {
    // Continuation of YAML block scalar
    if (inBlock && line.match(/^\s+/)) {
      if (currentVal === '>' || currentVal === '|') currentVal = '';
      currentVal += (currentVal ? ' ' : '') + line.trim();
      continue;
    }
    if (inBlock && currentKey) {
      fm[currentKey] = currentVal.replace(/^"(.*)"$/, '$1');
      currentKey = null;
      currentVal = null;
      inBlock = false;
    }

    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;

    currentKey = kv[1];
    currentVal = kv[2].trim();

    if (currentVal === '>' || currentVal === '|') {
      inBlock = true;
    } else if (currentVal.match(/^\{/) && currentVal.endsWith('}')) {
      try {
        const jsonStr = currentVal.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
        fm[currentKey] = JSON.parse(jsonStr);
      } catch { fm[currentKey] = currentVal.replace(/^"(.*)"$/, '$1'); }
    } else {
      fm[currentKey] = currentVal.replace(/^"(.*)"$/, '$1');
    }
  }
  // Flush last block scalar
  if (inBlock && currentKey) fm[currentKey] = currentVal.replace(/^"(.*)"$/, '$1');

  return {
    name: fm.name || null,
    description: fm.description || null,
    category: fm.category || null,
    status: fm.status || null,
    risk_level: fm.risk_level || null,
    token_estimate: fm.token_estimate || null,
  };
}

function walk(dir) {
  const results = [];
  for (const full of walkSkillFiles(dir)) {
    const meta = parseFrontmatter(full);
    if (meta) results.push(meta);
  }
  return results;
}

function run() {
  const skills = walk(path.join(ROOT, 'skills'));
  const categories = {};
  skills.forEach(s => {
    categories[s.category] = (categories[s.category] || 0) + 1;
  });

  // Prepare clean skills array for catalog.json (omit token_estimate)
  const catalogSkills = skills.map(({ name, description, category, status, risk_level }) => ({
    name,
    description,
    category,
    status,
    risk_level,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const catalog = {
    version: resolveCatalogVersion(),
    generated: new Date().toISOString().split('T')[0],
    summary: {
      total: skills.length,
      categories,
    },
    skills: catalogSkills,
  };

  fs.writeFileSync(
    path.join(ROOT, 'catalog.json'),
    JSON.stringify(catalog, null, 2) + '\n'
  );
  console.log(`Catalog generated: ${skills.length} skills`);

  // === Tier-3: Auto-sync skills/index.json summary and details ===
  const INDEX_PATH = path.join(ROOT, 'skills', 'index.json');
  if (fs.existsSync(INDEX_PATH)) {
    try {
      const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
      index.generated = catalog.generated;
      index.summary = { total: skills.length, categories };

      const existingSkills = index.skills || {};
      const updatedSkills = {};

      // Sort skills by name
      const sortedSkills = [...skills].sort((a, b) => a.name.localeCompare(b.name));

      sortedSkills.forEach(s => {
        const existing = existingSkills[s.name] || {};

        // Recompute the tier from the current estimate every run — keeping the
        // stored one goes stale as soon as token_estimate changes.
        let costTier;
        if (s.token_estimate && s.token_estimate.input) {
          const inputTokens = s.token_estimate.input;
          if (inputTokens <= 2500) costTier = 'low';
          else if (inputTokens <= 4500) costTier = 'medium';
          else costTier = 'high';
        } else {
          costTier = existing.cost_tier || 'low';
        }

        updatedSkills[s.name] = {
          name: s.name,
          description: s.description,
          category: s.category,
          status: s.status,
          risk_level: s.risk_level,
          token_estimate: s.token_estimate || existing.token_estimate || { input: 2000, output: 800 },
          cost_tier: costTier,
          invokes: existing.invokes || []
        };
      });

      // Only bump the patch version when skill content actually changed —
      // avoids a cosmetic version/diff on every regeneration.
      const contentChanged = JSON.stringify(existingSkills) !== JSON.stringify(updatedSkills);
      index.skills = updatedSkills;

      if (contentChanged) {
        const [maj, min, pat] = (index.version || '1.0.0').split('.').map(Number);
        index.version = `${maj}.${min}.${pat + 1}`;
      }

      fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + '\n');
      console.log(`skills/index.json fully synced: v${index.version}, ${skills.length} skills`);

      // Generate catalog-lite.json automatically
      try {
        const liteCatalog = {
          version: catalog.version,
          generated: catalog.generated,
          summary: catalog.summary,
          skills: catalog.skills.map(s => ({
            name: s.name,
            status: s.status,
            risk_level: s.risk_level,
            category: s.category
          }))
        };
        fs.writeFileSync(
          path.join(ROOT, 'catalog-lite.json'),
          JSON.stringify(liteCatalog, null, 2) + '\n'
        );
        console.log(`catalog-lite.json generated automatically`);
      } catch (err) {
        console.warn(`Warning: could not generate catalog-lite.json — ${err.message}`);
      }
    } catch (e) {
      console.warn(`Warning: could not sync skills/index.json — ${e.message}`);
    }
  }

  updateReadmeCatalog(skills);
}

const README_PATH = path.join(ROOT, 'README.md');
const CATALOG_BEGIN = '<!-- catalog:begin -->';
const CATALOG_END = '<!-- catalog:end -->';

const CATEGORY_META = {
  core: { emoji: '🔧', title: 'Desarrollo Core', noun: 'Skills' },
  design: { emoji: '🎨', title: 'Design Engineering', noun: 'Skills' },
  agent: { emoji: '🤖', title: 'Agentes Especializados', noun: 'Agents' },
};

function truncateText(text, max = 90) {
  if (!text) return '—';
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return (sp > 40 ? cut.slice(0, sp) : cut) + '…';
}

function buildReadmeSection(skills, total) {
  const byCat = {};
  skills.forEach(s => {
    const cat = s.category || 'other';
    (byCat[cat] = byCat[cat] || []).push(s);
  });
  const preferred = ['core', 'design', 'agent'];
  const cats = [
    ...preferred.filter(c => byCat[c]),
    ...Object.keys(byCat).filter(c => !preferred.includes(c)).sort(),
  ];

  let out = `*~Tokens = contexto que consume la skill al activarse (medido del frontmatter de cada \`SKILL.md\`). Las ${total} completas, en [catalog.json](catalog.json).*\n`;
  for (const cat of cats) {
    const meta = CATEGORY_META[cat] || { emoji: '📋', title: cat.charAt(0).toUpperCase() + cat.slice(1), noun: 'Skills' };
    const list = [...byCat[cat]].sort((a, b) => a.name.localeCompare(b.name));
    out += `\n### ${meta.emoji} ${meta.title} (${list.length} ${meta.noun})\n\n`;
    out += '| Skill | Para qué | ~Tokens |\n|---|---|---:|\n';
    for (const s of list) {
      const desc = truncateText((s.description || '').replace(/\s+/g, ' ').trim()).replace(/\|/g, '\\|');
      const tok = s.token_estimate && s.token_estimate.input ? s.token_estimate.input : '—';
      out += `| \`${s.name}\` | ${desc} | ${tok} |\n`;
    }
  }
  return out;
}

function updateReadmeCatalog(skills) {
  if (!fs.existsSync(README_PATH)) return;
  const readme = fs.readFileSync(README_PATH, 'utf-8');
  const bi = readme.indexOf(CATALOG_BEGIN);
  const ei = readme.indexOf(CATALOG_END);
  if (bi === -1 || ei === -1 || ei < bi) {
    console.warn('Warning: README catalog markers not found, skipping README sync');
    return;
  }
  const section = '\n' + buildReadmeSection(skills, skills.length) + '';
  const out = readme.slice(0, bi + CATALOG_BEGIN.length) + section + readme.slice(ei);
  fs.writeFileSync(README_PATH, out, 'utf-8');
  console.log(`README catalog section synced (${skills.length} skills)`);
}

if (require.main === module) {
  run();
}

module.exports = { parseFrontmatter, resolveCatalogVersion, run };
