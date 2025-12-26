# Variables de Entorno para el Backend

Crea un archivo `.env` en la carpeta del backend con las siguientes variables:

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
# El proyecto usa Cloudinary para almacenar documentos y videos de forma persistente
# Obtén tus credenciales en: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## Instrucciones

1. Copia el contenido de arriba
2. Crea un archivo llamado `.env` en la carpeta `backend/`
3. Reemplaza los valores con tus propias credenciales
4. **NO subas el archivo `.env` a Git** (debe estar en `.gitignore`)

## Notas Importantes

- El archivo `.env` debe estar en la misma carpeta que `server.js`
- Las variables de entorno tienen prioridad sobre los valores por defecto en el código
- **Cloudinary es OBLIGATORIO**: Sin estas variables, las subidas de documentos y videos fallarán
- Si no proporcionas algunas variables opcionales (como OpenAI o AssemblyAI), esas funcionalidades no estarán disponibles
- Para más información sobre Cloudinary, consulta: `backend/CLOUDINARY-SETUP.md`

