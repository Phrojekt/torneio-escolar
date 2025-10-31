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
    console.log(`🔍 Dados da dupla: ${duplaId}`);
    
    // Sanitizar duplaId para evitar problemas
    const sanitizedDuplaId = duplaId ? duplaId.replace(/[^a-zA-Z0-9_-]/g, '_') : '';
    
    // Converter para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`📦 Buffer criado: ${buffer.length} bytes`);
    
    // Gerar nome único com sanitização
    const prefix = sanitizedDuplaId ? `${sanitizedDuplaId}_${type}` : type;
    const filename = generateS3Filename(file.name, prefix);
    
    console.log(`🏷️ Nome do arquivo: ${filename}`);
    
    // Upload para S3 com retry
    const result = await uploadImageToS3(
      buffer,
      filename,
      file.type,
      type === 'banner',
      3 // 3 tentativas
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

import { getS3Config } from '@/lib/s3-config';

export async function GET(request: NextRequest) {
  // Endpoint para testar configuração - Netlify compatible
  const config = getS3Config();
  return NextResponse.json({
    bucket: config.bucket,
    region: config.region,
    hasCredentials: !!(config.accessKeyId && config.secretAccessKey),
    bannersPath: config.bannersPath,
    itensPath: config.itensPath,
  });
}