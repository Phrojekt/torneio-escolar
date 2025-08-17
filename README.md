# Torneio Escolar

Sistema para gerenciamento de torneios escolares com upload de banners de duplas.

## Configuração para Deploy no Netlify

### 1. Token do GitHub para Upload de Imagens

Para que o upload de imagens funcione no Netlify, é necessário configurar um token do GitHub:

#### Passo 1: Criar Personal Access Token
1. Vá em https://github.com/settings/tokens
2. Clique em "Generate new token" > "Generate new token (classic)"
3. Dê um nome para o token (ex: "torneio-escolar-uploads")
4. Selecione as permissões:
   - **Contents**: Read and write (para criar/editar arquivos)
5. Clique em "Generate token"
6. **IMPORTANTE**: Copie o token gerado (você não conseguirá vê-lo novamente)

#### Passo 2: Configurar no Netlify
1. No painel do Netlify, vá em "Site settings" > "Environment variables"
2. Adicione as seguintes variáveis:
   - `GITHUB_TOKEN`: Cole o token gerado
   - `GITHUB_REPO`: `Phrojekt/torneio-escolar`
   - `GITHUB_BRANCH`: `main`

### 2. Como Funciona o Upload

- As imagens são salvas diretamente no repositório na pasta `public/banners-duplas/`
- O sistema retorna a URL raw do GitHub para exibição
- As imagens ficam versionadas e sempre acessíveis

### 3. Desenvolvimento Local

1. Clone o repositório
2. Copie `.env.example` para `.env.local`
3. Configure as variáveis de ambiente
4. Execute `npm install`
5. Execute `npm run dev`

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera o build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## Tecnologias Utilizadas

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Radix UI
- Firebase
- GitHub API
