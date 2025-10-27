import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToS3, generateS3Filename } from '@/lib/s3-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'banner' ou 'item'
    const duplaId = formData.get('duplaId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }
    
    if (!type || !['banner', 'item'].includes(type)) {
      return NextResponse.json({ error: 'Tipo deve ser "banner" ou "item"' }, { status: 400 });
    }
    
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Tipo de arquivo não suportado. Use JPEG, PNG ou WebP' 
      }, { status: 400 });
    }
    
    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'Arquivo muito grande. Máximo 5MB' 
      }, { status: 400 });
    }
    
    console.log(`📤 Fazendo upload de ${type}: ${file.name} (${file.size} bytes)`);
    
    // Converter para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Gerar nome único
    const prefix = duplaId ? `${duplaId}_${type}` : type;
    const filename = generateS3Filename(file.name, prefix);
    
    // Upload para S3
    const result = await uploadImageToS3(
      buffer,
      filename,
      file.type,
      type === 'banner'
    );
    
    if (result.success) {
      console.log(`✅ Upload realizado com sucesso: ${result.url}`);
      return NextResponse.json({
        success: true,
        url: result.url,
        key: result.key,
        message: 'Upload realizado com sucesso'
      });
    } else {
      console.error(`❌ Erro no upload: ${result.error}`);
      return NextResponse.json({ 
        error: result.error || 'Erro no upload' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Erro na API de upload:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Endpoint para testar configuração - Netlify compatible
  return NextResponse.json({
    bucket: process.env.MY_AWS_S3_BUCKET,
    region: process.env.MY_AWS_REGION,
    hasCredentials: !!(process.env.MY_AWS_ACCESS_KEY_ID && process.env.MY_AWS_SECRET_ACCESS_KEY),
    bannersPath: process.env.S3_BANNERS_PATH,
    itensPath: process.env.S3_ITENS_PATH,
  });
}