@echo off
REM Script de inicio para Dongee (Windows)
REM Este script instala dependencias e inicia el servidor

echo 🚀 Iniciando backend en Dongee...

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado
    exit /b 1
)

echo ✅ Node.js detectado

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    call npm install --production
)

REM Crear carpetas necesarias
if not exist "uploads\videos" mkdir uploads\videos
if not exist "uploads\documents" mkdir uploads\documents
if not exist "temp\videos" mkdir temp\videos
if not exist "logs" mkdir logs

REM Iniciar servidor
echo 🚀 Iniciando servidor...
node server.js


