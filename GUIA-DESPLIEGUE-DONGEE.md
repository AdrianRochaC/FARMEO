# 🚀 Guía Completa de Despliegue en Dongee

Esta guía te explica paso a paso cómo subir tu proyecto completo a **Dongee** para que funcione correctamente.

## 📋 Resumen del Proyecto

- **Frontend:** React + Vite (se sube a Dongee)
- **Backend:** Node.js + Express (actualmente en Render)
- **Base de Datos:** MySQL (Railway)
- **Dominio:** farmeoa.com

---

## ✅ Paso 1: Preparación del Proyecto

### 1.1 Verificar Configuración

El proyecto ya está configurado para:
- ✅ Frontend apunta al backend en Render: `https://otro-k5x5.onrender.com`
- ✅ CORS configurado para permitir `farmeoa.com`
- ✅ Build de producción generado en la carpeta `dist/`

### 1.2 Archivos Generados

Después de ejecutar `npm run build`, tienes:
```
dist/
├── index.html
├── .htaccess          (configuración para React Router)
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── ...
└── (otros archivos estáticos)
```

---

## 📤 Paso 2: Subir el Frontend a Dongee

### 2.1 Acceder a cPanel de Dongee

1. Inicia sesión en tu cuenta de Dongee
2. Accede a **cPanel** (panel de control)

### 2.2 Opción A: Usando el Administrador de Archivos (Recomendado)

1. En cPanel, busca **"Administrador de archivos"** o **"File Manager"**
2. Navega a la carpeta `public_html` (esta es la carpeta raíz de tu dominio)
3. **IMPORTANTE:** Elimina todos los archivos existentes en `public_html` (si los hay)
4. Sube los archivos de la carpeta `dist/`:
   
   **Método 1: Subir archivos individuales**
   - Haz clic en "Subir" o "Upload"
   - Selecciona TODOS los archivos de la carpeta `dist/` de tu computadora
   - Espera a que se suban todos
   
   **Método 2: Subir como ZIP (más rápido)**
   - Comprime todos los archivos de `dist/` en un archivo ZIP
   - Súbelo a `public_html`
   - Haz clic derecho en el ZIP → "Extraer" o "Extract"
   - Elimina el archivo ZIP después de extraer

### 2.3 Opción B: Usando FTP

1. Usa un cliente FTP como **FileZilla** o **WinSCP**
2. Conéctate a tu servidor Dongee con las credenciales FTP:
   - **Host:** ftp.farmeoa.com (o la IP que te proporcionó Dongee)
   - **Usuario:** Tu usuario FTP
   - **Contraseña:** Tu contraseña FTP
   - **Puerto:** 21 (o el que te indique Dongee)
3. Navega a la carpeta `public_html`
4. Sube todos los archivos de la carpeta `dist/` (arrastra y suelta)

### 2.4 Estructura Final en Dongee

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

**⚠️ IMPORTANTE:** Asegúrate de que el archivo `.htaccess` esté en la raíz de `public_html`. Este archivo es necesario para que funcionen las rutas de React Router.

---

## 🔧 Paso 3: Verificar el Backend

### 3.1 Backend en Render (Configuración Actual)

El backend ya está configurado en Render y permite CORS desde `farmeoa.com`. 

**Verificar que el backend funciona:**
1. Abre en tu navegador: `https://otro-k5x5.onrender.com/api/test`
2. Deberías ver una respuesta JSON

### 3.2 Si Quieres Mover el Backend a Dongee (Opcional)

Si prefieres tener el backend también en Dongee:

1. **Crear subdominio:** En cPanel, crea un subdominio `api.farmeoa.com`
2. **Subir backend:** Sube la carpeta `backend/` al subdominio
3. **Instalar Node.js:** Asegúrate de que Dongee soporte Node.js (algunos planes lo requieren)
4. **Configurar PM2:** Instala PM2 para mantener el servidor activo
5. **Actualizar configuración:** Cambia la URL en `src/utils/api.js` a `https://api.farmeoa.com`

