// Teste da API de Upload
// Este arquivo pode ser usado para testar a funcionalidade de upload

async function testUpload() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  
  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tag', 'TEST');
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      console.log('Resultado do upload:', result);
      
      if (result.success) {
        alert(`Upload realizado! URL: ${result.imageUrl}`);
      } else {
        alert(`Erro: ${result.message}`);
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      alert('Erro no teste de upload');
    }
  };
  
  fileInput.click();
}

// Para usar: chame testUpload() no console do navegador
console.log('Para testar upload, chame: testUpload()');
