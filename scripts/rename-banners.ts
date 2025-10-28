import fs from 'fs';
import path from 'path';

const bannersDir = 'public/banners-duplas';

function sanitizeFilename(filename: string): string {
  // Extrair timestamp, nomes dos jogadores e extensão
  const match = filename.match(/^(\d+)_(.+)_(.+)\.(\w+)$/);
  
  if (!match) {
    console.log(`❌ Não foi possível processar: ${filename}`);
    return filename;
  }
  
  const [, timestamp, playersName, originalName, extension] = match;
  
  // Limpar nome dos jogadores
  const cleanPlayersName = playersName
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/\s+e\s+/g, '-e-')  // "E" vira "-e-"
    .replace(/\s+/g, '-')        // Espaços viram hífens
    .replace(/[^a-z0-9\-]/g, '') // Remove caracteres especiais
    .replace(/-+/g, '-')         // Remove hífens duplicados
    .replace(/^-|-$/g, '');      // Remove hífens no início/fim
  
  // Limpar nome original (manter apenas parte relevante)
  const cleanOriginalName = originalName
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Extensão em minúscula
  const cleanExtension = extension.toLowerCase();
  
  // Formato final: timestamp_jogadores_arquivo.ext
  return `${timestamp}_${cleanPlayersName}_${cleanOriginalName}.${cleanExtension}`;
}

function renameFiles() {
  try {
    const files = fs.readdirSync(bannersDir);
    
    console.log('🔄 Iniciando renomeação dos arquivos...\n');
    
    for (const file of files) {
      if (file.startsWith('.')) continue; // Ignorar arquivos ocultos
      
      const oldPath = path.join(bannersDir, file);
      const newFilename = sanitizeFilename(file);
      const newPath = path.join(bannersDir, newFilename);
      
      if (file === newFilename) {
        console.log(`✅ ${file} (já está correto)`);
        continue;
      }
      
      // Verificar se o novo nome já existe
      if (fs.existsSync(newPath)) {
        console.log(`⚠️  ${file} -> ${newFilename} (conflito - pulado)`);
        continue;
      }
      
      // Renomear arquivo
      fs.renameSync(oldPath, newPath);
      console.log(`✅ ${file} -> ${newFilename}`);
    }
    
    console.log('\n🎉 Renomeação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a renomeação:', error);
  }
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  renameFiles();
}

export { renameFiles, sanitizeFilename };