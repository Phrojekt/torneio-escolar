import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Função simples para gerar nome único
function generateSimpleFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${random}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nenhum arquivo encontrado' 
      }, { status: 400 });
    }

    // Validações básicas
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        message: 'Arquivo muito grande. Máximo 10MB.' 
      }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.' 
      }, { status: 400 });
    }

    // Converter arquivo para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único
    const fileName = generateSimpleFilename(file.name);

    // Configurar S3
    const s3Client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
      },
    });

    // Upload para S3
    const command = new PutObjectCommand({
      Bucket: 'jambalaia',
      Key: `banners_dupla/${fileName}`,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Retornar URL da imagem
    const imageUrl = `https://jambalaia.s3.amazonaws.com/banners_dupla/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      message: 'Upload realizado com sucesso!'
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
