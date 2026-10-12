# EiFreela

Marketplace de diárias e serviços freelancer. Roda direto no navegador e pode ser **instalado de graça na tela inicial** do Android e do iPhone (PWA), sem loja de aplicativos.

- **Site:** `/` (landing page) · **App:** `/app/`
- **Stack:** React 18 + Vite + Tailwind 3 · Supabase (Auth, Postgres, Storage, Realtime, Edge Functions) · deploy na Vercel

## O que mudou na versão 2.0 (antiga "Conexão Free")

| # | Pedido | Como ficou |
|---|--------|-----------|
| 1 | PWA Android/iOS | `public/manifest.json`, `public/sw.js`, ícones em `public/icons/`, meta tags iOS em `index.html` e `app/index.html`, botão **Instalar** (Android) e passo a passo do Safari (iPhone) |
| 2 | Nome EiFreela | App, landing, manifesto, e-mails e ícones |
| 3 | Sem dados bancários; cadastro novo | Removidas as telas de documentos/selfie/PIX/banco. Cadastro só com nome, CPF, e-mail, nascimento, telefone/WhatsApp, foto e áreas de atuação; senha com letra, número e caractere especial |
| 4 | Localização aproximada | Vagas guardam só bairro/cidade/UF e coordenadas arredondadas (~1 km). Feed, detalhe e mapa mostram "Próximo a você" / "A ~X km de você" |
| 5 | Notificações de novas vagas | Gatilho no banco avisa quem atua na categoria (alerta no app em tempo real + Web Push com o app fechado). Também avisa novo candidato, seleção, desistência e conclusão |
| 6 | Avaliações e chat | Chat real (texto, emoji e **áudio**) entre contratante e profissional; avaliação com estrelas, critérios e comentário depois da diária concluída |
| 7 | Rolagem do cadastro | Removida a "moldura de celular" com altura fixa e `overflow: hidden`; as páginas rolam normalmente |
| 8 | Sem vagas fictícias | `src/data/mock.js` removido. O mural lê só o Supabase e mostra "Nenhuma vaga disponível no momento" quando vazio |
| 9 | Verificação de e-mail depois do pré-cadastro | Preenche tudo → recebe o código → confirma → conta criada |
| 10 | Google/Facebook reais | `supabase.auth.signInWithOAuth`; quem entra assim completa o perfil. Sem "Convidado Google" |
| 11 | Cards responsivos | Flex em coluna com `gap`, títulos em até 2 linhas e textos truncados; grade de 2–3 colunas em telas maiores |

Agenda, mapa, áudio no chat, check-in/check-out, favoritas, filtros e histórico foram mantidos — agora com dados reais.

## Ciclo da diária

`Disponível` → alguém toca **Tenho interesse** (abre o chat) → `Em Negociação` → o contratante **aceita** um candidato → `Em Atendimento` → profissional faz **check-in** e **check-out** (ou o contratante marca como concluída) → `Concluída` → os dois se **avaliam**.

## Banco de dados (Supabase)

Migrações em `supabase/migrations/` (já aplicadas no projeto `projeto-conecta`):

- `20261012150000_eifreela_base.sql` — perfis, avatares, conversas, mensagens, avaliações, notificações, push
- `20261012160000_eifreela_v2_contratacao_chat_audio.sql` — contratação, check-in/out, chat direto, áudios, critérios de avaliação

Edge Functions em `supabase/functions/`: `codigo-email`, `cadastrar`, `excluir-conta`, `notificar-vaga`.
Secrets necessários: `SMTP_USERNAME`, `SMTP_PASSWORD`, `NOTIFICAR_VAGA_SEGREDO`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (e o segredo `notificar_vaga_segredo` no Vault).

## Login com Google e Facebook

1. Supabase → **Authentication → URL Configuration**: *Site URL* = endereço da Vercel; em *Redirect URLs* adicione `https://SEU-SITE.vercel.app/**`.
2. **Providers → Google**: Client ID e Secret do Google Cloud (callback `https://yrnxekmviprbhlviuwvt.supabase.co/auth/v1/callback`).
3. **Providers → Facebook**: App ID e Secret do Meta for Developers (mesmo callback; permissões `email` e `public_profile`).

Enquanto um provedor não estiver ativo, o botão avisa isso — não cria conta falsa.

## Rodar no computador

```bash
npm install
npm run dev      # http://localhost:5173  (app em /app/)
npm run build    # gera dist/
```

As variáveis de `.env.example` são públicas (vão para o navegador); se não existirem, o app usa os valores do projeto. Nunca coloque a chave secreta/service_role no front-end.

## Instalar no celular

- **Android (Chrome):** abra o site → botão **Instalar** (ou menu ⋮ → *Instalar app*).
- **iPhone (Safari):** **Compartilhar** → **Adicionar à Tela de Início**. Avisos com o app fechado exigem iOS 16.4+ e o app instalado.
- Depois: **Perfil → Avisos de novas vagas → Ativar avisos**.
