# 🔍 Guía de Verificación - Proyecto en Dongee

Esta guía te ayudará a verificar que tu aplicación funcione correctamente después del despliegue en Dongee.

---

## 📋 Checklist de Verificación Rápida

### ✅ Verificaciones Básicas (5 minutos)
- [ ] El sitio carga sin errores 404
- [ ] Los archivos estáticos (CSS, JS, imágenes) se cargan correctamente
- [ ] La consola del navegador no muestra errores críticos
- [ ] El backend responde en la URL correcta

### ✅ Verificaciones de Funcionalidad (10 minutos)
- [ ] Sistema de autenticación funciona (login/registro)
- [ ] Las rutas de React Router funcionan correctamente
- [ ] La conexión a la base de datos está activa
- [ ] Las APIs responden correctamente
- [ ] La subida de archivos funciona

### ✅ Verificaciones Avanzadas (15 minutos)
- [ ] Todas las funcionalidades principales funcionan
- [ ] Los servicios externos (IA, Cloudinary, etc.) responden
- [ ] El rendimiento es aceptable
- [ ] No hay errores en los logs del servidor

---

## 🚀 Paso 1: Verificación Inicial del Frontend

### 1.1 Acceder al Sitio
```
URL: https://farmeoa.com
o
URL: http://tu-dominio-dongee.com
```

**¿Qué verificar?**
- ✅ La página principal carga
- ✅ No aparece error 404 o 500
- ✅ El diseño se ve correctamente

### 1.2 Abrir la Consola del Navegador
**Cómo hacerlo:**
1. Presiona `F12` o `Ctrl + Shift + I`
2. Ve a la pestaña "Console"

**¿Qué buscar?**
- ❌ **Errores en rojo** - Indica problemas críticos
- ⚠️ **Advertencias en amarillo** - Pueden ser normales
- ✅ **Sin errores** - Todo bien

**Errores comunes y soluciones:**

```
❌ Error: "Failed to load resource: net::ERR_ABORTED 404"
Solución: Archivos estáticos no se encuentran
→ Verifica que la carpeta dist/ se haya subido correctamente
→ Revisa el archivo .htaccess

❌ Error: "CORS policy: No 'Access-Control-Allow-Origin'"
Solución: Problema de CORS en el backend
→ Verifica la configuración de CORS en server.js

❌ Error: "Cannot connect to backend"
Solución: El backend no está respondiendo
→ Verifica que el backend esté corriendo
→ Revisa la URL del backend en api.js
```

### 1.3 Verificar la Red (Network)
1. En DevTools, ve a la pestaña "Network"
2. Recarga la página (`Ctrl + R`)
3. Observa las peticiones

**¿Qué verificar?**
- ✅ Los archivos `.js` y `.css` cargan con código 200
- ✅ Las imágenes cargan correctamente
- ✅ Las peticiones a `/api/*` responden

---

## 🔧 Paso 2: Verificación del Backend

### 2.1 Verificar que el Backend Está Corriendo

**Opción A: Desde el navegador**
```
URL: https://farmeoa.com/api/health
o
URL: http://tu-dominio-dongee.com:3001/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-03T16:49:06.000Z"
}
```

**Opción B: Desde SSH (si tienes acceso)**
```bash
# Conectarse por SSH
ssh usuario@tu-servidor-dongee.com

# Verificar que Node.js está corriendo
ps aux | grep node

# Verificar logs del backend
cd ~/app/backend
tail -f logs/backend.log
# o
pm2 logs
```

### 2.2 Verificar la Conexión a la Base de Datos

**Prueba desde el navegador:**
```
URL: https://farmeoa.com/api/test-db
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Database connection successful"
}
```

**Si falla:**
```bash
# Conectarse por SSH
ssh usuario@tu-servidor-dongee.com

# Verificar que MySQL está corriendo
systemctl status mysql
# o
service mysql status

# Probar conexión manual
mysql -u tu_usuario -p
```

### 2.3 Verificar las Variables de Entorno

**Desde SSH:**
```bash
cd ~/app/backend
cat .env
```

**Variables críticas que deben estar:**
```env
# Base de datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=farmeoa_db

# JWT
JWT_SECRET=tu_secreto_seguro

# Cloudinary (si usas)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Google AI (si usas)
GOOGLE_AI_API_KEY=tu_google_api_key

# Puerto
PORT=3001
```

