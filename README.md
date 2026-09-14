# AUTOMEGA

Sitio web y panel administrativo de AUTOMEGA, desarrollado con Next.js (App Router), TypeScript y Supabase. El proyecto es responsive, funciona en modo demostración sin credenciales y está listo para conectarse a Supabase y desplegarse en Vercel cuando sea autorizado.

## Ejecutar localmente

Requisitos: Node.js 20 o superior y npm.

1. Abre una terminal en la carpeta del proyecto.
2. Instala las dependencias con `npm install`.
3. Copia `.env.example` como `.env.local` si vas a conectar Supabase.
4. Ejecuta `npm run dev`.
5. Abre `http://localhost:3000`.

El panel está en `http://localhost:3000/admin`.

Mientras Supabase no esté configurado, puedes usar:

- Correo: `admin@automega.cl`
- Contraseña: `demo1234`

El modo demostración permite recorrer y probar la interfaz; los datos permanentes requieren Supabase.

## Configurar Supabase

1. Crea un proyecto nuevo en Supabase.
2. Abre el SQL Editor de Neon y ejecuta `db/schema.sql`.
3. En Authentication, crea el primer usuario administrador con correo y contraseña.
4. En el editor SQL ejecuta la instrucción comentada al final de la migración, reemplazando el correo por el del usuario creado, para asignar el rol `admin`.
5. En Project Settings > API copia la URL del proyecto y la clave pública `anon`.
6. Copia `.env.example` como `.env.local` y completa `DATABASE_URL`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
7. Reinicia el servidor local.

La migración crea perfiles, configuración, servicios, proyectos, imágenes y solicitudes de cotización. También crea el bucket `site-images`, activa RLS e instala políticas para que el contenido público sea legible, las cotizaciones puedan recibirse y solo los administradores autenticados puedan modificar datos.

## Comandos

- `npm run dev`: desarrollo local.
- `npm run build`: compilación de producción.
- `npm start`: ejecutar la versión compilada.
- `npm run lint`: revisión de calidad.

## Vercel

El proyecto usa las convenciones estándar de Next.js. Cuando se autorice la publicación, crea un proyecto en Vercel, importa esta carpeta y agrega las mismas variables de `.env.local`. No se ha creado repositorio, no se ha subido nada a GitHub y no se ha realizado ningún despliegue.

## Seguridad

Nunca subas `.env.local`. Las claves de Neon y Cloudinary deben permanecer exclusivamente en el servidor. La aplicación no incluye credenciales privadas escritas en el código.
