# Hooks System

## Hook Types

- **PreToolUse**: Before tool execution (validation, parameter modification)
- **PostToolUse**: After tool execution (auto-format, checks)
- **Stop**: When session ends (final verification)

## Auto-Accept Permissions

Use with caution:
- Enable for trusted, well-defined plans
- Disable for exploratory work
- Never use dangerously-skip-permissions flag
- Configure `allowedTools` in `~/.claude.json` instead

## TodoWrite Best Practices

Use TodoWrite tool to:
- Track progress on multi-step tasks
- Verify understanding of instructions
- Enable real-time steering
- Show granular implementation steps

Todo list reveals:
- Out of order steps
- Missing items
- Extra unnecessary items
- Wrong granularity
- Misinterpreted requirements

## Ready-to-Paste Recipes (warn-only)

Paste into the project's `.claude/settings.json`. Every recipe only prints to stderr and exits 0 — warnings, never blocks. Blocking hooks bite in docs-heavy repos, so keep them out.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "tool == \"Bash\" && tool_input.command matches \"git push\"",
        "hooks": [{ "type": "command", "command": "node -e \"console.error('[Hook] Revisá el diff antes de push: git log -p -1')" }],
        "description": "Reminder before git push"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
        "hooks": [{ "type": "command", "command": "node -e \"const fs=require('fs');let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const p=i.tool_input?.file_path;if(p&&fs.existsSync(p)){const h=fs.readFileSync(p,'utf8').split('\\n').filter(l=>l.includes('console.log'));if(h.length)console.error('[Hook] console.log ('+h.length+' lineas) en '+p)}console.log(d)})\"" }],
        "description": "Warn about console.log after edits"
      },
      {
        "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\\\.(ts|tsx|js|jsx)$\"",
        "hooks": [{ "type": "command", "command": "node -e \"const{execSync}=require('child_process');let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const i=JSON.parse(d);const p=i.tool_input?.file_path;try{execSync('npx prettier --write \\\"'+p+'\\\"',{stdio:'ignore'})}catch(e){}console.log(d)})\"" }],
        "description": "Auto-format after edit"
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [{ "type": "command", "command": "node -e \"const{execSync}=require('child_process');const fs=require('fs');let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const files=execSync('git diff --name-only HEAD',{encoding:'utf8'}).split(/\\r?\\n/).filter(f=>/\\.(ts|tsx|js|jsx)$/.test(f)&&fs.existsSync(f));for(const f of files){if(fs.readFileSync(f,'utf8').includes('console.log'))console.error('[Hook] console.log en '+f+' antes de commitear')}}catch(e){}console.log(d)})\"" }],
        "description": "Warn about console.log in modified files at stop"
      }
    ]
  }
}
```

For type checking after `.ts` edits, chain `npx tsc --noEmit` the same way and print only the lines that mention the edited file — full-project runs on every keystroke get old fast.
