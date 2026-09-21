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

# WARNING: Pinned to release tag for supply chain safety. Updated automatically by
# scripts/release.sh on each release. Falls back to main if the tag is ever missing
# (e.g. a release was cut but not pushed) so onboarding never hard-fails.
PINNED_TAG="v1.14.0"
if ! git clone --depth 1 --branch "$PINNED_TAG" https://github.com/fabianmelomaciel/SkillGrid.git "$TARGET" 2>/dev/null; then
    echo "ADVERTENCIA: no se encontró el tag $PINNED_TAG. Usando main como respaldo."
    git clone --depth 1 --branch main https://github.com/fabianmelomaciel/SkillGrid.git "$TARGET"
fi

# Run the installer
echo "Ejecutando instalador local..."
VALID_PROFILES="minimal standard testing strict all"
if [ -n "${SKILLGRID_PROFILE:-}" ]; then
    if ! echo "$VALID_PROFILES" | grep -qw "$SKILLGRID_PROFILE"; then
        echo "ADVERTENCIA: Perfil '$SKILLGRID_PROFILE' no reconocido. Válidos: $VALID_PROFILES. Usando 'minimal'."
        SKILLGRID_PROFILE="minimal"
    fi
    bash "$TARGET/install.sh" --profile "$SKILLGRID_PROFILE" || bash "$TARGET/install.sh"
else
    bash "$TARGET/install.sh"
fi
