import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Configuração do S3 - Netlify compatible
const s3Client = new S3Client({
  region: process.env.MY_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.MY_AWS_S3_BUCKET || 'jambalaia';

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
