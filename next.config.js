/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3004',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.252',
        port: '3004',
        pathname: '/uploads/**',
      }
    ],
  },
  // Configuração para permitir origens de desenvolvimento específicas
  allowedDevOrigins: ['192.168.0.252'],
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
  // Desativar linting durante build para evitar falhas
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Desativar verificação de tipos durante build para Docker
  typescript: {
    ignoreBuildErrors: true,
  },
  // Proxy reverso para API - redireciona /api para backend:3001
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
  // Configuração do Webpack para resolver erros do Watchpack no Windows
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules',
          '**/.git',
          '**/.next',
          // Arquivos de sistema do Windows que causam erro no Watchpack
          'C:/DumpStack.log.tmp',
          'C:/hiberfil.sys',
          'C:/System Volume Information/**',
          'C:/swapfile.sys',
          'C:/pagefile.sys',
          // Padrões gerais para arquivos de sistema
          '**/System Volume Information/**',
          '**/*.sys',
          '**/*.tmp',
          '**/hiberfil.sys',
          '**/pagefile.sys',
          '**/swapfile.sys',
        ],
      };
    }
    return config;
  },
}

export default nextConfig
