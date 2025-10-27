import { NextRequest, NextResponse } from 'next/server';
import { getS3PublicUrl, imageExistsInS3, extractFilenameFromGithubUrl } from '@/lib/s3-utils';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'Phrojekt/torneio-escolar';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log('🚀 IMAGE-PROXY INICIADO:', {
    timestamp: new Date().toISOString(),
    url: request.url
  });
  
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    const filename = searchParams.get('file');
    
    console.log('📥 PARÂMETROS RECEBIDOS:', {
      imageUrl,
      filename,
      searchParams: Object.fromEntries(searchParams.entries())
    });
    
    let finalUrl = imageUrl;
    
    // Se foi passado só o filename, verificar S3 primeiro, depois GitHub
    if (filename && !imageUrl) {
      // Determinar se é banner baseado no padrão dos nomes das duplas
      // Nomes de duplas geralmente têm formato: "NOME1 E NOME2_" ou contêm caracteres especiais
      const isBanner = filename.includes(' E ') || filename.includes('_banner_') || 
                      filename.includes('BANNER') || filename.includes('Tag') ||
                      !filename.toLowerCase().includes('item'); // Fallback: se não menciona "item", assume banner
      const s3Path = isBanner ? 'banners_dupla/' : 'itens/';
      const s3Key = `${s3Path}${filename}`;
      
      console.log('🔍 Verificando arquivo:', { filename, isBanner, s3Key });
      
      // Verificar se existe no S3
      const existsInS3 = await imageExistsInS3(s3Key);
      
      console.log('📋 RESULTADO VERIFICAÇÃO S3:', {
        s3Key,
        exists: existsInS3,
        filename,
        isBanner
      });
      
      if (existsInS3) {
        console.log('🎯 Imagem encontrada no S3:', s3Key);
        const s3Url = getS3PublicUrl(s3Key);
        
        console.log('🧪 TESTANDO URL S3:', s3Url);
        
        // Testar se a URL S3 realmente funciona
        try {
          const testResponse = await fetch(s3Url, { method: 'HEAD' });
          console.log('🧪 RESULTADO TESTE S3:', {
            status: testResponse.status,
            ok: testResponse.ok,
            statusText: testResponse.statusText,
            headers: Object.fromEntries(testResponse.headers.entries())
          });
          
          if (testResponse.ok) {
            console.log('✅ S3 URL validada, redirecionando:', s3Url);
            return NextResponse.redirect(s3Url, { status: 302 });
          } else {
            console.warn('⚠️ S3 URL não acessível:', testResponse.status);
          }
        } catch (error) {
          console.warn('⚠️ Erro ao validar S3 URL:', error);
        }
      }
      
      console.log('❌ Imagem não encontrada no S3, tentando GitHub:', {
        filename,
        s3Key,
        fallbackPath: `public/${isBanner ? 'banners-duplas' : 'itens'}/${filename}`
      });
      // Fallback para GitHub
      const folder = isBanner ? 'banners-duplas' : 'itens';
      finalUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/public/${folder}/${filename}`;
    }
    
    // Se a URL é do S3, verificar primeiro se funciona antes de redirecionar
    if (finalUrl && finalUrl.includes('s3.amazonaws.com')) {
      console.log('🔍 PROCESSANDO URL S3 DIRETA:', {
        finalUrl,
        originalImageUrl: imageUrl,
        originalFilename: filename
      });
      
      try {
        // Testar se a URL S3 funciona
        const testResponse = await fetch(finalUrl, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        console.log('🧪 TESTE URL S3 DIRETA:', {
          url: finalUrl,
          status: testResponse.status,
          ok: testResponse.ok,
          statusText: testResponse.statusText,
          contentType: testResponse.headers.get('content-type'),
          contentLength: testResponse.headers.get('content-length')
        });
        
        if (testResponse.ok) {
          console.log('✅ URL S3 funcionando, redirecionando:', finalUrl);
          return NextResponse.redirect(finalUrl, { status: 302 });
        } else {
          console.warn('⚠️ URL S3 não acessível:', testResponse.status, finalUrl);
          // Continuar com o proxy normal
        }
      } catch (error) {
        console.error('❌ ERRO AO TESTAR URL S3:', {
          error: error instanceof Error ? error.message : String(error),
          url: finalUrl,
          stack: error instanceof Error ? error.stack : undefined
        });
        // Se for URL S3 que falhou, tentar buscar no GitHub como fallback
        if (finalUrl.includes('s3.amazonaws.com')) {
          // Extrair filename da URL S3
          const s3Match = finalUrl.match(/\/banners_dupla\/(.+?)(?:\?|$)/);
          const filename = s3Match ? s3Match[1] : extractFilenameFromGithubUrl(finalUrl);
          if (filename) {
            const isBanner = finalUrl.includes('banners_dupla');
            const folder = isBanner ? 'banners-duplas' : 'itens';
            const githubUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/public/${folder}/${filename}`;
            console.log('🔄 Tentando fallback GitHub:', githubUrl);
            finalUrl = githubUrl;
          }
        }
        // Continuar com o proxy normal
      }
    }
    
    if (!finalUrl) {
      return new NextResponse('URL ou arquivo não fornecido', { status: 400 });
    }

    console.log('🔄 Proxying image:', finalUrl);

    // Headers para melhorar sucesso da requisição
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'image/*,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    // Adicionar token se disponível e for URL do GitHub
    if (GITHUB_TOKEN && finalUrl.includes('github')) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    // Buscar a imagem (apenas 1 tentativa para evitar atrasos)
    let response;
    
    try {
      response = await fetch(finalUrl, {
        headers,
        next: { revalidate: 3600 } // Cache por 1 hora
      });
      
      if (!response.ok) {
        console.log(`⚠️ Falha ao carregar imagem: ${finalUrl} (${response.status})`);
        return new NextResponse('Imagem não encontrada', { status: 404 });
      }
      
      console.log(`✅ Imagem carregada com sucesso:`, finalUrl);
      
    } catch (error) {
      console.warn(`❌ Erro ao carregar imagem:`, finalUrl, error);
      return new NextResponse('Erro ao carregar imagem', { status: 500 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    const endTime = Date.now();
    console.log(`✅ PROXY CONCLUÍDO COM SUCESSO:`, {
      finalUrl,
      contentType,
      bufferSize: imageBuffer.byteLength,
      processTime: `${endTime - startTime}ms`,
      timestamp: new Date().toISOString()
    });

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache por 24 horas
        'Access-Control-Allow-Origin': '*',
        'CDN-Cache-Control': 'max-age=86400',
        'Vercel-CDN-Cache-Control': 'max-age=86400'
      },
    });

  } catch (error) {
    const endTime = Date.now();
    console.error('❌ Erro no proxy de imagem:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      processTime: `${endTime - startTime}ms`,
      timestamp: new Date().toISOString()
    });
    return new NextResponse('Erro interno do servidor', { status: 500 });
  }
}