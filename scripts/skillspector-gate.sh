#!/usr/bin/env bash
# Scan every skill (any directory holding a SKILL.md) with NVIDIA SkillSpector.
#
# SkillSpector is a heuristic scanner. Security-audit skills legitimately quote
# attack patterns and credential paths, so reviewed false positives are accepted
# per skill in .skillspector/<skill-name>.yaml. Anything NOT covered by a baseline
# still fails the run, so new findings are caught.
#
# `--baseline` is not supported together with `--recursive`, hence one scan per skill.
#
# Usage: scripts/skillspector-gate.sh [skills-dir]     (default: skills)
set -uo pipefail

SKILLS_DIR="${1:-skills}"
BASELINE_DIR=".skillspector"
status=0
scanned=0

while IFS= read -r skill_file; do
  dir="$(dirname "$skill_file")"
  name="$(basename "$dir")"
  args=(--no-llm)
  [ -f "$BASELINE_DIR/$name.yaml" ] && args+=(--baseline "$BASELINE_DIR/$name.yaml")

  scanned=$((scanned + 1))
  if ! output="$(skillspector scan "$dir" "${args[@]}" 2>&1)"; then
    echo "::error title=SkillSpector::$name has findings not covered by $BASELINE_DIR/$name.yaml"
    echo "$output"
    status=1
  fi
done < <(find "$SKILLS_DIR" -name SKILL.md | sort)

echo "SkillSpector: scanned $scanned skills, exit status $status"
exit "$status"
