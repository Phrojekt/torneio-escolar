// import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'Phrojekt/torneio-escolar';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_USER = process.env.GITHUB_USER || 'github-actions[bot]';


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

    // Converter para base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const contentBase64 = buffer.toString('base64');

    // Criar nome único
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${tag}_${cleanName}`;

    // Pasta de destino
    const folder = type === 'item' ? 'public/itens' : 'public/banners-duplas';
    const repoFilePath = `${folder}/${fileName}`;

    // Buscar SHA do arquivo se já existir (para update)
    let sha: string | undefined = undefined;
    const getFileRes = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${repoFilePath}?ref=${GITHUB_BRANCH}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
      },
    });
    if (getFileRes.ok) {
      const fileData = await getFileRes.json();
      sha = fileData.sha;
    }

    // Commitar arquivo via API do GitHub
    const commitRes = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${repoFilePath}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `upload banner via API: ${fileName}`,
        content: contentBase64,
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!commitRes.ok) {
      const error = await commitRes.json();
      return NextResponse.json({ success: false, message: 'Erro ao salvar no GitHub', error });
    }

    // Gerar URL raw
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO.replace(/\/.*/, '')}/${GITHUB_REPO.split('/')[1]}/${GITHUB_BRANCH}/${repoFilePath}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl: rawUrl,
      message: 'Upload realizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : error
    });
  }
}
