import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToS3, generateS3Filename } from '@/lib/s3-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Iniciando teste de upload...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const duplaId = formData.get('duplaId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 });
    }

    console.log('📁 Arquivo recebido:', {
      name: file.name,
      size: file.size,
      type: file.type,
      duplaId
    });

    // Converter para buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('📦 Buffer criado:', {
      bufferLength: buffer.length,
      firstBytes: buffer.slice(0, 10).toString('hex')
    });

    // Gerar nome único com sanitização extra
    const prefix = duplaId ? `test_${duplaId}` : 'test';
    const filename = generateS3Filename(file.name, prefix);

    console.log('🏷️ Nome gerado:', {
      original: file.name,
      generated: filename,
      prefix
    });

    // Upload para S3 com logging detalhado
    const result = await uploadImageToS3(
      buffer,
      filename,
      file.type,
      true // banner
    );

    console.log('📊 Resultado do upload:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Upload de teste realizado com sucesso',
        result,
        debug: {
          originalName: file.name,
          generatedName: filename,
          fileSize: file.size,
          fileType: file.type,
          duplaId
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        debug: {
          originalName: file.name,
          generatedName: filename,
          fileSize: file.size,
          fileType: file.type,
          duplaId
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Erro no teste de upload:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro no teste de upload',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      errorName: error instanceof Error ? error.name : 'Unknown'
    }, { status: 500 });
  }
}