/**
 * Utilitários para conversão e gerenciamento de URLs de imagem com S3
 */

/**
 * Verifica se uma URL é do S3
 */
export function isS3Url(url?: string): boolean {
  if (!url) return false;
  return url.includes('s3.amazonaws.com') || url.includes('jambalaia');
}

/**
 * Corrige URLs S3 com problemas de encoding
 */
export function fixS3UrlEncoding(url: string): string {
  try {
    console.log('🔧 Corrigindo encoding da URL:', url);
    
    // Se não há caracteres especiais, retornar como está
    if (!url.includes('%')) {
      console.log('✅ URL sem encoding especial, mantendo:', url);
      return url;
    }
    
    // Verificar se é duplo encoding (FALC%C3%83O = FALCÃO com encoding duplo)
    let workingUrl = url;
    
    // Tentar decodificar até não haver mais encoding
    let maxAttempts = 3;
    let lastUrl = '';
    
    while (workingUrl !== lastUrl && maxAttempts > 0 && workingUrl.includes('%')) {
      lastUrl = workingUrl;
      try {
        workingUrl = decodeURIComponent(workingUrl);
        maxAttempts--;
      } catch (e) {
        break;
      }
    }
    
    console.log('🔄 URL após decodificação:', workingUrl);
    
    // Agora re-encode adequadamente apenas o que precisa
    const urlObj = new URL(workingUrl);
    
    // Processar o pathname
    const pathParts = urlObj.pathname.split('/');
    const properlyEncodedParts = pathParts.map(part => {
      if (part === '') return part;
      
      // Para partes do path que contêm caracteres especiais, usar encoding adequado
      // Mas preservar alguns caracteres comuns
      return encodeURIComponent(part)
        .replace(/%20/g, '%20') // Espaços
        .replace(/%2B/g, '+')   // Plus signs
        .replace(/%2F/g, '/')   // Slashes within the part (se houver)
        .replace(/%3A/g, ':');  // Colons
    });
    
    urlObj.pathname = properlyEncodedParts.join('/');
    
    const correctedUrl = urlObj.toString();
    console.log('✅ URL corrigida:', correctedUrl);
    
    return correctedUrl;
  } catch (error) {
    console.warn('⚠️ Erro ao corrigir encoding da URL:', url, error);
    return url;
  }
}

/**
 * Converte URLs para S3 diretas - apenas S3, sem GitHub
 */
export function convertToOptimizedImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl || imageUrl.trim() === '') {
    return undefined;
  }

  // Se já é uma URL do S3, retornar com normalização de encoding
  if (isS3Url(imageUrl)) {
    return fixS3UrlEncoding(imageUrl);
  }

  // Para outras URLs, assumir que são inválidas
  console.warn('⚠️ URL não é do S3, ignorando:', imageUrl);
  return undefined;
}

/**
 * Extrai nome do arquivo de URLs S3 apenas
 */
export function extractFilenameFromUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;

  try {
    // Para URLs do S3 - reconhecer padrões do nosso bucket
    if (isS3Url(imageUrl)) {
      const match = imageUrl.match(/\/(banners_dupla|itens)\/([^?]+)/);
      if (match) {
        return decodeURIComponent(match[2].split('?')[0]);
      }
    }

    // Para URLs locais antigas
    if (imageUrl.startsWith('/banners/') || imageUrl.startsWith('/itens/')) {
      return imageUrl.replace(/^\/[^/]+\//, '');
    }

    // Fallback: extrair da URL
    const url = new URL(imageUrl);
    const filename = url.pathname.split('/').pop()?.split('?')[0];
    return filename ? decodeURIComponent(filename) : undefined;
  } catch (error) {
    console.warn('⚠️ Erro ao extrair filename:', imageUrl, error);
    return undefined;
  }
}

/**
 * Gera estrutura de URLs otimizada - conexão direta com S3
 */
export function getOptimizedImageUrl(imageUrl?: string): {
  primary: string | undefined;
  fallback: string | undefined;
  filename: string | undefined;
  isS3: boolean;
} {
  const filename = extractFilenameFromUrl(imageUrl);
  const primary = convertToOptimizedImageUrl(imageUrl);
  const isS3 = isS3Url(primary);
  
  // Sem fallback - vai direto para componente textual se falhar
  const fallback = undefined;
  return { primary, fallback, filename, isS3 };
}

/**
 * Função simples para uso direto em tags img - conexão direta com S3
 */
export function getProxyImageSrc(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  return convertToOptimizedImageUrl(imageUrl);
}

import { getS3Config } from './s3-config';

/**
 * Gera URL S3 a partir da chave
 */
export function generateS3Url(s3Key: string): string {
  const config = getS3Config();
  return `https://${config.bucket}.s3.amazonaws.com/${s3Key}`;
}

/**
 * Extrai chave S3 de uma URL S3
 */
export function extractS3Key(s3Url: string): string | null {
  try {
    if (s3Url.includes('s3.amazonaws.com/')) {
      return s3Url.split('s3.amazonaws.com/')[1];
    }
    return null;
  } catch (error) {
    return null;
  }
}