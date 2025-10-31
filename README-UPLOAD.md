# Sistema de Upload Simplificado

## Como funciona

O sistema agora está completamente simplificado:

1. **Upload direto para S3**: Qualquer imagem é enviada diretamente para o bucket S3
2. **Sem complexidade**: Removida toda lógica de retry, encoding e validações desnecessárias
3. **Nomes únicos**: Cada arquivo recebe um nome único com timestamp + hash aleatório

## Configuração

1. Configure as variáveis de ambiente no `.env.local`:
```bash
MY_AWS_ACCESS_KEY_ID=sua_access_key
MY_AWS_SECRET_ACCESS_KEY=sua_secret_key
```

2. O bucket está configurado como `jambalaia` na região `us-east-1`

## Endpoint de Upload

**POST** `/api/upload`

**Parâmetros:**
- `file`: Arquivo de imagem (FormData)

**Resposta de sucesso:**
```json
{
  "success": true,
  "imageUrl": "https://jambalaia.s3.amazonaws.com/banners_dupla/1234567890_abc123.jpg",
  "message": "Upload realizado com sucesso!"
}
```

**Resposta de erro:**
```json
{
  "success": false,
  "message": "Descrição do erro"
}
```

## Validações

- Tamanho máximo: 10MB
- Tipos aceitos: JPEG, PNG, WebP, GIF
- Arquivos são salvos na pasta `banners_dupla/` do bucket S3

## Componente BannerDupla

O componente foi simplificado para apenas:
1. Tentar carregar a imagem da URL
2. Em caso de erro, mostrar fallback com a tag da dupla

## Teste

Para testar, abra o arquivo `test-simple-upload.html` no navegador com o servidor rodando.