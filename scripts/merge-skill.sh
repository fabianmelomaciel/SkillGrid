#!/usr/bin/env bash
set -euo pipefail

SKILL_PATH="${1:-}"
MODEL="${2:-}"
PLATFORM="${3:-}"
MODELS_JSON="${4:-}"
OUTPUT_PATH="${5:-}"
DEGRADATION="${6:-full}"

if [ -z "$SKILL_PATH" ] || [ ! -f "$SKILL_PATH" ]; then
  echo "Usage: $0 <skill-path> [model] [platform] [models-json] [output-path] [degradation]" >&2
  echo "Error: skill file not found or not specified" >&2
  exit 1
fi

# Use Python for reliable parsing
python3 -c "
import sys, json, re

skill_path = '$SKILL_PATH'
target_model = '$MODEL'
target_platform = '$PLATFORM'
models_json = '$MODELS_JSON'
degradation = '$DEGRADATION'

if not target_model and target_platform and models_json:
    try:
        with open(models_json) as f:
            data = json.load(f)
        target_model = data.get('platforms', {}).get(target_platform, {}).get('default_model', '')
    except:
        pass

with open(skill_path, encoding='utf-8') as f:
    content = f.read()

# Split into sections
parts = content.split('## Modules', 1)
core_part = parts[0].rstrip()

# Output frontmatter + core
output = core_part

if degradation != 'stripped' and len(parts) > 1:
    modules_body = parts[1]
    # Parse module blocks
    module_pattern = re.compile(r'^\[(model|platform):([^\]]+)\]$(.*?)(?=^\[(?:model|platform):|\Z)', re.MULTILINE | re.DOTALL)
    matches = list(module_pattern.finditer(modules_body))

    selected = []
    for m in matches:
        mtype = m.group(1)
        mkey = m.group(2).strip()
        mcontent = m.group(0)
        keep = False
        if mtype == 'model' and target_model and mkey == target_model:
            keep = True
        if mtype == 'platform' and target_platform and mkey == target_platform:
            keep = True
        if not target_model and not target_platform:
            keep = True
        if keep:
            selected.append(mcontent)

    if selected:
        output += '\n\n## Modules\n'
        output += '\n'.join(selected)

if '$OUTPUT_PATH':
    import os
    dest = '$OUTPUT_PATH'
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w', encoding='utf-8') as f:
        f.write(output)
    print(f'Written: {dest}')
else:
    print(output, end='')
"
