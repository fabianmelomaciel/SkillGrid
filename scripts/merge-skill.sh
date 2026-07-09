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

# Export variables to environment so Python can read them securely without shell interpolation
export SKILL_PATH MODEL PLATFORM MODELS_JSON OUTPUT_PATH DEGRADATION

# Use Python for reliable parsing
python3 -c '
import sys, json, re, os

skill_path = os.environ.get("SKILL_PATH", "")
target_model = os.environ.get("MODEL", "")
target_platform = os.environ.get("PLATFORM", "")
models_json = os.environ.get("MODELS_JSON", "")
degradation = os.environ.get("DEGRADATION", "full")
output_path = os.environ.get("OUTPUT_PATH", "")

if not target_model and target_platform and models_json:
    try:
        with open(models_json) as f:
            data = json.load(f)
        target_model = data.get("platforms", {}).get(target_platform, {}).get("default_model", "")
    except:
        pass

with open(skill_path, encoding="utf-8") as f:
    content = f.read()

# Split into sections
parts = content.split("## Modules", 1)
core_part = parts[0].rstrip()

# Output frontmatter + core
output = core_part

if degradation != "stripped" and len(parts) > 1:
    modules_body = parts[1]
    # Parse module blocks
    module_pattern = re.compile(r"^\[(model|platform):([^\]]+)\]$(.*?)(?=^\[(?:model|platform):|\Z)", re.MULTILINE | re.DOTALL)
    matches = list(module_pattern.finditer(modules_body))

    selected = []
    for m in matches:
        mtype = m.group(1)
        mkey = m.group(2).strip()
        mcontent = m.group(0)
        keep = False
        if mtype == "model" and target_model and mkey == target_model:
            keep = True
        if mtype == "platform" and target_platform and mkey == target_platform:
            keep = True
        if not target_model and not target_platform:
            keep = True
        if keep:
            selected.append(mcontent)

    if selected:
        output += "\n\n## Modules\n"
        output += "\n".join(selected)

if output_path:
    import os
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(output)
    print(f"Written: {output_path}")
else:
    print(output, end="")
'
