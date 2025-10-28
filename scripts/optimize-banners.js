const fs = require('fs');
const path = require('path');

const bannersDir = path.join(__dirname, '..', 'public', 'banners-duplas');

function sanitizeFilenameImproved(filename) {
  // Extrair timestamp, nomes dos jogadores e extensão
  const match = filename.match(/^(\d+)_(.+)_(.+)\.(\w+)$/);
  
  if (!match) {
    console.log(`❌ Não foi possível processar: ${filename}`);
    return filename;
  }
  
  const [, timestamp, playersName, originalName, extension] = match;
  
  // Limpar nome dos jogadores de forma mais refinada
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
  
  // Simplificar nome original (manter apenas parte mais relevante)
  let cleanOriginalName = originalName
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    // Remover padrões comuns desnecessários
    .replace(/duplique.*?edite/g, 'banner')
    .replace(/screenshot.*?canva/g, 'banner')
    .replace(/copia.*?party/g, 'banner')
    .replace(/tag.*?milena/g, 'banner')
    .replace(/img-\d+-wa\d+/g, 'whatsapp')
    .replace(/\d{8}_\d{6}_\d{4}/g, 'banner')
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, 'banner')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Se ficou muito longo ou vazio, usar "banner"
  if (cleanOriginalName.length > 20 || cleanOriginalName.length === 0) {
    cleanOriginalName = 'banner';
  }
  
  // Extensão em minúscula
  const cleanExtension = extension.toLowerCase();
  
  // Formato final: timestamp_jogadores_arquivo.ext
  return `${timestamp}_${cleanPlayersName}_${cleanOriginalName}.${cleanExtension}`;
}

function optimizeFileNames() {
  try {
    if (!fs.existsSync(bannersDir)) {
      console.log(`❌ Diretório não encontrado: ${bannersDir}`);
      return;
    }
    
    const files = fs.readdirSync(bannersDir);
    
    console.log('🔧 Otimizando nomes dos arquivos...\n');
    console.log(`📁 Diretório: ${bannersDir}\n`);
    
    let optimized = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const file of files) {
      if (file.startsWith('.') || !file.includes('_')) {
        skipped++;
        continue;
      }
      
      const oldPath = path.join(bannersDir, file);
      const newFilename = sanitizeFilenameImproved(file);
      const newPath = path.join(bannersDir, newFilename);
      
      if (file === newFilename) {
        console.log(`✅ ${file} (já otimizado)`);
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
        console.log(`🔧 ${file}`);
        console.log(`   -> ${newFilename}`);
        optimized++;
      } catch (error) {
        console.log(`❌ Erro ao otimizar ${file}: ${error.message}`);
        errors++;
      }
    }
    
    console.log(`\n📊 Resumo da otimização:`);
    console.log(`   🔧 Otimizados: ${optimized}`);
    console.log(`   ⏭️  Pulados: ${skipped}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log('\n✨ Otimização concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a otimização:', error);
  }
}

// Executar apenas se solicitado
if (process.argv.includes('--optimize')) {
  optimizeFileNames();
} else {
  console.log('💡 Para otimizar os nomes, execute: node scripts/rename-banners.js --optimize');
}