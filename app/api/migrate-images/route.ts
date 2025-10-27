import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { uploadImageToS3, generateS3Filename } from '@/lib/s3-utils';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (type: string, data: any) => {
        const message = JSON.stringify({ type, ...data }) + '\n';
        controller.enqueue(encoder.encode(message));
      };

      try {
        sendUpdate('log', { message: '🚀 Iniciando migração do GitHub para S3...' });
        sendUpdate('log', { message: '📡 Conectando ao Firestore...' });
        
        // Buscar todas as duplas
        const duplasSnapshot = await getDocs(collection(db, 'duplas'));
        const totalDuplas = duplasSnapshot.size;
        sendUpdate('log', { message: `📊 Encontradas ${totalDuplas} duplas para processar` });

        let processedCount = 0;
        let successCount = 0;
        let errorCount = 0;

        for (const duplaDoc of duplasSnapshot.docs) {
          const duplaData = duplaDoc.data();
          const duplaId = duplaDoc.id;
          
          sendUpdate('log', { message: `🔄 Processando dupla: ${duplaData.nomes || duplaId}` });

          try {
            let hasUpdates = false;
            const updates: any = {};

            // Processar banner da dupla
            if (duplaData.bannerUrl && duplaData.bannerUrl.includes('github')) {
              sendUpdate('log', { message: `  📸 Migrando banner para S3...` });
              
              const bannerResult = await downloadAndUploadToS3(
                duplaData.bannerUrl,
                duplaId,
                'banner',
                sendUpdate
              );
              
              if (bannerResult.success) {
                updates.bannerUrl = bannerResult.url;
                hasUpdates = true;
                sendUpdate('log', { message: `  ✅ Banner migrado: ${bannerResult.url}` });
              } else {
                sendUpdate('error', { message: `Erro no banner da dupla ${duplaId}: ${bannerResult.error}` });
                errorCount++;
              }
            }

            // Processar ícone de item
            if (duplaData.itemIcon && duplaData.itemIcon.includes('github')) {
              sendUpdate('log', { message: `  🎯 Migrando ícone do item para S3...` });
              
              const iconResult = await downloadAndUploadToS3(
                duplaData.itemIcon,
                duplaId,
                'item',
                sendUpdate
              );
              
              if (iconResult.success) {
                updates.itemIcon = iconResult.url;
                hasUpdates = true;
                sendUpdate('log', { message: `  ✅ Ícone migrado: ${iconResult.url}` });
              } else {
                sendUpdate('error', { message: `Erro no ícone da dupla ${duplaId}: ${iconResult.error}` });
                errorCount++;
              }
            }

            // Atualizar documento se houver mudanças
            if (hasUpdates) {
              await updateDoc(doc(db, 'duplas', duplaId), updates);
              sendUpdate('log', { message: `  💾 Dupla atualizada no Firestore` });
              successCount++;
            } else {
              sendUpdate('log', { message: `  ⏭️ Nenhuma imagem do GitHub para migrar` });
            }

          } catch (error) {
            sendUpdate('error', { message: `Erro na dupla ${duplaId}: ${error}` });
            errorCount++;
          }

          processedCount++;
          const progress = (processedCount / totalDuplas) * 100;
          sendUpdate('progress', { progress });
        }

        // Processar itens da loja
        sendUpdate('log', { message: '🛍️ Processando itens da loja...' });
        const itensSnapshot = await getDocs(collection(db, 'itens'));
        const totalItens = itensSnapshot.size;
        
        for (const itemDoc of itensSnapshot.docs) {
          const itemData = itemDoc.data();
          const itemId = itemDoc.id;
          
          sendUpdate('log', { message: `🔄 Processando item: ${itemData.nome || itemId}` });

          if (itemData.imagem && itemData.imagem.includes('github')) {
            const imageResult = await downloadAndUploadToS3(
              itemData.imagem,
              itemId,
              'item',
              sendUpdate
            );
            
            if (imageResult.success) {
              await updateDoc(doc(db, 'itens', itemId), {
                imagem: imageResult.url
              });
              sendUpdate('log', { message: `  ✅ Item migrado: ${imageResult.url}` });
              successCount++;
            } else {
              sendUpdate('error', { message: `Erro no item ${itemId}: ${imageResult.error}` });
              errorCount++;
            }
          }
        }

        sendUpdate('complete', { 
          message: `🎉 Migração S3 concluída! Sucessos: ${successCount}, Erros: ${errorCount}` 
        });

      } catch (error) {
        sendUpdate('error', { message: `Erro fatal: ${error}` });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}

async function downloadAndUploadToS3(
  githubUrl: string, 
  entityId: string,
  type: 'banner' | 'item',
  sendUpdate: (type: string, data: any) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    sendUpdate('log', { message: `    � Baixando do GitHub: ${githubUrl}` });

    // Headers para melhorar sucesso da requisição
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'image/*,*/*;q=0.8',
      'Cache-Control': 'no-cache',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    const response = await fetch(githubUrl, { headers });
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `Falha no download: ${response.status} ${response.statusText}` 
      };
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const originalFilename = githubUrl.split('/').pop() || 'image.jpg';
    
    sendUpdate('log', { message: `    📤 Fazendo upload para S3...` });
    
    // Gerar nome único para S3
    const filename = generateS3Filename(originalFilename, `${entityId}_${type}`);
    
    // Upload para S3
    const uploadResult = await uploadImageToS3(
      Buffer.from(imageBuffer),
      filename,
      contentType,
      type === 'banner'
    );
    
    if (uploadResult.success) {
      sendUpdate('log', { 
        message: `    ✅ Upload S3 concluído: ${uploadResult.key}` 
      });
      
      return { 
        success: true, 
        url: uploadResult.url 
      };
    } else {
      return { 
        success: false, 
        error: uploadResult.error 
      };
    }

  } catch (error) {
    return { 
      success: false, 
      error: `Erro no processamento: ${error}` 
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Endpoint para verificar status da configuração S3 - Netlify compatible
    return NextResponse.json({
      bucket: process.env.MY_AWS_S3_BUCKET,
      region: process.env.MY_AWS_REGION,
      hasCredentials: !!(process.env.MY_AWS_ACCESS_KEY_ID && process.env.MY_AWS_SECRET_ACCESS_KEY),
      bannersPath: process.env.S3_BANNERS_PATH,
      itensPath: process.env.S3_ITENS_PATH,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}