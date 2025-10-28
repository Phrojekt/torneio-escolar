const fs = require('fs');
const path = require('path');

const bannersDir = path.join(__dirname, '..', 'public', 'banners-duplas');

function sanitizeFilename(filename) {
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
    .replace(/\s+e\s+/gi, '-e-')  // "E" vira "-e-"
    .replace(/\s+/g, '-')         // Espaços viram hífens
    .replace(/[^a-z0-9\-]/g, '')  // Remove caracteres especiais
    .replace(/-+/g, '-')          // Remove hífens duplicados
    .replace(/^-|-$/g, '');       // Remove hífens no início/fim
  
  // Limpar nome original (simplificar)
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
    if (!fs.existsSync(bannersDir)) {
      console.log(`❌ Diretório não encontrado: ${bannersDir}`);
      return;
    }
    
    const files = fs.readdirSync(bannersDir);
    
    console.log('🔄 Iniciando renomeação dos arquivos...\n');
    console.log(`📁 Diretório: ${bannersDir}\n`);
    
    let renamed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const file of files) {
      if (file.startsWith('.') || !file.includes('_')) {
        skipped++;
        continue; // Ignorar arquivos ocultos ou sem padrão
      }
      
      const oldPath = path.join(bannersDir, file);
      const newFilename = sanitizeFilename(file);
      const newPath = path.join(bannersDir, newFilename);
      
      if (file === newFilename) {
        console.log(`✅ ${file} (já está correto)`);
        skipped++;
        continue;
      }
      
      // Verificar se o novo nome já existe
      if (fs.existsSync(newPath)) {
        console.log(`⚠️  ${file} -> ${newFilename} (conflito - pulado)`);
        skipped++;
        continue;
      }
      
      try {
        // Renomear arquivo
        fs.renameSync(oldPath, newPath);
        console.log(`✅ ${file}`);
        console.log(`   -> ${newFilename}`);
        renamed++;
      } catch (error) {
        console.log(`❌ Erro ao renomear ${file}: ${error.message}`);
        errors++;
      }
    }
    
    console.log(`\n📊 Resumo:`);
    console.log(`   ✅ Renomeados: ${renamed}`);
    console.log(`   ⏭️  Pulados: ${skipped}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log('\n🎉 Processo concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante a renomeação:', error);
  }
}

// Executar
renameFiles();