**Nota:** La mayoría de los planes de hosting compartido no permiten ejecutar Node.js. Si Dongee no soporta Node.js, mantén el backend en Render.

---

## ✅ Paso 4: Probar la Aplicación

### 4.1 Verificar que el Frontend Funciona

1. Abre tu sitio: `https://farmeoa.com`
2. Deberías ver la página de inicio de tu aplicación
3. Abre la **Consola del Navegador** (F12 → Console)
4. Verifica que no haya errores

### 4.2 Probar Funcionalidades

1. Intenta hacer login
2. Navega por las diferentes páginas
3. Verifica que las llamadas al backend funcionen

### 4.3 Errores Comunes y Soluciones

**❌ Error: "No permitido por CORS"**
- Verifica que el backend en Render tenga `farmeoa.com` en la lista de CORS
- Verifica que redesplegaste el backend después de cambios
- Revisa `backend/config/app.js` línea 38-41

**❌ Error: "No se puede conectar con el servidor"**
- Verifica que el backend en Render esté funcionando
- Verifica la URL del backend en `src/utils/api.js`
- Abre `https://otro-k5x5.onrender.com/api/test` en el navegador

**❌ Error 404 en las rutas (páginas no cargan)**
- Verifica que el archivo `.htaccess` esté en `public_html`
- Verifica que el contenido de `.htaccess` sea correcto
- Algunos servidores requieren habilitar `mod_rewrite` (contacta a soporte de Dongee)

**❌ La página está en blanco**
- Verifica que todos los archivos de `dist/` se subieron correctamente
- Verifica que `index.html` esté en la raíz de `public_html`
- Revisa la consola del navegador (F12) para ver errores específicos

---

## 🔄 Paso 5: Actualizaciones Futuras

Cada vez que quieras actualizar el frontend:

1. **Haz los cambios** en tu código local
2. **Ejecuta el build:**
   ```bash
   npm run build
   ```
3. **Sube los nuevos archivos** de `dist/` a Dongee:
   - Elimina los archivos antiguos de `public_html`
   - Sube los nuevos archivos de `dist/`
   - O simplemente reemplaza los archivos que cambiaron

**💡 Tip:** Si solo cambiaste archivos JavaScript o CSS, puedes subir solo la carpeta `assets/` nueva y el `index.html` actualizado.

---

## 📝 Resumen de URLs y Configuración

- **Frontend (Dongee):** `https://farmeoa.com`
- **Backend (Render):** `https://otro-k5x5.onrender.com`
- **API Endpoint:** `https://otro-k5x5.onrender.com/api/...`
- **Base de Datos:** Railway MySQL

---

## 🆘 Soporte y Troubleshooting

### Si Tienes Problemas:

1. **Revisa la consola del navegador** (F12 → Console)
2. **Revisa los logs del backend** en Render
3. **Verifica que ambas configuraciones** (frontend y backend) tengan el mismo dominio
4. **Contacta a soporte de Dongee** si hay problemas con el servidor

### Archivos Importantes:

- `dist/` - Carpeta con el build de producción (subir a Dongee)
- `src/utils/api.js` - Configuración de la URL del backend
- `backend/config/app.js` - Configuración de CORS
- `public/.htaccess` - Configuración del servidor (ya incluido en dist/)

---

## ✅ Checklist Final

Antes de considerar el despliegue completo:

- [ ] Build generado correctamente (`npm run build`)
- [ ] Archivo `.htaccess` incluido en `dist/`
- [ ] Todos los archivos de `dist/` subidos a `public_html` en Dongee
- [ ] Backend funcionando en Render
- [ ] CORS configurado correctamente
- [ ] Sitio accesible en `https://farmeoa.com`
- [ ] Login y funcionalidades principales funcionando
- [ ] Sin errores en la consola del navegador

---

¡Listo! Tu aplicación debería estar funcionando correctamente en Dongee. 🎉

Si tienes alguna duda o problema, revisa la sección de troubleshooting o contacta a soporte.


