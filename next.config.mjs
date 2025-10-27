/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Garantir que variáveis AWS fiquem apenas no servidor
  env: {
    // Não incluir variáveis AWS aqui para evitar exposição no client
  },
  // Configuração para build no Netlify
  output: 'standalone',
  experimental: {
    // Otimizações para deploy
    optimizePackageImports: ['@aws-sdk/client-s3'],
  },
}

export default nextConfig
