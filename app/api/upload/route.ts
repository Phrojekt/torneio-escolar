import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const tag: string = data.get('tag') as string;
    const type: string = data.get('type') as string || 'banner'; // 'banner' ou 'item'

    if (!file) {
      return NextResponse.json({ success: false, message: 'Nenhum arquivo encontrado' });
    }

    // Validar tamanho (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        message: 'Arquivo muito grande. Máximo 50MB.' 
      });
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Apenas arquivos de imagem são permitidos.' 
      });
    }

    // Converter para bytes
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Criar nome único
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${tag}_${cleanName}`;

    // Definir pasta baseada no tipo
    const folder = type === 'item' ? 'itens' : 'banners';
    
    // Caminho para salvar
    const uploadPath = path.join(process.cwd(), 'public', folder, fileName);

    // Salvar arquivo
    await writeFile(uploadPath, buffer);

    // Retornar URL relativa
    const imageUrl = `/${folder}/${fileName}`;

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
    });
  }
}
