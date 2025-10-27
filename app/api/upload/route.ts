import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToS3, generateS3Filename } from '@/lib/s3-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Iniciando upload para S3...');

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const tag: string = data.get('tag') as string;
    const type: string = data.get('type') as string || 'banner'; // 'banner' ou 'item'
    const duplaId: string = data.get('duplaId') as string;
    const isEdit: string = data.get('isEdit') as string || 'false'; // Se é edição
    const oldImageUrl: string = data.get('oldImageUrl') as string; // URL da imagem antiga para deletar

    console.log('📁 Dados recebidos:', { fileName: file?.name, tag, type, duplaId, isEdit, oldImageUrl });

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nenhum arquivo encontrado' 
      });
    }

    // Se é edição e há uma imagem antiga, deletar primeiro
    if (isEdit === 'true' && oldImageUrl) {
      try {
        console.log('🗑️ Deletando imagem antiga:', oldImageUrl);
        const deleteResponse = await fetch('/api/delete-image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: oldImageUrl })
        });
        
        if (deleteResponse.ok) {
          console.log('✅ Imagem antiga deletada');
        } else {
          console.warn('⚠️ Erro ao deletar imagem antiga, continuando...');
        }
      } catch (error) {
        console.warn('⚠️ Erro ao deletar imagem antiga:', error);
        // Continua mesmo se falhar ao deletar
      }
    }

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nenhum arquivo encontrado' 
      });
    }

    // Validar tamanho (máximo 10MB para S3)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        message: 'Arquivo muito grande. Máximo 10MB.' 
      });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tipo de arquivo não suportado. Use JPEG, PNG, WebP ou GIF.' 
      });
    }

    // Converter para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome único para S3
    let fileName: string;
    
    if (isEdit === 'true' && oldImageUrl) {
      // Para edições, extrair o nome existente e manter
      try {
        const urlParts = oldImageUrl.split('/');
        const existingFileName = urlParts[urlParts.length - 1];
        fileName = existingFileName;
        console.log('📝 Editando - mantendo nome existente:', fileName);
      } catch (error) {
        console.warn('⚠️ Erro ao extrair nome existente, gerando novo:', error);
        const prefix = duplaId ? `${duplaId}_${tag}_${type}` : `${tag}_${type}`;
        fileName = generateS3Filename(file.name, prefix);
      }
    } else {
      // Para novas imagens, gerar nome único
      const prefix = duplaId ? `${duplaId}_${tag}_${type}` : `${tag}_${type}`;
      fileName = generateS3Filename(file.name, prefix);
    }

    console.log('📂 Nome do arquivo S3:', fileName);
    console.log('� Tamanho do arquivo:', `${(file.size / 1024 / 1024).toFixed(2)}MB`);

    // Upload para S3
    console.log('⬆️ Enviando para S3...');
    const uploadResult = await uploadImageToS3(
      buffer,
      fileName,
      file.type,
      type === 'banner'
    );

    if (uploadResult.success) {
      console.log('✅ Upload S3 realizado com sucesso:', uploadResult.url);
      
      return NextResponse.json({ 
        success: true, 
        imageUrl: uploadResult.url,
        s3Key: uploadResult.key,
        fileName: fileName,
        message: 'Upload realizado com sucesso!'
      });
    } else {
      console.error('❌ Erro no upload S3:', uploadResult.error);
      return NextResponse.json({ 
        success: false, 
        message: uploadResult.error || 'Erro no upload para S3'
      });
    }

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
