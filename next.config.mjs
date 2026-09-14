/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  distDir: "next-build",
  // Evita un bloqueo de limpieza de archivos temporales en Windows/Node 24.
  cleanDistDir: false,
};

export default nextConfig;
