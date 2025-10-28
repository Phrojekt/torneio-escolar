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
 * Converte URLs para S3 diretas - apenas S3, sem GitHub
 */
export function convertToOptimizedImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl || imageUrl.trim() === '') {
    return undefined;
  }

  // Se já é uma URL do S3, retornar diretamente
  if (isS3Url(imageUrl)) {
    return imageUrl;
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