---

## 🧪 Paso 3: Pruebas Funcionales

### 3.1 Probar el Sistema de Autenticación

**Registro de Usuario:**
1. Ve a la página de registro
2. Crea una cuenta nueva
3. Verifica que:
   - ✅ El formulario se envía sin errores
   - ✅ Recibes un mensaje de éxito
   - ✅ Se crea el token de autenticación

**Login:**
1. Intenta iniciar sesión
2. Verifica que:
   - ✅ El login funciona
   - ✅ Te redirige al dashboard
   - ✅ El token se guarda en localStorage

**Verificar en la consola:**
```javascript
// Abre la consola (F12) y ejecuta:
localStorage.getItem('authToken')
// Debe mostrar un token JWT
```

### 3.2 Probar las Rutas de React Router

**Navega por las diferentes páginas:**
- `/` - Página principal
- `/login` - Login
- `/register` - Registro
- `/dashboard` - Dashboard
- `/capacitaciones` - Capacitaciones
- etc.

**¿Qué verificar?**
- ✅ Las rutas funcionan sin recargar la página
- ✅ No aparece error 404 al recargar una ruta
- ✅ El archivo `.htaccess` está configurado correctamente

**Si las rutas no funcionan al recargar:**
```apache
# Verifica que .htaccess tenga esto:
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### 3.3 Probar las APIs Principales

**Desde la consola del navegador:**

```javascript
// 1. Probar endpoint de salud
fetch('https://farmeoa.com/api/health')
  .then(r => r.json())
  .then(console.log);

// 2. Probar autenticación
fetch('https://farmeoa.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'password123'
  })
})
  .then(r => r.json())
  .then(console.log);

// 3. Probar endpoint protegido
const token = localStorage.getItem('authToken');
fetch('https://farmeoa.com/api/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(console.log);
```

### 3.4 Probar Subida de Archivos

1. Intenta subir una imagen o video
2. Verifica que:
   - ✅ El archivo se sube sin errores
   - ✅ Se guarda en la carpeta correcta o en Cloudinary
   - ✅ La URL del archivo es accesible

**Verificar permisos de carpetas (SSH):**
```bash
cd ~/public_html
ls -la uploads/
# Debe mostrar permisos 755 o 777

# Si no tiene permisos:
chmod -R 755 uploads/
```

---

## 🔍 Paso 4: Verificación de Servicios Externos

### 4.1 Verificar Google AI (Gemini)

**Desde la consola del navegador:**
```javascript
// Probar generación de contenido con IA
fetch('https://farmeoa.com/api/ai/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  body: JSON.stringify({
    prompt: 'Genera un título para una capacitación sobre seguridad'
  })
})
  .then(r => r.json())
  .then(console.log);
```

**Errores comunes:**
```
❌ "API key not valid"
→ Verifica que GOOGLE_AI_API_KEY esté en .env
→ Verifica que la API key sea válida en Google AI Studio

❌ "Quota exceeded"
→ Has excedido el límite gratuito de Google AI
→ Espera o actualiza tu plan
```

### 4.2 Verificar Cloudinary (si usas)

**Desde la consola del navegador:**
```javascript
// Probar subida de imagen
const formData = new FormData();
formData.append('image', document.querySelector('input[type="file"]').files[0]);

fetch('https://farmeoa.com/api/upload/cloudinary', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  },
  body: formData
})
  .then(r => r.json())
  .then(console.log);
```

---

## 📊 Paso 5: Verificación de Rendimiento

### 5.1 Verificar Velocidad de Carga

**Herramientas:**
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [GTmetrix](https://gtmetrix.com/)

**Métricas importantes:**
- ✅ **LCP** (Largest Contentful Paint): < 2.5s
- ✅ **FID** (First Input Delay): < 100ms
- ✅ **CLS** (Cumulative Layout Shift): < 0.1

### 5.2 Verificar Tamaño de Archivos

**Desde DevTools > Network:**
- ✅ Los archivos JS deben estar minificados
- ✅ Los archivos CSS deben estar minificados
- ✅ Las imágenes deben estar optimizadas

**Si los archivos son muy grandes:**
```bash
# Reconstruir con optimización
npm run build

