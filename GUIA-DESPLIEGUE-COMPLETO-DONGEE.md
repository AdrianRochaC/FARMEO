# 🚀 Guía Completa de Despliegue en Dongee (Frontend + Backend)

Esta guía te explica paso a paso cómo subir **TODO el proyecto** (frontend y backend) a **Dongee**.

## 📋 Resumen del Proyecto

- **Frontend:** React + Vite → `farmeoa.com`
- **Backend:** Node.js + Express → `api.farmeoa.com` (subdominio)
- **Base de Datos:** MySQL (Railway)
- **Dominio Principal:** farmeoa.com

---

## ⚠️ Requisitos Previos

Antes de comenzar, asegúrate de que tu plan de Dongee soporte:

1. ✅ **Node.js** (versión 12 o superior)
2. ✅ **Subdominios** (para crear `api.farmeoa.com`)
3. ✅ **Acceso SSH** o **Terminal** (para ejecutar comandos)
4. ✅ **PM2** o similar (para mantener el servidor activo)

**Nota:** Si tu plan de Dongee no soporta Node.js, necesitarás un plan VPS o similar.

---

## 📦 Parte 1: Preparar el Frontend

### 1.1 Generar Build de Producción

En tu computadora local, ejecuta:

```bash
# Asegúrate de estar en la raíz del proyecto
cd C:\FarmeoDongee

# Instalar dependencias (si no lo has hecho)
npm install

# Generar build de producción
npm run build
```

Esto creará la carpeta `dist/` con todos los archivos optimizados.

### 1.2 Verificar Configuración

El frontend ya está configurado para apuntar a `https://api.farmeoa.com` (el backend en Dongee).

---

## 📤 Parte 2: Subir el Frontend a Dongee

### 2.1 Acceder a cPanel

1. Inicia sesión en tu cuenta de Dongee
2. Accede a **cPanel**

### 2.2 Subir Archivos del Frontend

1. En cPanel, busca **"Administrador de archivos"** o **"File Manager"**
2. Navega a la carpeta `public_html` (carpeta raíz del dominio principal)
3. **Elimina** todos los archivos existentes (si los hay)
4. Sube **todos los archivos** de la carpeta `dist/`:
   - Comprime `dist/` en un ZIP
   - Súbelo a `public_html`
   - Extrae el ZIP
   - Elimina el archivo ZIP

### 2.3 Estructura Final del Frontend

Tu `public_html` debe verse así:

```
public_html/
├── index.html
├── .htaccess
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── (otros archivos estáticos)
```

---

## 🔧 Parte 3: Configurar el Backend en Dongee

### 3.1 Crear Subdominio para el Backend

1. En cPanel, busca **"Subdominios"** o **"Subdomains"**
2. Crea un nuevo subdominio:
   - **Subdominio:** `api`
   - **Dominio:** `farmeoa.com`
   - **Directorio:** `api` (o `public_html/api`)
3. Guarda los cambios

Esto creará el subdominio `api.farmeoa.com` y una carpeta para él.

### 3.2 Preparar Archivos del Backend

En tu computadora local, prepara los siguientes archivos del backend:

**Archivos necesarios:**
```
backend/
├── server.js
├── package.json
├── package-lock.json
├── config/
│   ├── app.js
│   ├── database.js
│   └── (otros archivos de config)
├── start-dongee.sh (o .bat)
├── ecosystem.config.js
├── .htaccess
└── (otros archivos necesarios)
```

**NO subas:**
- ❌ `node_modules/` (se instalarán en el servidor)
- ❌ `.env` (se creará en el servidor)
- ❌ `uploads/` (se crearán en el servidor)
- ❌ `temp/` (se creará en el servidor)
- ❌ `logs/` (se creará en el servidor)

### 3.3 Subir Archivos del Backend

1. En cPanel, navega a la carpeta del subdominio `api` (ej: `public_html/api`)
2. Sube todos los archivos del backend (excepto los mencionados arriba)
3. Puedes comprimirlos en un ZIP y subirlos, luego extraerlos

### 3.4 Estructura Final del Backend

Tu carpeta `api` debe verse así:

```
api/
├── server.js
├── package.json
├── package-lock.json
├── config/
│   ├── app.js
│   ├── database.js
│   └── ...
├── start-dongee.sh
├── ecosystem.config.js
├── .htaccess
└── (otros archivos)
```

