/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push('better-sqlite3');
    return config;
  },
};

export default nextConfig;
