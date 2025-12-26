# 📋 Resumen Rápido - Variables de Entorno

## ✅ Variables Obligatorias (Mínimo para funcionar)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | Servidor de MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL |
| `DB_USER` | `farmeoa_user` | Usuario de la base de datos |
| `DB_PASSWORD` | `tu_password` | Contraseña de la base de datos |
| `DB_NAME` | `farmeoa_db` | Nombre de la base de datos |
| `JWT_SECRET` | `clave_secreta_larga` | Clave para tokens JWT |
| `PORT` | `3001` | Puerto del backend |
| `NODE_ENV` | `production` | Ambiente (development/production) |

## ⭐ Variables Recomendadas (Funcionalidades importantes)

| Variable | Ejemplo | ¿Para qué sirve? | ¿Cómo obtenerla? |
|----------|---------|------------------|------------------|
| `CLOUDINARY_CLOUD_NAME` | `mi-cloud` | Almacenar archivos en la nube | [cloudinary.com](https://cloudinary.com/) |
| `CLOUDINARY_API_KEY` | `123456789012345` | API Key de Cloudinary | Dashboard de Cloudinary |
| `CLOUDINARY_API_SECRET` | `abc123xyz` | API Secret de Cloudinary | Dashboard de Cloudinary |
| `OPENAI_API_KEY` | `sk-proj-xxx` | Generar preguntas con IA | [platform.openai.com](https://platform.openai.com/api-keys) |

## 🔧 Variables Opcionales (Funcionalidades adicionales)

| Variable | Ejemplo | ¿Para qué sirve? | ¿Cómo obtenerla? |
|----------|---------|------------------|------------------|
| `ASSEMBLYAI_API_KEY` | `abc123` | Transcribir videos | [assemblyai.com](https://www.assemblyai.com/) |
| `OPENAI_MODEL` | `gpt-4o-mini` | Modelo de IA a usar | Opcional (por defecto gpt-4o-mini) |
| `CORS_ORIGIN` | `https://farmeoa.com` | Orígenes permitidos | Tu dominio |

## 📝 Archivo .env Mínimo

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=farmeoa_db

# JWT
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_y_larga

# Servidor
PORT=3001
NODE_ENV=production
```

## 📝 Archivo .env Completo (Recomendado)

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=farmeoa_db

# JWT
JWT_SECRET=tu_clave_secreta_jwt_muy_segura_y_larga

# Servidor
PORT=3001
NODE_ENV=production

# Cloudinary (recomendado)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# OpenAI (opcional)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini

# AssemblyAI (opcional)
ASSEMBLYAI_API_KEY=tu_assemblyai_api_key
```

## 🎯 Prioridades

1. **🔴 CRÍTICO** - Sin esto NO funciona:
   - Base de datos (DB_*)
   - JWT_SECRET
   - PORT, NODE_ENV

2. **🟡 IMPORTANTE** - Funcionalidades clave:
   - Cloudinary (para archivos)
   - OpenAI (para IA)

3. **🟢 OPCIONAL** - Funcionalidades extra:
   - AssemblyAI (transcripciones)
   - CORS_ORIGIN (seguridad)

## 📍 Ubicación del archivo

```
c:\FarmeoDongee\backend\.env
```

## 🔄 Aplicar cambios

Después de modificar el `.env`:

```bash
pm2 restart all
```

## 📚 Documentación Completa

Para más detalles, consulta: `VARIABLES-ENTORNO-COMPLETAS.md`
