/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: [],
  },
  // Configurações para MCP Server
  env: {
    MCP_SERVER_URL: process.env.MCP_SERVER_URL || 'http://localhost:8000',
  },
  // Configurações para produção
  output: 'standalone',
  // Otimizações
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
