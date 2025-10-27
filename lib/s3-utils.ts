import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuração do cliente S3 - Netlify compatible
const s3Client = new S3Client({
  region: process.env.MY_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.MY_AWS_S3_BUCKET || 'jambalaia';
const BANNERS_PATH = process.env.S3_BANNERS_PATH || 'banners_dupla/';
const ITENS_PATH = process.env.S3_ITENS_PATH || 'itens/';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Faz upload de uma imagem para o S3
 */
export async function uploadImageToS3(
  buffer: Buffer,
  filename: string,
  contentType: string,
  isBanner: boolean = false
): Promise<UploadResult> {
  try {
    const path = isBanner ? BANNERS_PATH : ITENS_PATH;
    const key = `${path}${filename}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 ano
      Metadata: {
        uploadedAt: new Date().toISOString(),
        originalName: filename,
      },
    });

    await s3Client.send(command);

    // URL pública do S3
    const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('Erro no upload para S3:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

/**
 * Gera uma URL assinada para acesso temporário a uma imagem privada
 */
export async function getSignedImageUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Erro ao gerar URL assinada:', error);
    return null;
  }
}

/**
 * Verifica se uma imagem existe no S3
 */
export async function imageExistsInS3(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gera a URL pública para uma imagem no S3
 */
export function getS3PublicUrl(key: string): string {
  return `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

/**
 * Extrai o nome do arquivo de uma URL do GitHub
 */
export function extractFilenameFromGithubUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

/**
 * Gera nome de arquivo único para S3
 */
export function generateS3Filename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  
  const baseName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extensão
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Substitui caracteres especiais
    .toLowerCase();
  
  return prefix 
    ? `${prefix}_${timestamp}_${randomId}_${baseName}.${extension}`
    : `${timestamp}_${randomId}_${baseName}.${extension}`;
}

/**
 * Converte URL do GitHub para chave S3
 */
export function githubUrlToS3Key(githubUrl: string, isBanner: boolean = false): string {
  const filename = extractFilenameFromGithubUrl(githubUrl);
  const path = isBanner ? BANNERS_PATH : ITENS_PATH;
  const cleanFilename = generateS3Filename(filename);
  
  return `${path}${cleanFilename}`;
}

export { s3Client, BUCKET_NAME, BANNERS_PATH, ITENS_PATH };