# Verificar el tamaño
cd dist
du -sh *
```

---

## 🐛 Paso 6: Verificación de Errores Comunes

### Error 1: "Cannot GET /ruta"
**Causa:** React Router no funciona al recargar
**Solución:**
```bash
# Verifica que .htaccess esté en public_html/
cat ~/public_html/.htaccess
```

### Error 2: "CORS Error"
**Causa:** El backend no permite peticiones del frontend
**Solución:**
```javascript
// En server.js, verifica:
app.use(cors({
  origin: ['https://farmeoa.com', 'http://localhost:5173'],
  credentials: true
}));
```

### Error 3: "Database connection failed"
**Causa:** Credenciales incorrectas o MySQL no está corriendo
**Solución:**
```bash
# Verificar MySQL
systemctl status mysql

# Probar conexión
mysql -u tu_usuario -p -e "SHOW DATABASES;"
```

### Error 4: "Module not found"
**Causa:** Dependencias no instaladas
**Solución:**
```bash
cd ~/app/backend
npm install
pm2 restart all
```

---

## 📝 Paso 7: Logs y Monitoreo

### 7.1 Verificar Logs del Backend

**Con PM2:**
```bash
pm2 logs
pm2 logs backend --lines 100
```

**Logs manuales:**
```bash
cd ~/app/backend
tail -f logs/error.log
tail -f logs/access.log
```

### 7.2 Verificar Logs de Apache/Nginx

```bash
# Apache
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log

# Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### 7.3 Verificar Uso de Recursos

```bash
# CPU y memoria
top
htop

# Espacio en disco
df -h

# Procesos de Node.js
ps aux | grep node
```

---

## ✅ Checklist Final de Verificación

### Frontend
- [ ] El sitio carga en https://farmeoa.com
- [ ] No hay errores en la consola del navegador
- [ ] Los estilos se ven correctamente
- [ ] Las rutas de React Router funcionan
- [ ] Las imágenes y recursos estáticos cargan

### Backend
- [ ] El backend responde en /api/health
- [ ] La base de datos está conectada
- [ ] Las variables de entorno están configuradas
- [ ] PM2 muestra el proceso corriendo
- [ ] No hay errores en los logs

### Funcionalidad
- [ ] El login/registro funciona
- [ ] Las APIs responden correctamente
- [ ] La subida de archivos funciona
- [ ] Los servicios externos (IA, Cloudinary) funcionan
- [ ] Las notificaciones/mensajes se muestran

### Rendimiento
- [ ] La página carga en menos de 3 segundos
- [ ] No hay errores de memoria
- [ ] El servidor responde rápidamente

---

## 🆘 Comandos Útiles de Emergencia

### Reiniciar Todo
```bash
# Reiniciar backend
pm2 restart all

# Reiniciar Apache
sudo systemctl restart apache2

# Reiniciar MySQL
sudo systemctl restart mysql

# Reiniciar servidor completo (último recurso)
sudo reboot
```

### Ver Estado de Servicios
```bash
# Ver procesos de PM2
pm2 status
pm2 monit

# Ver servicios del sistema
systemctl status apache2
systemctl status mysql
systemctl status nginx
```

### Limpiar y Reconstruir
```bash
# Frontend
cd ~/app
npm run build
rm -rf ~/public_html/*
cp -r dist/* ~/public_html/

# Backend
cd ~/app/backend
npm install
pm2 restart all
```

---

## 📞 Contacto y Soporte

Si encuentras problemas que no puedes resolver:

1. **Revisa los logs** - La mayoría de errores están ahí
2. **Busca el error en Google** - Probablemente alguien ya lo resolvió
3. **Contacta a soporte de Dongee** - Ellos conocen su infraestructura
4. **Documenta el error** - Guarda screenshots y logs

---

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. **Configura backups automáticos** de la base de datos
2. **Configura SSL/HTTPS** si aún no lo tienes
3. **Implementa monitoreo** (UptimeRobot, etc.)
4. **Optimiza el rendimiento** (caché, CDN, etc.)
5. **Documenta tu configuración** para futuras referencias

---

**¡Buena suerte con tu despliegue! 🚀**
