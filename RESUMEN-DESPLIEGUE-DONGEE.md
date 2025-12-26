# 📋 Resumen Detallado: Despliegue Completo en Dongee

## 🎯 Objetivo
Subir el proyecto completo (frontend + backend) a Dongee para que funcione en:
- **Frontend:** `https://farmeoa.com`
- **Backend:** `https://api.farmeoa.com`

---

## 📦 PARTE 1: FRONTEND - Subir a `public_html`

### 📁 Ubicación en Dongee:
```
public_html/
```

### 📋 Archivos Exactos a Subir (desde la carpeta `dist/`):

#### ✅ Archivos en la raíz de `dist/`:
```
dist/
├── index.html          ← SUBIR
├── .htaccess          ← SUBIR (importante para React Router)
├── daviivr.png        ← SUBIR
└── image.jpg          ← SUBIR
```

#### ✅ Carpeta completa `assets/`:
```
dist/assets/
├── DailyMotion-CfcT8To3.js      ← SUBIR TODA LA CARPETA
├── Facebook-UM-Y2tKw.js
├── FilePlayer-HDjRmHYb.js
├── index-Bi8S2tN3.css
├── index-DZ8Trq3I.js
├── Kaltura-BHEG0t8u.js
├── Mixcloud-DaW6tEDy.js
├── Mux-BmSuHuL8.js
├── Preview-Cb4_UiyQ.js
├── router-B6oVWZr2.js
├── SoundCloud-CK6Y6Wei.js
├── Streamable-DnF_6Kr4.js
├── Twitch-CDQHU5Cw.js
├── vendor-C_YFlNAw.js
├── Vidyard-BkUnCORL.js
├── Vimeo-D7N7ZjTe.js
├── Wistia-Ef7d_WRW.js
└── YouTube-BmNpwDkM.js
```

### 🔧 Pasos Detallados:

#### Paso 1.1: Acceder a cPanel
1. Inicia sesión en tu cuenta de Dongee
2. Busca y haz clic en **"cPanel"**

#### Paso 1.2: Abrir Administrador de Archivos
1. En cPanel, busca **"Administrador de archivos"** o **"File Manager"**
2. Haz clic para abrirlo

#### Paso 1.3: Navegar a public_html
1. En el panel izquierdo, navega a la carpeta `public_html`
2. Esta es la carpeta raíz de tu dominio `farmeoa.com`

#### Paso 1.4: Limpiar public_html (si tiene archivos)
1. Selecciona **TODOS** los archivos y carpetas existentes en `public_html`
2. Haz clic derecho → **"Eliminar"** o **"Delete"**
3. Confirma la eliminación

#### Paso 1.5: Subir Archivos del Frontend

**Opción A: Subir como ZIP (Recomendado - Más Rápido)**

1. En tu computadora, ve a la carpeta `C:\FarmeoDongee\dist\`
2. Selecciona **TODOS** los archivos y carpetas:
   - `index.html`
   - `.htaccess`
   - `daviivr.png`
   - `image.jpg`
   - Carpeta `assets/` (completa)
3. Comprímelos en un archivo ZIP (ej: `frontend.zip`)
4. En cPanel File Manager, dentro de `public_html`:
   - Haz clic en **"Subir"** o **"Upload"**
   - Selecciona el archivo `frontend.zip`
   - Espera a que se suba completamente
5. Haz clic derecho en `frontend.zip` → **"Extraer"** o **"Extract"**
6. Elimina el archivo `frontend.zip` después de extraer

**Opción B: Subir Archivos Individuales**

1. En cPanel File Manager, dentro de `public_html`:
   - Haz clic en **"Subir"** o **"Upload"**
2. Sube estos archivos uno por uno:
   - `index.html`
   - `.htaccess`
   - `daviivr.png`
   - `image.jpg`
3. Para la carpeta `assets/`:
   - Crea una nueva carpeta llamada `assets` en `public_html`
   - Entra a la carpeta `assets`
   - Sube todos los archivos `.js` y `.css` de `dist/assets/`

#### Paso 1.6: Verificar Estructura Final

Tu `public_html` debe verse exactamente así:

```
public_html/
├── index.html
├── .htaccess
├── daviivr.png
├── image.jpg
└── assets/
    ├── DailyMotion-CfcT8To3.js
    ├── Facebook-UM-Y2tKw.js
    ├── FilePlayer-HDjRmHYb.js
    ├── index-Bi8S2tN3.css
    ├── index-DZ8Trq3I.js
    ├── Kaltura-BHEG0t8u.js
    ├── Mixcloud-DaW6tEDy.js
    ├── Mux-BmSuHuL8.js
    ├── Preview-Cb4_UiyQ.js
    ├── router-B6oVWZr2.js
    ├── SoundCloud-CK6Y6Wei.js
    ├── Streamable-DnF_6Kr4.js
    ├── Twitch-CDQHU5Cw.js
    ├── vendor-C_YFlNAw.js
    ├── Vidyard-BkUnCORL.js
    ├── Vimeo-D7N7ZjTe.js
    ├── Wistia-Ef7d_WRW.js
    └── YouTube-BmNpwDkM.js
