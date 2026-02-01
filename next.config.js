/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  env: {
    API_POLYGON_KEY: process.env.API_POLYGON_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
  },
};
module.exports = nextConfig;
