/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  distDir: ".next",
  // Evita un bloqueo de limpieza de archivos temporales en Windows/Node 24.
  cleanDistDir: false,
  webpack(config, { dev }) {
    if (dev) config.cache = false;
    return config;
  },
};

export default nextConfig;