```

#### ✅ Verificación del Frontend:
1. Abre en tu navegador: `https://farmeoa.com`
2. Deberías ver la página de inicio de tu aplicación
3. Si ves una página en blanco o error, revisa que el archivo `.htaccess` esté presente

---

## 🔧 PARTE 2: BACKEND - Subir a Subdominio `api`

### 📁 Ubicación en Dongee:
```
public_html/api/    (o la ruta que Dongee asigne al subdominio)
```

### 📋 Archivos Exactos a Subir (desde la carpeta `backend/`):

#### ✅ Archivos en la raíz de `backend/`:
```
backend/
├── server.js                    ← SUBIR (archivo principal)
├── package.json                 ← SUBIR (dependencias)
├── package-lock.json            ← SUBIR (versiones exactas)
├── config.js                    ← SUBIR
├── production.config.js         ← SUBIR
├── start-production.js          ← SUBIR
├── start-dongee.sh              ← SUBIR (script Linux)
├── start-dongee.bat             ← SUBIR (script Windows)
├── ecosystem.config.js          ← SUBIR (configuración PM2)
├── .htaccess                    ← SUBIR (si Dongee usa Apache)
├── aiService.js                 ← SUBIR
├── cargosMetrics.js             ← SUBIR
├── excelReportService.js        ← SUBIR
├── userPreferences.js           ← SUBIR
└── videoProcessor.js            ← SUBIR
```

#### ✅ Carpeta completa `config/`:
```
backend/config/
├── app.js              ← SUBIR TODA LA CARPETA
├── database.js
├── cloudinary.js
├── googleDrive.js
├── googleDriveUpload.js
└── README.md
```

#### ✅ Carpeta completa `db-setup/`:
```
backend/db-setup/
├── connection-manager.js    ← SUBIR TODA LA CARPETA
├── package.json
├── package-lock.json
├── railway-mysql-setup.sql
├── railway-setup.js
├── simple-railway-setup.sql
└── README-RAILWAY.md
```

#### ❌ NO Subir (se crearán en el servidor):
```
backend/
├── node_modules/      ← NO SUBIR (se instala con npm install)
├── uploads/           ← NO SUBIR (se crea en el servidor)
├── temp/              ← NO SUBIR (se crea en el servidor)
├── logs/              ← NO SUBIR (se crea en el servidor)
└── .env               ← NO SUBIR (se crea en el servidor)
```

#### 📄 Archivos de Documentación (Opcionales - No necesarios para funcionar):
```
backend/
├── DEPLOYMENT.md
├── README-IA.md
├── README-TRANSCRIPCION.md
├── VARIABLES-ENTORNO.md
├── CLOUDINARY-SETUP.md
├── GOOGLE-DRIVE-SETUP.md
└── (otros .md)
```

### 🔧 Pasos Detallados:

#### Paso 2.1: Crear Subdominio en cPanel

