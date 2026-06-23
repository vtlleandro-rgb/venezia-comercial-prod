# Deploy do Residencial Venezia na Vercel

Esta pasta é a cópia migrada para site estático. O projeto não depende do Manus para rodar.

## Pré-requisitos locais

- Node.js 20.19+ ou 22.12+
- pnpm 10

## Instalação e validação

```bash
pnpm install
pnpm check
pnpm build
pnpm dev
```

O Vite mostrará o endereço local — normalmente `http://localhost:3000`. Para testar o resultado de produção localmente:

```bash
pnpm preview
```

O diretório gerado para publicação é `dist`.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` apenas se for usar o componente opcional de mapa do Google:

```bash
VITE_GOOGLE_MAPS_API_KEY=sua_chave
```

No estado atual, o mapa principal usa incorporação pública e o site pode ser publicado sem variáveis. Nunca envie arquivos `.env*` com chaves reais ao Git.

## Enviar ao GitHub

Crie um repositório vazio no GitHub — sem README, `.gitignore` ou licença — e copie a URL dele. Na raiz desta pasta, conecte e envie a branch de migração:

```bash
git remote add origin https://github.com/SEU-USUARIO/venezia-migracao-publica.git
git push -u origin migracao-fase-1-site-publico
```

Se preferir que a branch de migração seja a principal do repositório, altere-a no GitHub em **Settings > Branches > Default branch** depois do envio.

Antes de enviar novas alterações, confira se não há arquivos pendentes:

```bash
git status
```

O resultado esperado é `nothing to commit, working tree clean`.

## Publicar na Vercel

1. Na Vercel, escolha **Add New > Project** e importe o repositório do GitHub.
2. Em **Git Repository**, selecione a branch `migracao-fase-1-site-publico`.
3. Em **Build and Output Settings**, defina:
   - Framework Preset: `Vite`
   - Build Command: `pnpm build`
   - Output Directory: `dist`
   - Install Command: `pnpm install`
4. Use Node.js 22.x nas configurações do projeto.
5. Não há variável obrigatória para o primeiro deploy. Se for necessário usar mapa com chave no futuro, cadastre `VITE_GOOGLE_MAPS_API_KEY` em **Settings > Environment Variables**.
6. Clique em **Deploy**.

O arquivo `vercel.json` já encaminha rotas da aplicação para `index.html`, preservando o funcionamento de SPA ao abrir links diretamente.

## Checklist pós-deploy

- [ ] Abrir a página inicial pela URL gerada na Vercel.
- [ ] Navegar pelo menu e conferir âncoras e seções.
- [ ] Executar o simulador com valores de teste.
- [ ] Abrir e testar o fluxo de proposta sem enviar dados reais.
- [ ] Abrir o painel comercial e conferir os fluxos atuais, que continuam locais ao navegador.
- [ ] Conferir se os placeholders aparecem nos locais onde faltam imagens originais.
- [ ] Abrir uma rota inexistente, por exemplo `/teste-inexistente`, e confirmar a tela 404 da aplicação.
- [ ] Fazer um recarregamento do navegador nessa rota inexistente para confirmar que o fallback da Vercel funciona.

## Imagens pendentes

As imagens que estavam no armazenamento do Manus não constavam do backup original. Elas são mostradas por um placeholder em `client/public/assets/venezia/placeholder.svg`. Ao recuperar os arquivos reais, coloque-os em `client/public/assets/venezia/` e substitua os caminhos correspondentes no código.

## Fora do escopo desta fase

Banco de dados, Supabase, login novo, WhatsApp e sincronização comercial não foram implementados.
