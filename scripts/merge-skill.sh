#!/usr/bin/env bash
# Thin wrapper — delegates to unified Node.js implementation
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$SCRIPT_DIR/merge-skill.js" "$@"
