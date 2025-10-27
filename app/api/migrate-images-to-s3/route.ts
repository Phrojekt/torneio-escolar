import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { uploadImageToS3 } from '@/lib/s3-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando migração COMPLETA de imagens para S3...');

    // Buscar todas as duplas
    const duplasSnapshot = await getDocs(collection(db, 'duplas'));
    const duplas = duplasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    console.log(`📊 Encontradas ${duplas.length} duplas para migrar`);

    let migracoesDuplas = 0;
    let errosDuplas = 0;

    // Migrar banners das duplas
    for (const dupla of duplas) {
      if (dupla.bannerUrl && dupla.bannerUrl.includes('raw.githubusercontent.com')) {
        try {
          console.log(`🔄 Migrando banner da dupla ${dupla.tag}...`);
          
          // Baixar imagem do GitHub
          const response = await fetch(dupla.bannerUrl);
          if (!response.ok) {
            throw new Error(`Erro ao baixar: ${response.status}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Extrair nome do arquivo
          const urlParts = dupla.bannerUrl.split('/');
          const originalFileName = urlParts[urlParts.length - 1];
          
          // Gerar nome único para S3
          const timestamp = Date.now();
          const fileName = `${timestamp}_${dupla.tag.replace(/[^a-zA-Z0-9]/g, '_')}_${originalFileName}`;
          
          // Upload para S3
          const uploadResult = await uploadImageToS3(
            buffer,
            fileName,
            'image/png', // Assumir PNG por padrão
            true // É banner
          );
          
          if (uploadResult.success) {
            // Atualizar URL no Firebase
            await updateDoc(doc(db, 'duplas', dupla.id), {
              bannerUrl: uploadResult.url
            });
            
            console.log(`✅ Dupla ${dupla.tag}: Migrada para ${uploadResult.url}`);
            migracoesDuplas++;
          } else {
            throw new Error(uploadResult.error);
          }
          
        } catch (error) {
          console.error(`❌ Erro ao migrar dupla ${dupla.tag}:`, error);
          errosDuplas++;
        }
      }
    }

    // Buscar todos os itens da loja
    const itensSnapshot = await getDocs(collection(db, 'itens'));
    const itens = itensSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    console.log(`📊 Encontrados ${itens.length} itens para migrar`);

    let migracoesItens = 0;
    let errosItens = 0;

    // Migrar imagens dos itens
    for (const item of itens) {
      if (item.imagem && item.imagem.includes('raw.githubusercontent.com')) {
        try {
          console.log(`🔄 Migrando item ${item.nome}...`);
          
          // Baixar imagem do GitHub
          const response = await fetch(item.imagem);
          if (!response.ok) {
            throw new Error(`Erro ao baixar: ${response.status}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          
          // Extrair nome do arquivo
          const urlParts = item.imagem.split('/');
          const originalFileName = urlParts[urlParts.length - 1];
          
          // Gerar nome único para S3
          const timestamp = Date.now();
          const fileName = `${timestamp}_${item.nome.replace(/[^a-zA-Z0-9]/g, '_')}_${originalFileName}`;
          
          // Upload para S3
          const uploadResult = await uploadImageToS3(
            buffer,
            fileName,
            'image/png', // Assumir PNG por padrão
            false // Não é banner
          );
          
          if (uploadResult.success) {
            // Atualizar URL no Firebase
            await updateDoc(doc(db, 'itens', item.id), {
              imagem: uploadResult.url
            });
            
            console.log(`✅ Item ${item.nome}: Migrado para ${uploadResult.url}`);
            migracoesItens++;
          } else {
            throw new Error(uploadResult.error);
          }
          
        } catch (error) {
          console.error(`❌ Erro ao migrar item ${item.nome}:`, error);
          errosItens++;
        }
      }
    }

    const resultado = {
      success: true,
      message: 'Migração completa de imagens finalizada!',
      duplas: {
        migradas: migracoesDuplas,
        erros: errosDuplas,
        total: duplas.length
      },
      itens: {
        migrados: migracoesItens,
        erros: errosItens,
        total: itens.length
      },
      totalMigracoes: migracoesDuplas + migracoesItens,
      totalErros: errosDuplas + errosItens
    };

    console.log('🎉 Migração completa finalizada:', resultado);
    return NextResponse.json(resultado);

  } catch (error) {
    console.error('❌ Erro na migração completa:', error);
    return NextResponse.json({ 
      success: false, 
      message: `Erro na migração: ${error}`,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}