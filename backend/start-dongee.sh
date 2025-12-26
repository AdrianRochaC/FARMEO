#!/bin/bash
# Script de inicio para Dongee
# Este script instala dependencias e inicia el servidor

echo "🚀 Iniciando backend en Dongee..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar versión de Node.js (mínimo 12.0.0)
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 12 ]; then
    echo "❌ Se requiere Node.js 12 o superior"
    exit 1
fi

echo "✅ Node.js $(node -v) detectado"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install --production
fi

# Crear carpetas necesarias
mkdir -p uploads/videos
mkdir -p uploads/documents
mkdir -p temp/videos
mkdir -p logs

# Iniciar servidor
echo "🚀 Iniciando servidor..."
node server.js


