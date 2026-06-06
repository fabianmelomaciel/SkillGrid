#!/bin/bash
# Remote installer for SkillGrid in Linux/Mac
set -e

echo ""
echo "=== SkillGrid Remote Installer ==="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: Git no esta instalado o no se encuentra en el PATH. Por favor instala Git antes de continuar."
    exit 1
fi

# Determine temp directory
if [ -z "$HOME" ]; then
    echo "ERROR: HOME no esta definido. Abortando por seguridad."
    exit 1
fi
TARGET="$(mktemp -d 2>/dev/null || mktemp -d -t skillgrid)"
trap 'rm -rf "$TARGET" 2>/dev/null || true' EXIT

echo "Clonando SkillGrid en directorio temporal: $TARGET..."

git clone --depth 1 https://github.com/fabianmelomaciel/SkillGrid.git "$TARGET"

# Run the installer
echo "Ejecutando instalador local..."
bash "$TARGET/install.sh"
