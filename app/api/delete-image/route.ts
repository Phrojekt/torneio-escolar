import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'Phrojekt/torneio-escolar';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_API_URL = 'https://api.github.com';

export async function DELETE(request: NextRequest) {
  try {
    // Verificar se o token do GitHub está configurado
    if (!GITHUB_TOKEN) {
      console.error('❌ Token do GitHub não configurado');
      return NextResponse.json({ 
        success: false, 
        message: 'Token do GitHub não configurado. Configure a variável GITHUB_TOKEN.' 
      });
    }

    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ 
        success: false, 
        message: 'URL da imagem não fornecida' 
      });
    }

    console.log('🗑️ Tentando deletar imagem:', imageUrl);

    // Extrair o caminho do arquivo da URL raw do GitHub
    // Formato: https://raw.githubusercontent.com/owner/repo/branch/path
    const urlParts = imageUrl.replace('https://raw.githubusercontent.com/', '').split('/');
    if (urlParts.length < 4) {
      return NextResponse.json({ 
        success: false, 
        message: 'URL inválida do GitHub' 
      });
    }

    // Remover owner/repo/branch para obter o caminho
    const repoFilePath = urlParts.slice(3).join('/');
    console.log('📂 Caminho do arquivo:', repoFilePath);

    // Buscar SHA do arquivo para deletar
    const getFileRes = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${repoFilePath}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
      },
    });

    if (!getFileRes.ok) {
      console.log('ℹ️ Arquivo não encontrado no GitHub (pode já ter sido deletado)');
      return NextResponse.json({ 
        success: true, 
        message: 'Arquivo não encontrado (pode já ter sido deletado)' 
      });
    }

    const fileData = await getFileRes.json();
    const sha = fileData.sha;

    // Deletar arquivo via API do GitHub
    const deleteRes = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${repoFilePath}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `delete image: ${repoFilePath}`,
        sha,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!deleteRes.ok) {
      const errorData = await deleteRes.json();
      console.error('❌ Erro ao deletar do GitHub:', errorData);
      return NextResponse.json({ 
        success: false, 
        message: `Erro ao deletar do GitHub: ${errorData.message || 'Erro desconhecido'}`,
        details: errorData
      });
    }

    console.log('✅ Imagem deletada com sucesso do GitHub');

    return NextResponse.json({ 
      success: true, 
      message: 'Imagem deletada com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : error
    });
  }
}
