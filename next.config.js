/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exposer les variables d'environnement côté serveur
  serverRuntimeConfig: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
  },
  // Variables accessibles dans l'API (côté serveur)
  env: {
    API_POLYGON_KEY: process.env.API_POLYGON_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  // Configuration webpack pour le hot reload
  webpack: (config, _) => ({
    ...config,
    watchOptions: {
      ...config.watchOptions,
      poll: 800,
      aggregateTimeout: 300,
    },
  }),
};

module.exports = nextConfig;