**⚠️ IMPORTANTE:** Hay dos formas de crear el subdominio en cPanel:

**Opción A: Usar "Subdominios" (Recomendado - Más fácil)**

1. En cPanel, busca **"Subdominios"** o **"Subdomains"** (NO "Crear un dominio")
2. Haz clic en **"Crear Subdominio"** o **"Create Subdomain"**
3. Completa el formulario:
   - **Subdominio:** `api` (solo escribir "api", sin el punto ni el dominio)
   - **Dominio:** `farmeoa.com` (seleccionar del dropdown o ya estará seleccionado)
   - **Directorio:** `api` (o `public_html/api`)
4. Haz clic en **"Crear"** o **"Create"**
5. Anota la ruta del directorio (ej: `/home/usuario/public_html/api`)

**Opción B: Si solo encuentras "Crear un dominio" (Addon Domain)**

Si en tu cPanel solo ves la opción "Crear un dominio" o "Addon Domain", completa así:

1. En el campo **"Dominio"** (Domain):
   - Escribe: `api.farmeoa.com` (el dominio completo con 2 etiquetas: "api" y "farmeoa.com")
   - Esto resuelve el error "debe tener al menos 2 etiquetas"

2. En el campo **"Subdominio"** (Subdomain):
   - Debería aparecer automáticamente: `api.farmeoa.com`
   - O puedes dejarlo como está

3. En el campo **"Document Root"** (File System Location):
   - Debería mostrar: `/api` o `/public_html/api`
   - O puedes cambiarlo a: `api` o `public_html/api`

4. **NO marques** la casilla "Share document root" (compartir raíz de documentos)

5. Haz clic en **"Enviar"** o **"Submit"**

**Nota:** La diferencia es:
- **Subdominios**: Solo escribes "api" y el sistema agrega ".farmeoa.com"
- **Addon Domain**: Debes escribir el dominio completo "api.farmeoa.com"

#### Paso 2.2: Preparar Archivos del Backend

En tu computadora, ve a la carpeta `C:\FarmeoDongee\backend\`

**Crea un ZIP con estos archivos:**

1. Selecciona estos archivos de la raíz:
   - `server.js`
   - `package.json`
   - `package-lock.json`
   - `config.js`
   - `production.config.js`
   - `start-production.js`
   - `start-dongee.sh`
   - `start-dongee.bat`
   - `ecosystem.config.js`
   - `.htaccess`
   - `aiService.js`
   - `cargosMetrics.js`
   - `excelReportService.js`
   - `userPreferences.js`
   - `videoProcessor.js`

2. Selecciona estas carpetas completas:
   - `config/` (carpeta completa)
   - `db-setup/` (carpeta completa)

3. Comprime todo en un archivo ZIP (ej: `backend.zip`)

**⚠️ IMPORTANTE:** NO incluyas:
- `node_modules/`
- `uploads/`
- `temp/`
- `logs/`
- `.env`

#### Paso 2.3: Subir Archivos del Backend
1. En cPanel File Manager, navega a la carpeta del subdominio `api`
   - Ruta típica: `public_html/api/` o `/home/usuario/public_html/api/`
2. Si la carpeta tiene archivos, elimínalos primero
3. Haz clic en **"Subir"** o **"Upload"**
4. Selecciona el archivo `backend.zip`
5. Espera a que se suba completamente
6. Haz clic derecho en `backend.zip` → **"Extraer"** o **"Extract"**
7. Elimina el archivo `backend.zip` después de extraer

#### Paso 2.4: Verificar Estructura del Backend

Tu carpeta `api` debe verse así:

```
api/
├── server.js
├── package.json
├── package-lock.json
├── config.js
├── production.config.js
├── start-production.js
├── start-dongee.sh
├── start-dongee.bat
├── ecosystem.config.js
├── .htaccess
├── aiService.js
├── cargosMetrics.js
├── excelReportService.js
├── userPreferences.js
├── videoProcessor.js
├── config/
│   ├── app.js
│   ├── database.js
│   ├── cloudinary.js
│   ├── googleDrive.js
│   ├── googleDriveUpload.js
│   └── README.md
└── db-setup/
    ├── connection-manager.js
    ├── package.json
    ├── package-lock.json
    ├── railway-mysql-setup.sql
    ├── railway-setup.js
    ├── simple-railway-setup.sql
    └── README-RAILWAY.md
