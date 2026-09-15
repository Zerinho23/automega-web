# AUTOMEGA SpA

## Seguimiento y notificaciones

Ejecuta `db/migrations/002_commercial_security.sql` en Neon antes de publicar esta versión. Las cotizaciones permiten guardar responsable, notas privadas y próximo contacto. La fecha es un recordatorio visible en el panel; no envía avisos programados.

Para activar los avisos crea una clave de envío en Resend, verifica tu dominio y configura `RESEND_API_KEY`, `EMAIL_FROM` y `NOTIFICATION_EMAIL` en Vercel. Vuelve a desplegar. La bandeja muestra avisos pendientes, errores y mensajes aceptados por el proveedor; puedes procesar pendientes manualmente. Sin proveedor la cotización se guarda y el correo queda pendiente. Documentación: https://resend.com/docs/api-reference/emails/send-email

El acceso tiene límite de 10 intentos por 15 minutos y el formulario 5 envíos por 15 minutos. Las contraseñas cambiadas se almacenan con PBKDF2; un fallo de consulta no permite entrar usando una contraseña antigua. Cambia la clave inicial desde Configuración. La autenticación de dos factores no está implementada todavía.

Sitio web y panel administrativo de AUTOMEGA SpA, desarrollado con Next.js (App Router), TypeScript y Neon PostgreSQL. El proyecto es responsive y guarda el contenido, las imágenes y las solicitudes directamente en Neon.

## Ejecutar localmente

Requisitos: Node.js 20 o superior y npm.

1. Abre una terminal en la carpeta del proyecto.
2. Instala las dependencias con `npm install`.
3. Copia `.env.example` como `.env.local` y completa las variables de Neon.
4. Ejecuta `npm run dev`.
5. Abre `http://localhost:3000`.

El panel está en `http://localhost:3000/admin`.

## Configurar Neon

1. Crea un proyecto en Neon y copia su cadena de conexión PostgreSQL.
2. Abre el SQL Editor de Neon y ejecuta `db/schema.sql`.
3. Copia `.env.example` como `.env.local` y completa `DATABASE_URL`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
4. Reinicia el servidor local.

La migración crea perfiles, configuración, servicios, proyectos, imágenes y solicitudes de cotización. Las rutas administrativas validan una sesión httpOnly antes de leer o modificar datos.

## Comandos

- `npm run dev`: desarrollo local.
- `npm run build`: compilación de producción.
- `npm start`: ejecutar la versión compilada.
- `npm run lint`: revisión de calidad.

## Vercel

El proyecto usa las convenciones estándar de Next.js y está preparado para Vercel. Importa el repositorio desde Vercel y configura `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` como variables de producción. La región de ejecución está configurada cerca de la base Neon para reducir latencia.

## Seguridad

Nunca subas `.env.local`. Las claves de Neon y Cloudinary deben permanecer exclusivamente en el servidor. La aplicación no incluye credenciales privadas escritas en el código.
