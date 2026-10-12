# EiFreela

App de diárias e freelas que roda direto no navegador e pode ser **instalado de graça na tela inicial** do Android e do iPhone (PWA), sem passar por loja de aplicativos.

Stack: React 18 + Vite (front-end, deploy na Vercel) · Supabase (Auth, banco Postgres, Storage, Realtime e Edge Functions).

---

## O que mudou nesta versão (2.0)

| # | Pedido | Onde está |
|---|--------|-----------|
| 1 | PWA instalável (Android e iOS) | `public/manifest.json`, `public/sw.js`, `public/icons/*`, meta tags em `index.html`, registro em `src/main.jsx`, botão "Instalar" em `src/components/BotaoInstalar.jsx` |
| 2 | Novo nome **EiFreela** | Título, logo, manifesto, e-mails das Edge Functions |
| 3 | Sem dados bancários; cadastro novo | `src/screens/Cadastro.jsx`, tabela `profiles` na migração, função `cadastrar` |
| 4 | Localização só aproximada | Vagas guardam só bairro/cidade/UF e coordenadas arredondadas (~1 km). Feed e detalhes mostram "Próximo a você", "A ~2 km de você" ou o bairro |
| 5 | Notificações de novas vagas | Gatilho no banco cria aviso para quem atua na categoria + Web Push (`notificar-vaga`) + aviso em tempo real dentro do app |
| 6 | Avaliações e chat | `src/screens/Chat.jsx`, `Conversas.jsx`, `components/AvaliarModal.jsx`, tabelas `conversas`, `chat_mensagens`, `avaliacoes` |
| 7 | Rolagem do cadastro (Erro 1) | Nenhuma tela usa `h-screen` + `overflow:hidden`; páginas usam `min-height: 100dvh` e rolam normalmente (`src/styles.css`) |
| 8 | Sem vagas fictícias (Erro 2) | Feed lê só a tabela `vagas`; sem vagas mostra "Nenhuma vaga disponível no momento" |
| 9 | Verificação de e-mail depois do pré-cadastro (Erro 4) | Preenche tudo → recebe código → confirma → conta criada |
| 10 | Login Google/Facebook real (Erro 5) | `supabase.auth.signInWithOAuth` em `src/screens/Entrar.jsx`; quem entra assim completa o perfil em `CompletarPerfil.jsx` |
| 11 | Cards responsivos (Erro 6) | `src/components/Cards.jsx` + `.card-vaga` em `styles.css` (coluna no celular, grade no computador, textos longos truncados) |

### Campos do cadastro (tabela `profiles`)
Nome completo · CPF (validado e único) · E-mail · Data de nascimento (18+) · Telefone/WhatsApp · Foto (Storage, bucket `avatars`) · Áreas de atuação.
A **senha** fica no Supabase Auth (criptografada), nunca na tabela. Regra: 8+ caracteres com letra, número e caractere especial (`@ # $ !` …).
CPF, e-mail, nascimento e telefone só são lidos pelo próprio dono (função `meu_perfil`); os outros usuários veem apenas nome, foto e áreas.

---

## Passo a passo para publicar

> Faça na ordem. Os passos 1 e 2 alteram o Supabase; o app novo depende deles.

### 1. Banco de dados (Supabase → SQL Editor)
1. Abra o projeto **projeto-conecta** no Supabase → **SQL Editor** → **New query**.
2. Cole o conteúdo de `supabase/migrations/20261012_eifreela.sql` e clique em **Run**.
3. Em outra query, rode o comando do arquivo **SEGREDOS** que você recebeu separado (cria o segredo `notificar_vaga_segredo` no Vault). **Não coloque esse arquivo no GitHub.**

A migração só **adiciona** coisas (tabelas novas, colunas `lat_aprox`/`lng_aprox` em `vagas`, bucket `avatars`). As tabelas antigas `mensagens` e `projeto-conecta` não são usadas pelo app novo e podem ser removidas depois, se quiser.

### 2. Edge Functions (Supabase → Edge Functions)
Atualize/crie as funções com o código das pastas `supabase/functions/`:

