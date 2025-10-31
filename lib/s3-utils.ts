import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Config } from './s3-config';

// Configuração usando função que separa client/server
const config = getS3Config();

console.log('🔧 Inicializando S3 Client:', {
  region: config.region,
  bucket: config.bucket,
  hasCredentials: !!(config.accessKeyId && config.secretAccessKey)
});

const s3Client = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId || '',
    secretAccessKey: config.secretAccessKey || '',
  },
  forcePathStyle: false, // Usar virtual hosted-style URLs
  useAccelerateEndpoint: false,
  useGlobalEndpoint: false,
});

// Usar valores da configuração
const BUCKET_NAME = config.bucket;
const BANNERS_PATH = config.bannersPath;
const ITENS_PATH = config.itensPath;

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Faz upload de uma imagem para o S3 com retry automático
 */
export async function uploadImageToS3(
  buffer: Buffer,
  filename: string,
  contentType: string,
  isBanner: boolean = false,
  maxRetries: number = 3
): Promise<UploadResult> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries} - Upload S3:`, {
        filename,
        contentType,
        bufferSize: buffer.length,
        isBanner,
        bucket: BUCKET_NAME,
        region: config.region
      });

      // Sanitizar o filename apenas para caracteres realmente problemáticos
      const sanitizedFilename = filename
        .replace(/[<>:"/\\|?*]/g, '_') // Remove apenas caracteres problemáticos para S3
        .replace(/\s+/g, '_') // Substituir espaços múltiplos por underscore
        .trim();

      const path = isBanner ? BANNERS_PATH : ITENS_PATH;
      const key = `${path}${sanitizedFilename}`;

      console.log('🔧 Configuração upload:', {
        originalFilename: filename,
        sanitizedFilename,
        key,
        path,
        attempt
      });

      // Recriar cliente S3 a cada tentativa para garantir configuração limpa
      const freshS3Client = new S3Client({
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId || '',
          secretAccessKey: config.secretAccessKey || '',
        },
        forcePathStyle: false,
        useAccelerateEndpoint: false,
        useGlobalEndpoint: false,
        maxAttempts: 1, // Controlamos retry manualmente
      });

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000',
        Metadata: {
          uploadedAt: new Date().toISOString(),
          originalName: sanitizedFilename,
          attempt: attempt.toString(),
        },
      });

      console.log(`📤 Enviando comando para S3 (tentativa ${attempt})...`);
      await freshS3Client.send(command);

      // URL pública do S3
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

      console.log('✅ Upload realizado com sucesso:', { url, key, attempt });

      return {
        success: true,
        url,
        key,
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      console.error(`❌ Erro na tentativa ${attempt}/${maxRetries}:`, {
        error: lastError.message,
        errorName: lastError.name,
        filename,
        bucket: BUCKET_NAME,
        region: config.region,
        attempt
      });

      // Se não é a última tentativa, aguardar antes de tentar novamente
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // 1s, 2s, 3s...
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  console.error('❌ Todas as tentativas de upload falharam:', {
    filename,
    bucket: BUCKET_NAME,
    region: config.region,
    maxRetries,
    finalError: lastError?.message
  });
  
  return {
    success: false,
    error: lastError?.message || 'Erro desconhecido após múltiplas tentativas',
  };
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
 * Gera nome de arquivo único para S3
 */
export function generateS3Filename(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  
  // Processar o nome base de forma mais cuidadosa
  const baseName = originalName
    .replace(/\.[^/.]+$/, '') // Remove extensão
    .replace(/[<>:"/\\|?*]/g, '_') // Remove apenas caracteres problemáticos para S3
    .replace(/\s+/g, '_') // Substituir espaços por underscore
    .trim();
  
  console.log('📝 Nome base processado:', { originalName, baseName });
  
  // Processar prefix de forma similar
  const sanitizedPrefix = prefix 
    ? prefix
        .replace(/[<>:"/\\|?*]/g, '_') // Remove apenas caracteres problemáticos
        .replace(/\s+/g, '_') // Substituir espaços por underscore
        .trim()
    : '';
  
  const finalFilename = sanitizedPrefix 
    ? `${timestamp}_${sanitizedPrefix}_${baseName}.${extension}`
    : `${timestamp}_${randomId}_${baseName}.${extension}`;
  
  console.log('📂 Nome final gerado:', {
    originalName,
    prefix,
    finalFilename,
    length: finalFilename.length
  });
  
  return finalFilename;
}

export { s3Client, BUCKET_NAME, BANNERS_PATH, ITENS_PATH };