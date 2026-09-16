/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  distDir: ".next",
  // Evita un bloqueo de limpieza de archivos temporales en Windows/Node 24.
  cleanDistDir: false,
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
  webpack(config, { dev }) {
    if (dev) config.cache = false;
    return config;
  },
};

export default nextConfig;
