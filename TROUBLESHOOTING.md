# Torneio Escolar - Troubleshooting

## Problemas Comuns e Soluções

### ❌ Erro de Cache do Webpack
```
[webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: ENOENT
```

**Solução:**
```bash
npm run clean
npm run dev
```

Ou manualmente:
```bash
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

### 🖼️ Problemas com Upload de Imagem

1. **Verificar diretório existe:**
   - `public/banners/` deve existir
   - Verificar permissões de escrita

2. **Teste a API diretamente:**
   - Acesse `/test-upload.js` no console do navegador
   - Execute `testUpload()`

### 🔥 Firebase Connection Issues

1. **Verificar configuração:**
   - Arquivo `lib/firebase.ts`
   - Credenciais corretas

2. **Regras do Firestore:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

### 🚀 Comandos Úteis

- `npm run dev` - Iniciar desenvolvimento
- `npm run dev:clean` - Limpar cache e iniciar
- `npm run build` - Build de produção
- `npm run clean` - Limpar apenas cache

### 📱 URLs do Projeto

- **Desenvolvimento:** http://localhost:3000 (ou próxima porta disponível)
- **Login Professor:** senha `admin123`
- **Login Aluno:** sem senha

### 🐛 Debug

Para debug detalhado, abra o console do navegador (F12) e observe os logs:
- `🚀` - Início de operações
- `✅` - Sucessos
- `❌` - Erros
- `📁` - Upload de arquivos