---

## ⚙️ Parte 4: Configurar el Backend en el Servidor

### 4.1 Acceder al Servidor (SSH o Terminal)

**Opción A: SSH (Recomendado)**
1. En cPanel, busca **"Terminal"** o **"SSH Access"**
2. Conéctate usando las credenciales SSH

**Opción B: Terminal de cPanel**
1. En cPanel, busca **"Terminal"** o **"Web Terminal"**
2. Abre la terminal

### 4.2 Navegar a la Carpeta del Backend

```bash
# Navegar a la carpeta del backend
cd ~/public_html/api
# O la ruta que te indique Dongee para el subdominio
```

### 4.3 Instalar Node.js (si no está instalado)

```bash
# Verificar si Node.js está instalado
node -v

# Si no está instalado, contacta a soporte de Dongee
# O instálalo manualmente (depende de tu plan)
```

### 4.4 Instalar Dependencias

```bash
# Instalar dependencias de producción
npm install --production
```

### 4.5 Crear Archivo .env

Crea un archivo `.env` en la carpeta del backend con el siguiente contenido:

```env
# Configuración del servidor
NODE_ENV=production
PORT=3001

# Configuración de la base de datos
DB_HOST=caboose.proxy.rlwy.net
DB_PORT=16023
DB_USER=root
DB_PASSWORD=rGbXfHSKIBHcLqYqpFtHdAGCJddHREpz
DB_NAME=railway

# JWT Secret
JWT_SECRET=capacitaciones_jwt_secret_2024_ultra_secure_key

# OpenAI API Key (si usas IA)
OPENAI_API_KEY=tu_openai_api_key_aqui

# AssemblyAI API Key (si usas transcripción)
ASSEMBLYAI_API_KEY=tu_assemblyai_api_key_aqui
```

**⚠️ IMPORTANTE:** Reemplaza los valores con tus propias credenciales.

### 4.6 Crear Carpetas Necesarias

```bash
# Crear carpetas para uploads y logs
mkdir -p uploads/videos
mkdir -p uploads/documents
mkdir -p temp/videos
mkdir -p logs
```

### 4.7 Configurar Permisos

```bash
# Dar permisos de escritura a las carpetas
chmod 755 uploads
chmod 755 temp
chmod 755 logs
```

---

## 🚀 Parte 5: Iniciar el Backend

### 5.1 Opción A: Usando PM2 (Recomendado)

PM2 mantiene el servidor activo incluso si se reinicia el servidor.

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar el servidor con PM2
pm2 start server.js --name "capacitaciones-backend"

# Guardar la configuración de PM2
pm2 save

# Configurar PM2 para iniciar al arrancar el servidor
pm2 startup
```

**Comandos útiles de PM2:**
```bash
# Ver estado del servidor
pm2 status

# Ver logs
pm2 logs capacitaciones-backend

# Reiniciar el servidor
pm2 restart capacitaciones-backend

# Detener el servidor
pm2 stop capacitaciones-backend
```

### 5.2 Opción B: Usando el Script de Inicio

```bash
# Dar permisos de ejecución al script
chmod +x start-dongee.sh

# Ejecutar el script
./start-dongee.sh
```

### 5.3 Opción C: Inicio Manual

```bash
# Iniciar el servidor directamente
node server.js
```

**Nota:** Esta opción no mantiene el servidor activo si se cierra la terminal.

---

## 🔒 Parte 6: Configurar Apache/Nginx para el Backend

### 6.1 Si Dongee Usa Apache

Si el backend necesita ejecutarse a través de Apache, configura el archivo `.htaccess`:

El archivo `.htaccess` ya está incluido en el backend. Si necesitas ajustarlo, edítalo en la carpeta `api/`.

### 6.2 Si Dongee Usa Node.js Directamente

Si Dongee soporta Node.js directamente, el servidor debería estar accesible en:
- `https://api.farmeoa.com:3001` (si usas puerto)
- O `https://api.farmeoa.com` (si está configurado como aplicación Node.js)

**Verifica con soporte de Dongee** cómo configurar una aplicación Node.js.

---

## ✅ Parte 7: Verificar que Todo Funciona

