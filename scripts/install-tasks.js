/**
 * install-tasks.js — Externalized Node.js tasks for SkillGrid installers
 *
 * Usage:
 *   node scripts/install-tasks.js install-rules <source> <project> <language>
 *   node scripts/install-tasks.js generate-agents <source> <agentsDir>
 *   node scripts/install-tasks.js token-audit <source>
 */

const fs = require('fs');
const path = require('path');

const TASKS = {
  'install-rules': (args) => {
    const [scriptDir, projectDir, languageArg] = args;
    let language = languageArg ? languageArg.toLowerCase().trim() : '';

    if (!language) {
      console.log('  Detectando lenguaje del proyecto automáticamente...');
      const detectors = [
        { file: 'composer.json', lang: 'php' },
        { file: 'package.json', lang: 'typescript' },
        { file: 'requirements.txt', lang: 'python' },
        { file: 'pyproject.toml', lang: 'python' },
        { file: 'go.mod', lang: 'golang' },
        { file: 'Cargo.toml', lang: 'rust' },
        { file: 'pom.xml', lang: 'java' },
        { file: 'build.gradle', lang: 'java' },
        { file: 'build.gradle.kts', lang: 'kotlin' },
        { file: 'Package.swift', lang: 'swift' },
        { file: 'Gemfile', lang: 'ruby' },
      ];
      for (const d of detectors) {
        if (fs.existsSync(path.join(projectDir, d.file))) {
          language = d.lang;
          break;
        }
      }
      if (!language) {
        try {
          const files = fs.readdirSync(projectDir);
          const extCounts = {};
          files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            if (ext) extCounts[ext] = (extCounts[ext] || 0) + 1;
          });
          const mapping = {
            '.php': 'php', '.ts': 'typescript', '.tsx': 'typescript',
            '.js': 'typescript', '.jsx': 'typescript', '.py': 'python',
            '.go': 'golang', '.java': 'java', '.kt': 'kotlin',
            '.rs': 'rust', '.swift': 'swift', '.cs': 'csharp',
            '.cpp': 'cpp', '.cc': 'cpp', '.c': 'cpp'
          };
          let maxCount = 0;
          for (const [ext, count] of Object.entries(extCounts)) {
            const lang = mapping[ext];
            if (lang && count > maxCount) { maxCount = count; language = lang; }
          }
        } catch (e) { language = 'common'; }
      }
      console.log(`  -> Lenguaje detectado: ${language.toUpperCase()}`);
    } else {
      console.log(`  -> Lenguaje seleccionado: ${language.toUpperCase()}`);
    }

    const cursorRulesDir = path.join(projectDir, '.cursor', 'rules');
    const copilotDir = path.join(projectDir, '.github', 'instructions');
    fs.mkdirSync(cursorRulesDir, { recursive: true });
    fs.mkdirSync(copilotDir, { recursive: true });

    const installRulesFromFolder = (folderName, prefix) => {
      const rulesSrcDir = path.join(scriptDir, 'rules', folderName);
      if (!fs.existsSync(rulesSrcDir)) {
        console.log(`  [-] No se encuentra el directorio de reglas: rules/${folderName}`);
        return;
      }
      fs.readdirSync(rulesSrcDir).forEach(file => {
        if (path.extname(file).toLowerCase() !== '.md') return;
        const fullPath = path.join(rulesSrcDir, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        const baseName = path.basename(file, '.md');
        const destName = `${prefix}-${baseName}`;
        let yamlHeader = '', markdownBody = content, paths = [];
        if (content.startsWith('---')) {
          const parts = content.split('---');
          if (parts.length >= 3) {
            yamlHeader = parts[1];
            markdownBody = parts.slice(2).join('---').trim();
            const pathsMatch = yamlHeader.match(/paths:\s*\n((\s*-\s*[^\n]+\n?)+)/);
            if (pathsMatch) {
              paths = pathsMatch[1].split('\n')
                .map(line => line.replace(/^\s*-\s*/, '').trim())
                .filter(line => line.length > 0);
            }
          }
        }
        const cursorGlobs = paths.length > 0 ? paths.map(p => `"${p}"`).join(', ') : '*';
        const cursorFrontmatter = `---\ndescription: Reglas de ${folderName} - ${baseName}\nglobs: [${cursorGlobs}]\nalwaysApply: false\n---`;
        fs.writeFileSync(path.join(cursorRulesDir, destName + '.mdc'), `${cursorFrontmatter}\n\n${markdownBody}`, 'utf8');
        console.log(`    [+] Cursor Rule: ${destName}.mdc`);

        const copilotApply = paths.length > 0 ? paths.map(p => `  - ${p}`).join('\n') : '  - *';
        const copilotFrontmatter = `---\napplyTo:\n${copilotApply}\n---`;
        fs.writeFileSync(path.join(copilotDir, destName + '.instructions.md'), `${copilotFrontmatter}\n\n${markdownBody}`, 'utf8');
        console.log(`    [+] Copilot Instruction: ${destName}.instructions.md`);
      });
    };

    installRulesFromFolder('common', 'common');
    if (language !== 'common') installRulesFromFolder(language, language);
  },

  'generate-agents': (args) => {
    const [scriptDir, agentsDir] = args;
    const skillsDir = path.join(scriptDir, 'skills');
    const scanForSkills = (dir) => {
      fs.readdirSync(dir, { withFileTypes: true }).forEach(d => {
        const fullPath = path.join(dir, d.name);
        if (d.isDirectory()) {
          const skillFile = path.join(fullPath, 'SKILL.md');
          if (fs.existsSync(skillFile)) {
            const content = fs.readFileSync(skillFile, 'utf8');
            const lines = content.replace(/\r/g, '').split('\n');
            let desc = d.name, body = content, category = null;
            if (lines[0] === '---') {
              const endIdx = lines.indexOf('---', 1);
              if (endIdx > 0) {
                const fm = lines.slice(1, endIdx).join('\n');
                const m = fm.match(/description:\s*(?:["']?)([^"'\n]+)/);
                if (m) desc = m[1].trim();
                const c = fm.match(/^category:\s*(.+)$/m);
                if (c) category = c[1].trim();
                body = lines.slice(endIdx + 1).join('\n').trim();
              }
            }
            if (category !== 'agent') return;
            const agentContent = `---\ndescription: ${desc}\nmode: subagent\npermission:\n  edit: deny\n  bash: deny\n---\n\n${body}`;
            fs.writeFileSync(path.join(agentsDir, d.name + '.md'), agentContent, 'utf8');
            console.log('  Agente: ' + d.name + '.md');
          } else {
            scanForSkills(fullPath);
          }
        }
      });
    };
    scanForSkills(skillsDir);
  },

  'token-audit': (args) => {
    const [scriptDir] = args;
    const skillsIndexPath = path.join(scriptDir, 'skills', 'index.json');
    const bundlesPath = path.join(scriptDir, 'skills', 'bundles', 'index.json');
    const modelsPath = path.join(scriptDir, 'models.json');

    if (!fs.existsSync(skillsIndexPath) || !fs.existsSync(bundlesPath) || !fs.existsSync(modelsPath)) {
      console.error('Missing required files: skills/index.json, skills/bundles/index.json, models.json');
      process.exit(1);
    }

    const skillsIndex = JSON.parse(fs.readFileSync(skillsIndexPath, 'utf8'));
    const bundles = JSON.parse(fs.readFileSync(bundlesPath, 'utf8'));
    const models = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));

    const skills = skillsIndex.skills || {};
    const profiles = (bundles.profiles || {});
    const allSkillNames = Object.values(skills)
      .map(s => s && s.name)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    const resolveProfileSkills = (profileName) => {
      if (profileName === 'all') return allSkillNames;
      const p = profiles[profileName];
      if (!p || !Array.isArray(p.skills)) return [];
      return p.skills.slice();
    };

    const sumTokens = (skillNames) => {
      let input = 0;
      let output = 0;
      for (const name of skillNames) {
        const meta = skills[name];
        if (!meta || !meta.token_estimate) continue;
        input += Number(meta.token_estimate.input || 0);
        output += Number(meta.token_estimate.output || 0);
      }
      return { input, output, total: input + output };
    };

    const formatNumber = (n) => new Intl.NumberFormat('en-US').format(n);
    const formatUsd = (n) => `$${n.toFixed(4)}`;

    const platformCost = (platformName, tokens) => {
      const platform = (models.platforms || {})[platformName];
      if (!platform) return null;
      const modelName = platform.default_model;
      const model = (models.models || {})[modelName];
      if (!model) return null;
      const inCost = Number(model.token_cost_per_1M_input || 0);
      const outCost = Number(model.token_cost_per_1M_output || 0);
      const usd = (tokens.input / 1_000_000) * inCost + (tokens.output / 1_000_000) * outCost;
      return { model: modelName, usd };
    };

    const platformNames = Object.keys(models.platforms || {});
    const reportProfiles = ['minimal', 'standard', 'strict', 'all'].filter(p => p === 'all' || profiles[p]);

    console.log('\nToken audit (estimated)\n');
    for (const p of reportProfiles) {
      const skillNames = resolveProfileSkills(p);
      const tokens = sumTokens(skillNames);
      console.log(`- ${p}: ${skillNames.length} skills | ${formatNumber(tokens.total)} tokens (in ${formatNumber(tokens.input)} / out ${formatNumber(tokens.output)})`);
      for (const platformName of platformNames) {
        const c = platformCost(platformName, tokens);
        if (!c) continue;
        console.log(`  - ${platformName}: ${c.model} -> ${formatUsd(c.usd)}`);
      }
    }
    console.log('');
  }
};

const taskName = process.argv[2];
const taskArgs = process.argv.slice(3);
if (TASKS[taskName]) {
  TASKS[taskName](taskArgs);
} else {
  console.error(`Unknown task: ${taskName}`);
  console.error('Available tasks: install-rules, generate-agents, token-audit');
  process.exit(1);
}