```

---

## ⚙️ PARTE 3: Configurar el Backend en el Servidor

### Paso 3.1: Acceder al Servidor (SSH/Terminal)

**Opción A: Terminal de cPanel**
1. En cPanel, busca **"Terminal"** o **"Web Terminal"**
2. Haz clic para abrir

**Opción B: SSH (si tienes acceso)**
1. Usa un cliente SSH (PuTTY, Terminal, etc.)
2. Conéctate con tus credenciales SSH

### Paso 3.2: Navegar a la Carpeta del Backend

```bash
# Navegar a la carpeta del backend
cd ~/public_html/api

# O la ruta específica que te dio Dongee
# Ejemplo: cd /home/tuusuario/public_html/api
```

### Paso 3.3: Verificar Node.js

```bash
# Verificar si Node.js está instalado
node -v

# Debe mostrar algo como: v18.x.x o superior
# Si no está instalado, contacta a soporte de Dongee
```

### Paso 3.4: Instalar Dependencias

```bash
# Asegúrate de estar en la carpeta del backend
cd ~/public_html/api

# Instalar todas las dependencias
npm install --production

# Esto creará la carpeta node_modules/ automáticamente
# Puede tardar varios minutos
```

### Paso 3.5: Crear Archivo .env

```bash
# Crear el archivo .env
nano .env
# O usar: vi .env
```

**Pega este contenido en el archivo:**

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

# JWT Secret (cambia esto por una clave segura y única)
JWT_SECRET=capacitaciones_jwt_secret_2024_ultra_secure_key

# OpenAI API Key (si usas IA)
OPENAI_API_KEY=tu_openai_api_key_aqui

# AssemblyAI API Key (si usas transcripción de videos)
ASSEMBLYAI_API_KEY=tu_assemblyai_api_key_aqui

# Cloudinary (OBLIGATORIO - para almacenamiento de documentos y videos)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**⚠️ IMPORTANTE sobre Cloudinary:**
- Las variables de Cloudinary son **OBLIGATORIAS** para que funcionen las subidas de documentos y videos
- Si no las configuras, las subidas de archivos fallarán
- Obtén tus credenciales en: https://cloudinary.com/console
- Ver más información en: `backend/CLOUDINARY-SETUP.md`

**Para guardar:**
- En `nano`: Presiona `Ctrl + X`, luego `Y`, luego `Enter`
- En `vi`: Presiona `Esc`, luego escribe `:wq` y presiona `Enter`

### Paso 3.6: Crear Carpetas Necesarias

```bash
# Crear carpetas para uploads, temp y logs
mkdir -p uploads/videos
mkdir -p uploads/documents
mkdir -p temp/videos
mkdir -p logs

# Verificar que se crearon
ls -la
```

### Paso 3.7: Configurar Permisos

```bash
# Dar permisos de escritura
chmod 755 uploads
chmod 755 temp
chmod 755 logs
chmod 644 .env
```

---

## 🚀 PARTE 4: Iniciar el Backend

### Paso 4.1: Instalar PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar instalación
pm2 --version
```

### Paso 4.2: Iniciar el Servidor con PM2

```bash
# Asegúrate de estar en la carpeta del backend
cd ~/public_html/api

# Iniciar el servidor
pm2 start server.js --name "capacitaciones-backend"

# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs capacitaciones-backend
```

### Paso 4.3: Configurar PM2 para Inicio Automático

```bash
# Guardar configuración actual
pm2 save

# Configurar para iniciar al arrancar el servidor
pm2 startup

# Sigue las instrucciones que aparezcan en pantalla
# Generalmente te pedirá ejecutar un comando como:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u tuusuario --hp /home/tuusuario
```

### Comandos Útiles de PM2:

