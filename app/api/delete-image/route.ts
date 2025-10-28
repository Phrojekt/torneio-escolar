import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getS3Config } from '@/lib/s3-config';

// Configuração do S3 - Netlify compatible
const config = getS3Config();
const s3Client = new S3Client({
  region: config.region,
  credentials: {
    accessKeyId: config.accessKeyId || '',
    secretAccessKey: config.secretAccessKey || '',
  },
});

const BUCKET_NAME = config.bucket;

export async function DELETE(request: NextRequest) {
  try {
    const { imageUrl, s3Key } = await request.json();
    
    if (!imageUrl && !s3Key) {
      return NextResponse.json({ 
        success: false, 
        message: 'URL da imagem ou chave S3 deve ser fornecida' 
      });
    }

    console.log('🗑️ Tentando deletar imagem S3:', { imageUrl, s3Key });

    let keyToDelete = s3Key;

    // Se apenas URL foi fornecida, extrair a chave S3
    if (!keyToDelete && imageUrl) {
      if (imageUrl.includes('s3.amazonaws.com')) {
        // Extrair chave da URL S3: https://bucket.s3.amazonaws.com/path/file.jpg
        const urlParts = imageUrl.split('.s3.amazonaws.com/');
        if (urlParts.length === 2) {
          keyToDelete = urlParts[1];
        }
      } else {
        return NextResponse.json({ 
          success: false, 
          message: 'URL não é uma URL válida do S3' 
        });
      }
    }

    if (!keyToDelete) {
      return NextResponse.json({ 
        success: false, 
        message: 'Não foi possível determinar a chave S3 do arquivo' 
      });
    }

    console.log('📂 Chave S3 para deletar:', keyToDelete);

    // Deletar arquivo do S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: keyToDelete,
    });

    await s3Client.send(deleteCommand);

    console.log('✅ Imagem deletada com sucesso do S3');

    return NextResponse.json({ 
      success: true, 
      message: 'Imagem deletada com sucesso do S3!',
      deletedKey: keyToDelete
    });

  } catch (error) {
    console.error('❌ Erro ao deletar imagem do S3:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
