// Configuração de ambiente para produção
// Este arquivo garante que secrets não sejam expostos no bundle do cliente

export const getS3Config = () => {
  // Em produção no Netlify, usar apenas valores server-side
  if (typeof window !== 'undefined') {
    // Se estiver no browser, retornar valores públicos hardcoded
    return {
      bucket: 'jambalaia',
      region: 'us-east-1',
      bannersPath: 'banners_dupla/',
      itensPath: 'itens/',
    };
  }
  
  // Se estiver no servidor, usar environment variables
  return {
    bucket: process.env.MY_AWS_S3_BUCKET || 'jambalaia',
    region: process.env.MY_AWS_REGION || 'us-east-1',
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || '',
    bannersPath: process.env.S3_BANNERS_PATH || 'banners_dupla/',
    itensPath: process.env.S3_ITENS_PATH || 'itens/',
  };
};