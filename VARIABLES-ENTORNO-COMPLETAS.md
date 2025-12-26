# 🔐 Variables de Entorno Completas - FarmeoDongee

Esta es la lista completa de todas las variables de entorno que necesitas configurar para tu proyecto.

---

## 📋 Índice

1. [Variables Obligatorias](#-variables-obligatorias)
2. [Variables Opcionales](#-variables-opcionales)
3. [Archivo .env Completo](#-archivo-env-completo)
4. [Configuración por Servicio](#-configuración-por-servicio)
5. [Cómo Obtener las API Keys](#-cómo-obtener-las-api-keys)

---

## ⚠️ Variables Obligatorias

Estas variables **DEBEN** estar configuradas para que tu aplicación funcione:

### 1. Base de Datos (MySQL)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_NAME=farmeoa_db
```

**Descripción:**
- `DB_HOST`: Dirección del servidor MySQL (localhost en local, IP o dominio en producción)
- `DB_PORT`: Puerto de MySQL (por defecto 3306)
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña del usuario de la base de datos
- `DB_NAME`: Nombre de la base de datos

**Ejemplo para Dongee:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=farmeoa_user
DB_PASSWORD=tu_password_seguro_aqui
DB_NAME=farmeoa_db
```

---

### 2. JWT (Autenticación)

```env
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_y_larga
```

**Descripción:**
- `JWT_SECRET`: Clave secreta para firmar los tokens JWT (debe ser una cadena larga y aleatoria)

**Ejemplo:**
```env
JWT_SECRET=capacitaciones_jwt_secret_2024_ultra_secure_key_XyZ123!@#
```

> **⚠️ IMPORTANTE:** Usa una clave única y segura. Puedes generarla con:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

### 3. Servidor

```env
PORT=3001
NODE_ENV=production
```

**Descripción:**
- `PORT`: Puerto en el que correrá el backend (por defecto 3001)
- `NODE_ENV`: Ambiente de ejecución (`development` o `production`)

**Ejemplo para Dongee:**
```env
PORT=3001
NODE_ENV=production
```

---

## 🔧 Variables Opcionales

Estas variables son opcionales pero habilitan funcionalidades adicionales:

### 4. Cloudinary (Almacenamiento de Archivos)

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**Descripción:**
- `CLOUDINARY_CLOUD_NAME`: Nombre de tu cuenta de Cloudinary
- `CLOUDINARY_API_KEY`: API Key de Cloudinary
- `CLOUDINARY_API_SECRET`: API Secret de Cloudinary

**¿Para qué sirve?**
- Almacenar documentos (PDF, Word, Excel)
- Almacenar videos
- Almacenar imágenes

**¿Es obligatorio?**
- ❌ No, pero **altamente recomendado** para producción
- Si no lo configuras, los archivos se guardarán localmente (puede llenar el disco)

**Cómo obtenerlo:**
1. Crea una cuenta en [Cloudinary](https://cloudinary.com/)
2. Ve al Dashboard
3. Copia las credenciales

---

### 5. OpenAI (Inteligencia Artificial)

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
```

**Descripción:**
- `OPENAI_API_KEY`: API Key de OpenAI
- `OPENAI_MODEL`: Modelo a usar (opcional, por defecto `gpt-4o-mini`)

**¿Para qué sirve?**
- Generar preguntas automáticas para evaluaciones
- Chatbot de ayuda
- Análisis de contenido

**¿Es obligatorio?**
- ❌ No, pero sin esto no funcionará la generación automática de preguntas

**Cómo obtenerlo:**
1. Crea una cuenta en [OpenAI](https://platform.openai.com/)
2. Ve a [API Keys](https://platform.openai.com/api-keys)
3. Crea una nueva API Key

**Costo:**
- Modelo `gpt-4o-mini`: ~$0.15 por 1M tokens (muy barato)
- Modelo `gpt-3.5-turbo`: ~$0.50 por 1M tokens

---

### 6. AssemblyAI (Transcripción de Audio/Video)

```env
ASSEMBLYAI_API_KEY=tu_assemblyai_api_key
```

**Descripción:**
- `ASSEMBLYAI_API_KEY`: API Key de AssemblyAI

**¿Para qué sirve?**
- Transcribir videos subidos
- Generar subtítulos automáticos
- Extraer texto de audio

**¿Es obligatorio?**
- ❌ No, pero sin esto no funcionará la transcripción de videos

**Cómo obtenerlo:**
1. Crea una cuenta en [AssemblyAI](https://www.assemblyai.com/)
2. Ve al Dashboard
3. Copia tu API Key

**Costo:**
- Plan gratuito: 5 horas/mes
- Plan de pago: $0.00025 por segundo (~$0.90 por hora)

---

### 7. Google Drive (Almacenamiento - OPCIONAL)

```env
GOOGLE_CLIENT_EMAIL=tu-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_private_key_aqui\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=tu_folder_id
```

**Descripción:**
- `GOOGLE_CLIENT_EMAIL`: Email de la cuenta de servicio de Google
- `GOOGLE_PRIVATE_KEY`: Clave privada de la cuenta de servicio
- `GOOGLE_DRIVE_FOLDER_ID`: ID de la carpeta de Google Drive

**¿Para qué sirve?**
- Almacenar archivos en Google Drive (alternativa a Cloudinary)

**¿Es obligatorio?**
- ❌ No, y **NO SE RECOMIENDA** usar esto
- Es mejor usar Cloudinary o almacenamiento local

---

### 8. CORS (Seguridad)

```env
CORS_ORIGIN=https://farmeoa.com,https://www.farmeoa.com
```

**Descripción:**
- `CORS_ORIGIN`: Orígenes permitidos para peticiones CORS (separados por comas)

**¿Es obligatorio?**
- ❌ No, por defecto permite todos los orígenes en desarrollo
- ✅ Recomendado en producción para mayor seguridad

**Ejemplo:**
```env
CORS_ORIGIN=https://farmeoa.com,https://www.farmeoa.com,https://api.farmeoa.com
```

---

## 📄 Archivo .env Completo

### Opción 1: Configuración Mínima (Solo lo esencial)

```env
# ========================================
# CONFIGURACIÓN MÍNIMA
# ========================================

# Servidor
PORT=3001
NODE_ENV=production

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=farmeoa_user
DB_PASSWORD=tu_password_seguro_aqui
DB_NAME=farmeoa_db

# JWT
JWT_SECRET=capacitaciones_jwt_secret_2024_ultra_secure_key_XyZ123!@#
```

### Opción 2: Configuración Completa (Todas las funcionalidades)

```env
# ========================================
# CONFIGURACIÓN DEL SERVIDOR
# ========================================
PORT=3001
NODE_ENV=production

# ========================================
# BASE DE DATOS (MySQL)
# ========================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=farmeoa_user
DB_PASSWORD=tu_password_seguro_aqui
DB_NAME=farmeoa_db

# ========================================
# AUTENTICACIÓN (JWT)
# ========================================
JWT_SECRET=capacitaciones_jwt_secret_2024_ultra_secure_key_XyZ123!@#

# ========================================
# CLOUDINARY (Almacenamiento de Archivos)
# ========================================
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=tu_api_secret_aqui

# ========================================
# OPENAI (Inteligencia Artificial)
# ========================================
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini

# ========================================
# ASSEMBLYAI (Transcripción de Audio/Video)
# ========================================
ASSEMBLYAI_API_KEY=tu_assemblyai_api_key

# ========================================
# CORS (Seguridad)
# ========================================
CORS_ORIGIN=https://farmeoa.com,https://www.farmeoa.com

# ========================================
# GOOGLE DRIVE (OPCIONAL - NO RECOMENDADO)
# ========================================
# GOOGLE_CLIENT_EMAIL=tu-service-account@project.iam.gserviceaccount.com
# GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_private_key_aqui\n-----END PRIVATE KEY-----\n"
# GOOGLE_DRIVE_FOLDER_ID=tu_folder_id
```

---

## 🎯 Configuración por Servicio

### Para Dongee (Hosting Compartido)

```env
# Servidor
PORT=3001
NODE_ENV=production

# Base de Datos (proporcionada por Dongee)
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_dongee
DB_PASSWORD=tu_password_dongee
DB_NAME=tu_base_datos_dongee

# JWT (genera una clave única)
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_y_larga

# Cloudinary (recomendado para archivos)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# OpenAI (opcional, para IA)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AssemblyAI (opcional, para transcripciones)
ASSEMBLYAI_API_KEY=tu_assemblyai_api_key
```

### Para Render.com

```env
# Servidor
PORT=3001
NODE_ENV=production

# Base de Datos (Railway o servicio externo)
DB_HOST=caboose.proxy.rlwy.net
DB_PORT=16023
DB_USER=root
DB_PASSWORD=tu_password_railway
DB_NAME=railway

# JWT
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_y_larga

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AssemblyAI
ASSEMBLYAI_API_KEY=tu_assemblyai_api_key

# CORS
CORS_ORIGIN=https://farmeoa.com,https://otro-frontend.onrender.com
```

### Para Desarrollo Local

```env
# Servidor
PORT=3001
NODE_ENV=development

# Base de Datos (local)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=farmeoa_db

# JWT
JWT_SECRET=dev_secret_key_not_for_production

# Cloudinary (opcional en desarrollo)
# CLOUDINARY_CLOUD_NAME=tu_cloud_name
# CLOUDINARY_API_KEY=tu_api_key
# CLOUDINARY_API_SECRET=tu_api_secret

# OpenAI (opcional en desarrollo)
# OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AssemblyAI (opcional en desarrollo)
# ASSEMBLYAI_API_KEY=tu_assemblyai_api_key
```

---

## 🔑 Cómo Obtener las API Keys

### 1. Cloudinary

1. Ve a [https://cloudinary.com/](https://cloudinary.com/)
2. Crea una cuenta gratuita
3. En el Dashboard, encontrarás:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
4. Copia estos valores a tu `.env`

**Plan Gratuito:**
- ✅ 25 GB de almacenamiento
- ✅ 25 GB de ancho de banda/mes
- ✅ Suficiente para empezar

---

### 2. OpenAI

1. Ve a [https://platform.openai.com/](https://platform.openai.com/)
2. Crea una cuenta
3. Ve a [API Keys](https://platform.openai.com/api-keys)
4. Haz clic en "Create new secret key"
5. Copia la clave (solo se muestra una vez)
6. Pégala en tu `.env`

**Costo:**
- Modelo `gpt-4o-mini`: ~$0.15 por 1M tokens
- Necesitas agregar crédito (mínimo $5)

---

### 3. AssemblyAI

1. Ve a [https://www.assemblyai.com/](https://www.assemblyai.com/)
2. Crea una cuenta gratuita
3. En el Dashboard, copia tu API Key
4. Pégala en tu `.env`

**Plan Gratuito:**
- ✅ 5 horas de transcripción/mes
- ✅ Suficiente para probar

---

### 4. JWT Secret

Genera una clave segura con Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

O usa un generador online:
- [https://randomkeygen.com/](https://randomkeygen.com/)

---

## 📝 Notas Importantes

### ⚠️ Seguridad

1. **NUNCA** subas el archivo `.env` a Git
2. Asegúrate de que `.env` esté en `.gitignore`
3. Usa claves diferentes para desarrollo y producción
4. Cambia las claves periódicamente

### 📁 Ubicación del Archivo

El archivo `.env` debe estar en:
```
c:\FarmeoDongee\backend\.env
```

### 🔄 Aplicar Cambios

Después de modificar el `.env`:

```bash
# Si usas PM2
pm2 restart all

# Si usas node directamente
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
node server.js
```

### ✅ Verificar Configuración

Puedes verificar que las variables estén cargadas:

```bash
# En el backend, agrega esto temporalmente en server.js
console.log('Variables de entorno cargadas:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('PORT:', process.env.PORT);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Configurado' : '❌ No configurado');
```

---

## 🎯 Resumen de Prioridades

### Nivel 1: OBLIGATORIO (Sin esto no funciona)
- ✅ `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- ✅ `JWT_SECRET`
- ✅ `PORT`, `NODE_ENV`

### Nivel 2: MUY RECOMENDADO (Funcionalidades importantes)
- ⭐ `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- ⭐ `OPENAI_API_KEY`

### Nivel 3: OPCIONAL (Funcionalidades adicionales)
- 🔧 `ASSEMBLYAI_API_KEY`
- 🔧 `CORS_ORIGIN`
- 🔧 `OPENAI_MODEL`

### Nivel 4: NO RECOMENDADO (Obsoleto o innecesario)
- ❌ `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_DRIVE_FOLDER_ID`

---

## 📞 Ayuda

Si tienes problemas con alguna variable:

1. Verifica que el archivo `.env` esté en la ubicación correcta
2. Asegúrate de que no haya espacios antes o después del `=`
3. Las claves con caracteres especiales deben ir entre comillas dobles
4. Reinicia el servidor después de cambiar el `.env`

**Ejemplo de formato correcto:**
```env
# ✅ CORRECTO
DB_HOST=localhost
JWT_SECRET="mi_clave_con_espacios y símbolos!@#"

# ❌ INCORRECTO
DB_HOST = localhost          # Espacios alrededor del =
JWT_SECRET=mi clave          # Espacios sin comillas
```

---

**¡Listo! Con esta guía tienes toda la información necesaria para configurar las variables de entorno de tu proyecto.** 🚀