### 7.1 Verificar el Backend

1. Abre en tu navegador: `https://api.farmeoa.com/api/test`
2. Deberías ver una respuesta JSON

Si no funciona:
- Verifica que el servidor esté ejecutándose: `pm2 status`
- Revisa los logs: `pm2 logs capacitaciones-backend`
- Verifica que el puerto 3001 esté abierto

### 7.2 Verificar el Frontend

1. Abre en tu navegador: `https://farmeoa.com`
2. Deberías ver la página de inicio
3. Abre la **Consola del Navegador** (F12 → Console)
4. Verifica que no haya errores

### 7.3 Probar la Conexión

1. Intenta hacer login en la aplicación
2. Navega por las diferentes páginas
3. Verifica que las llamadas al backend funcionen

---

## 🔧 Troubleshooting

### Error: "No permitido por CORS"

**Solución:**
1. Verifica que `farmeoa.com` esté en la lista de CORS en `backend/config/app.js`
2. Verifica que el backend esté ejecutándose
3. Revisa los logs del backend

### Error: "No se puede conectar con el servidor"

**Solución:**
1. Verifica que el backend esté ejecutándose: `pm2 status`
2. Verifica que la URL en `src/utils/api.js` sea correcta
3. Verifica que el puerto 3001 esté abierto
4. Prueba acceder directamente a `https://api.farmeoa.com/api/test`

### Error: "Puerto 3001 ya en uso"

**Solución:**
```bash
# Ver qué proceso está usando el puerto
lsof -i :3001

# O detener todos los procesos de Node.js
pm2 stop all
pm2 delete all

# Reiniciar el servidor
pm2 start server.js --name "capacitaciones-backend"
```

### Error: "Module not found"

**Solución:**
```bash
# Reinstalar dependencias
cd ~/public_html/api
rm -rf node_modules
npm install --production
```

### El servidor se detiene al cerrar la terminal

**Solución:**
Usa PM2 para mantener el servidor activo:
```bash
pm2 start server.js --name "capacitaciones-backend"
pm2 save
pm2 startup
```

---

## 🔄 Actualizaciones Futuras

### Actualizar el Frontend

1. Haz los cambios en tu código local
2. Ejecuta `npm run build`
3. Sube los nuevos archivos de `dist/` a `public_html` en Dongee

### Actualizar el Backend

1. Haz los cambios en tu código local
2. Sube los archivos modificados a `public_html/api` en Dongee
3. En el servidor, ejecuta:
   ```bash
   cd ~/public_html/api
   npm install --production
   pm2 restart capacitaciones-backend
   ```

---

## 📝 Resumen de URLs y Configuración

- **Frontend:** `https://farmeoa.com`
- **Backend:** `https://api.farmeoa.com`
- **API Endpoint:** `https://api.farmeoa.com/api/...`
- **Base de Datos:** Railway MySQL (remota)

---

## ✅ Checklist Final

Antes de considerar el despliegue completo:

- [ ] Frontend subido a `public_html`
- [ ] Archivo `.htaccess` en `public_html`
- [ ] Subdominio `api.farmeoa.com` creado
- [ ] Backend subido a la carpeta del subdominio
- [ ] Dependencias del backend instaladas (`npm install`)
- [ ] Archivo `.env` creado con las variables correctas
- [ ] Carpetas `uploads/`, `temp/`, `logs/` creadas
- [ ] Backend ejecutándose con PM2
- [ ] Backend accesible en `https://api.farmeoa.com/api/test`
- [ ] Frontend accesible en `https://farmeoa.com`
- [ ] Login y funcionalidades principales funcionando
- [ ] Sin errores en la consola del navegador

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs del backend:** `pm2 logs capacitaciones-backend`
2. **Revisa la consola del navegador** (F12 → Console)
3. **Contacta a soporte de Dongee** si hay problemas con Node.js o el servidor
4. **Verifica que tu plan de Dongee soporte Node.js**

---

¡Listo! Tu aplicación completa debería estar funcionando en Dongee. 🎉

**Nota:** Si tu plan de Dongee no soporta Node.js, considera:
- Actualizar a un plan VPS
- Usar el backend en Render y solo el frontend en Dongee
- Usar otro servicio de hosting que soporte Node.js


