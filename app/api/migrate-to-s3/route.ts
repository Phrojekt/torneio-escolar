import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { convertToOptimizedImageUrl } from '@/lib/image-utils';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando migração de URLs para S3...');

    // Buscar todas as duplas
    const duplasSnapshot = await getDocs(collection(db, 'duplas'));
    const duplas = duplasSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    console.log(`📊 Encontradas ${duplas.length} duplas para migrar`);

    let migracoesDuplas = 0;

    // Migrar URLs das duplas
    for (const dupla of duplas) {
      if (dupla.bannerUrl && !dupla.bannerUrl.includes('s3.amazonaws.com')) {
        const novaUrl = convertToOptimizedImageUrl(dupla.bannerUrl);
        
        if (novaUrl && novaUrl !== dupla.bannerUrl) {
          await updateDoc(doc(db, 'duplas', dupla.id), {
            bannerUrl: novaUrl
          });
          
          console.log(`✅ Dupla ${dupla.tag}: ${dupla.bannerUrl} → ${novaUrl}`);
          migracoesDuplas++;
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

    // Migrar URLs dos itens
    for (const item of itens) {
      if (item.imagem && !item.imagem.includes('s3.amazonaws.com')) {
        // Para itens, converter para caminho de itens
        const filename = item.imagem.split('/').pop();
        const novaUrl = `https://jambalaia.s3.amazonaws.com/itens/${filename}`;
        
        if (novaUrl !== item.imagem) {
          await updateDoc(doc(db, 'itens', item.id), {
            imagem: novaUrl
          });
          
          console.log(`✅ Item ${item.nome}: ${item.imagem} → ${novaUrl}`);
          migracoesItens++;
        }
      }
    }

    const resultado = {
      success: true,
      message: 'Migração concluída com sucesso!',
      estatisticas: {
        duplasVerificadas: duplas.length,
        duplasMigradas: migracoesDuplas,
        itensVerificados: itens.length,
        itensMigrados: migracoesItens,
        totalMigracoes: migracoesDuplas + migracoesItens
      }
    };

    console.log('🎉 Migração concluída:', resultado.estatisticas);

    return NextResponse.json(resultado);

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro durante a migração',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}