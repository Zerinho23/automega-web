# AUTOMEGA

Sitio web y panel administrativo de AUTOMEGA, desarrollado con Next.js (App Router), TypeScript y Neon PostgreSQL. El proyecto es responsive y guarda el contenido, las imágenes y las solicitudes directamente en Neon.

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

El proyecto usa las convenciones estándar de Next.js. Cuando se autorice la publicación, crea un proyecto en Vercel, importa esta carpeta y agrega las mismas variables de `.env.local`. No se ha creado repositorio, no se ha subido nada a GitHub y no se ha realizado ningún despliegue.

## Seguridad

Nunca subas `.env.local`. Las claves de Neon y Cloudinary deben permanecer exclusivamente en el servidor. La aplicación no incluye credenciales privadas escritas en el código.