```bash
# Ver estado de todos los procesos
pm2 status

# Ver logs del backend
pm2 logs capacitaciones-backend

# Reiniciar el servidor
pm2 restart capacitaciones-backend

# Detener el servidor
pm2 stop capacitaciones-backend

# Eliminar el proceso
pm2 delete capacitaciones-backend

# Ver información detallada
pm2 info capacitaciones-backend
```

---

## ✅ PARTE 5: Verificación Final

### Verificar Backend:

1. **Abrir en el navegador:**
   ```
   https://api.farmeoa.com/api/test
   ```

2. **Deberías ver una respuesta JSON** como:
   ```json
   {
     "message": "API funcionando",
     "status": "ok"
   }
   ```

3. **Si no funciona:**
   ```bash
   # Verificar que el servidor esté corriendo
   pm2 status
   
   # Ver logs para encontrar el error
   pm2 logs capacitaciones-backend
   ```

### Verificar Frontend:

1. **Abrir en el navegador:**
   ```
   https://farmeoa.com
   ```

2. **Deberías ver:**
   - La página de inicio de tu aplicación
   - Sin errores en la consola (F12 → Console)

3. **Probar funcionalidades:**
   - Intentar hacer login
   - Navegar por las páginas
   - Verificar que las llamadas al backend funcionen

---

## 🔧 Troubleshooting Rápido

### Error: "No permitido por CORS"
```bash
# Verificar que farmeoa.com esté en la lista de CORS
cd ~/public_html/api
nano config/app.js
# Busca la sección "allowedOrigins" y verifica que tenga:
# 'https://farmeoa.com'
# 'https://www.farmeoa.com'
```

### Error: "Puerto 3001 ya en uso"
```bash
# Ver qué proceso está usando el puerto
lsof -i :3001

# O detener todos los procesos de PM2
pm2 stop all
pm2 delete all

# Reiniciar
pm2 start server.js --name "capacitaciones-backend"
```

### Error: "Module not found"
```bash
# Reinstalar dependencias
cd ~/public_html/api
rm -rf node_modules
npm install --production
```

### El servidor se detiene al cerrar la terminal
```bash
# Asegúrate de usar PM2 y configurar startup
pm2 start server.js --name "capacitaciones-backend"
pm2 save
pm2 startup
```

---

## 📝 Checklist Final

Antes de considerar el despliegue completo:

### Frontend:
- [ ] Todos los archivos de `dist/` subidos a `public_html`
- [ ] Archivo `.htaccess` presente en `public_html`
- [ ] Carpeta `assets/` con todos los archivos
- [ ] Sitio accesible en `https://farmeoa.com`

### Backend:
- [ ] Subdominio `api.farmeoa.com` creado
- [ ] Todos los archivos del backend subidos a la carpeta `api`
- [ ] Carpetas `config/` y `db-setup/` subidas
- [ ] `node_modules/` instalado con `npm install --production`
- [ ] Archivo `.env` creado con las variables correctas
- [ ] Carpetas `uploads/`, `temp/`, `logs/` creadas
- [ ] PM2 instalado y configurado
- [ ] Servidor ejecutándose con PM2
- [ ] Backend accesible en `https://api.farmeoa.com/api/test`
- [ ] PM2 configurado para inicio automático

### Verificación:
- [ ] Frontend carga correctamente
- [ ] Backend responde a peticiones
- [ ] Login funciona
- [ ] Sin errores en la consola del navegador
- [ ] Sin errores en los logs de PM2

---

## 📚 Archivos de Referencia

- **Guía completa detallada:** `GUIA-DESPLIEGUE-COMPLETO-DONGEE.md`
- **Variables de entorno:** `backend/VARIABLES-ENTORNO.md`

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs: `pm2 logs capacitaciones-backend`
2. Revisa la consola del navegador (F12)
3. Contacta a soporte de Dongee si hay problemas con Node.js
4. Verifica que tu plan soporte Node.js y SSH

---

¡Listo! Tu aplicación completa debería estar funcionando en Dongee. 🎉