| Função | Verify JWT | Observação |
|--------|-----------|------------|
| `codigo-email` | **desligado** | já existe — substituir o código |
| `cadastrar` | **desligado** | já existe — substituir o código |
| `notificar-vaga` | **desligado** | nova (a proteção é o segredo no cabeçalho) |

Em **Edge Functions → Secrets**, cadastre (valores no arquivo SEGREDOS): `NOTIFICAR_VAGA_SEGREDO`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. Os secrets do Gmail (`SMTP_USERNAME`, `SMTP_PASSWORD`) já existem.

### 3. Login com Google e Facebook (Supabase → Authentication)
1. **Authentication → URL Configuration**: em *Site URL* coloque o endereço da Vercel (ex.: `https://eifreela.vercel.app`) e em *Redirect URLs* adicione `https://eifreela.vercel.app/**` e `http://localhost:5173/**`.
2. **Authentication → Providers → Google**: ative e cole o *Client ID* e *Client Secret* criados no Google Cloud Console (tipo "Aplicativo da Web"; URI de redirecionamento autorizado: `https://yrnxekmviprbhlviuwvt.supabase.co/auth/v1/callback`).
3. **Providers → Facebook**: ative e cole o *App ID* e *App Secret* do Meta for Developers (produto "Login do Facebook"; mesma URI de callback acima; permissões `email` e `public_profile`).

Enquanto um provedor não estiver ativado, o botão mostra o aviso "ainda não foi ativado no Supabase" — não cria conta falsa.

### 4. GitHub (pelo navegador)
1. Abra o repositório `Projeto-Conecta---Repositorios` → **Add file → Upload files**.
2. Arraste **o conteúdo** da pasta `eifreela` (as pastas `public`, `src`, `supabase` e os arquivos `index.html`, `package.json`, `vite.config.js`, `vercel.json`, `.env.example`, `.gitignore`, `README.md`).
3. Clique em **Commit changes**.

### 5. Vercel
1. **Add New → Project** → importe o repositório do GitHub.
2. Framework: **Vite** (detectado sozinho). Build: `npm run build`. Output: `dist`.
3. (Opcional) Em *Environment Variables*, cadastre as variáveis de `.env.example`. Se não cadastrar, o app usa os mesmos valores públicos que já estão no código.
4. **Deploy**. Cada novo commit no GitHub publica uma versão nova automaticamente.

### 6. Instalar no celular
- **Android (Chrome):** abra o site → botão **Instalar** no topo (ou menu ⋮ → *Instalar app*).
- **iPhone (Safari):** abra o site → **Compartilhar** → **Adicionar à Tela de Início**. Os avisos (push) no iPhone funcionam com o app instalado, iOS 16.4 ou mais novo.
- Depois de instalado: **Perfil → Avisos de novas vagas → Ativar avisos**.

---

## Rodar no computador (opcional)
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera a pasta dist
```
O Service Worker só é registrado na versão de produção (`npm run build && npm run preview`).

## Estrutura
```
index.html                 meta tags PWA (Android/iOS)
public/manifest.json       nome, ícones, cores, display standalone
public/sw.js               cache do app + Web Push
public/icons/              ícones 72–512, maskable e apple-touch
src/main.jsx               entrada + registro do Service Worker
src/App.jsx                sessão, rotas (#/…), avisos em tempo real, menu
src/lib/                   supabase, validações, push, roteador
src/components/            cards, ícones, campos do perfil, modais
src/screens/               telas (feed, vaga, publicar, chat, perfil…)
supabase/migrations/       SQL do banco
supabase/functions/        Edge Functions (cadastrar, codigo-email, notificar-vaga)
```

## Regras de negócio mantidas
- Contratante não pode se candidatar/abrir conversa na própria vaga (regra no banco).
- Vaga "Em Negociação" ou "Em Atendimento" não pode ser excluída.
- Avaliação só depois que a vaga é marcada como **Concluída**, uma por pessoa por vaga, apenas entre quem negociou.
- Publicar vaga recusa textos que pareçam endereço exato (rua + número, CEP).
