#!/bin/bash
# Remote installer for OpenSkills in Linux/Mac
set -e

echo ""
echo "=== OpenSkills Remote Installer ==="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: Git no esta instalado o no se encuentra en el PATH. Por favor instala Git antes de continuar."
    exit 1
fi

# Determine destination directory
if [ -z "$HOME" ]; then
    echo "ERROR: HOME no esta definido. Abortando por seguridad."
    exit 1
fi
TARGET="$HOME/.config/opencode/openskills"
if [ -d "$HOME/.config/antigravity" ]; then
    TARGET="$HOME/.config/antigravity/openskills"
fi

echo "Clonando/Actualizando OpenSkills en $TARGET..."

if [ -d "$TARGET" ]; then
    if [ -d "$TARGET/.git" ]; then
        echo "El directorio de destino ya existe. Actualizando con git pull..."
        cd "$TARGET"
        git pull || echo "Advertencia: No se pudo realizar git pull. Intentando continuar..."
        cd - > /dev/null
    else
        echo "El directorio de destino existe pero no es un repositorio git. Reinstalando de forma limpia..."
        case "$TARGET" in
            "$HOME"/.config/opencode/openskills|"$HOME"/.config/antigravity/openskills) ;;
            *)
                echo "ERROR: Ruta de destino inesperada para borrado: $TARGET. Abortando por seguridad."
                exit 1
                ;;
        esac
        rm -rf "$TARGET"
        git clone https://github.com/fabianmelomaciel/OpenSkills.git "$TARGET"
    fi
else
    git clone https://github.com/fabianmelomaciel/OpenSkills.git "$TARGET"
fi

# Run the installer
echo "Ejecutando instalador local..."
bash "$TARGET/install.sh"
