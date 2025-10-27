import { NextRequest, NextResponse } from 'next/server';
import { imageExistsInS3, extractFilenameFromGithubUrl } from '@/lib/s3-utils';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ 
        success: false, 
        message: 'URL da imagem é obrigatória' 
      });
    }

    console.log('🔍 Testando URL:', imageUrl);

    // Extrair chave S3 da URL
    let s3Key = '';
    if (imageUrl.includes('s3.amazonaws.com/')) {
      s3Key = imageUrl.split('s3.amazonaws.com/')[1];
    }

    if (!s3Key) {
      return NextResponse.json({ 
        success: false, 
        message: 'URL não é uma URL válida do S3',
        imageUrl
      });
    }

    console.log('🔑 Chave S3 extraída:', s3Key);

    // Verificar se existe no S3
    const exists = await imageExistsInS3(s3Key);
    console.log('📁 Existe no S3:', exists);

    // Tentar fazer fetch direto
    let httpAccessible = false;
    let httpStatus = 0;
    let httpError = '';

    try {
      const response = await fetch(imageUrl);
      httpStatus = response.status;
      httpAccessible = response.ok;
      
      if (!response.ok) {
        const text = await response.text();
        httpError = text.substring(0, 500); // Primeiros 500 caracteres do erro
      }
    } catch (error) {
      httpError = error instanceof Error ? error.message : 'Erro de rede';
    }

    const result = {
      success: true,
      imageUrl,
      s3Key,
      s3Exists: exists,
      httpAccessible,
      httpStatus,
      httpError: httpError || undefined,
      message: exists 
        ? (httpAccessible ? 'Imagem OK' : 'Existe no S3 mas não acessível via HTTP')
        : 'Imagem não encontrada no S3'
    };

    console.log('📊 Resultado do teste:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return NextResponse.json({ 
      success: false, 
      message: `Erro no teste: ${error}`,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}