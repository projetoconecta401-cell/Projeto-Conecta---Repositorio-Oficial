# Conexão Free

Marketplace de **diárias e serviços freelancer** para o Brasil. Conecta quem precisa
contratar uma diária (modo **Contratar**) a profissionais que querem trabalhar
(modo **Trabalhar**). Inclui mural de vagas com filtros, mapa por raio de distância,
ciclo completo da diária (candidatura → aceite → confirmação → check-in/check-out →
avaliação), chat com emojis/áudio/PIX e reputação bidirecional.

O site tem duas páginas:

| Endereço | O que é |
|---|---|
| `/` | Landing page institucional (apresenta o Conexão Free) |
| `/app/` | O app Conexão Free (frame de celular no computador, tela cheia no celular) |

> **Protótipo.** Todos os dados do app são mockados e vivem só em memória: recarregar a
> página volta ao estado inicial. Veja [O que é simulado](#o-que-é-simulado-e-exigiria-backend).

## Para rodar e editar:

```bash
cd "C:\Users\Win10\Desktop\projeto conecta"
npm install
npm run dev
```

Depois abra http://localhost:5173/ (landing) ou http://localhost:5173/app/ (app).

> **Windows / PowerShell:** se aparecer o erro *"npm.ps1 não pode ser carregado porque a
> execução de scripts foi desabilitada"*, use `npm.cmd` no lugar de `npm`
> (`npm.cmd install`, `npm.cmd run dev`, `npm.cmd run build`). Para voltar a usar só `npm`,
> rode uma vez `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` e abra um terminal novo.

---

## Primeiros passos (do zero)

### 1. Instale as ferramentas (uma vez só)

| Ferramenta | Para quê | Onde baixar |
|---|---|---|
| **Node.js** (versão LTS, 20 ou superior) | Roda o projeto e instala as dependências (traz o `npm`) | https://nodejs.org |
| **Visual Studio Code** | Editor para abrir e alterar os arquivos | https://code.visualstudio.com |
| **Git** (opcional) | Histórico de versões e envio ao GitHub | https://git-scm.com |

Extensões recomendadas no VS Code: **Tailwind CSS IntelliSense** (sugere as classes de estilo)
e **ES7+ React snippets** (atalhos de React). Ambas são opcionais.

### 2. Abra o projeto

No VS Code: **Arquivo → Abrir Pasta…** e escolha a pasta do projeto
(`projeto conecta`). Depois abra o terminal integrado: **Terminal → Novo Terminal**.

### 3. Instale as dependências (só na primeira vez, ou quando o `package.json` mudar)

```bash
npm install
```

### 4. Rode o site

```bash
npm run dev
```

Abra no navegador:
- Landing: http://localhost:5173/
- App: http://localhost:5173/app/

Deixe esse terminal aberto. **Ao salvar qualquer arquivo, o navegador atualiza sozinho.**
Para parar o servidor, clique no terminal e aperte `Ctrl + C`.

### 5. Gere a versão final (para publicar)

```bash
npm run build
```

Cria a pasta `dist/` com o site pronto. Para conferir essa versão localmente:

```bash
npm run preview
```

(abre em http://localhost:4173/)

---

## Onde editar cada coisa

```
index.html                     Página da landing (título da aba, descrição)
app/index.html                 Página do app (título da aba)
public/favicon.svg             Ícone da aba do navegador
src/
  landing/
    content.js                 ★ TEXTOS da landing (títulos, passos, benefícios)
    Landing.jsx                Layout da landing (seções, botões, cores)
    landing.css                Estilo base da landing
  data/
    mock.js                    ★ DADOS de exemplo do app (vagas, profissionais, cidades)
  screens/                     Telas do app
    FeedScreen.jsx             Mural de vagas, abas, categorias
    JobDetail.jsx              Detalhe da vaga (candidatar, aceitar, check-in…)
    MapScreen.jsx              Mapa e raio de busca
    AgendaScreen.jsx, NotificationsScreen.jsx, RatingScreen.jsx, …
    auth/                      Login, cadastro, verificação, termos
    account/                   Minha conta, editar perfil, candidaturas, diárias
    chat/                      Chat da vaga, lista de conversas, chat direto, perfil do profissional
  components/                  Peças reutilizáveis
    ui.jsx                     Botões, campos, TopBar, Pill, Toast
    BottomNav.jsx              Barra de navegação inferior
    jobs/                      Cartão de vaga, modais de publicar/filtrar/cancelar
    chat/                      Emojis, gravação de áudio, bolha de áudio
  lib/                         Funções utilitárias (distância Haversine, "há X min")
  App.jsx                      Estado do app e navegação entre telas (regras do fluxo)
  AppErrorBoundary.jsx         Tela de recuperação se alguma tela falhar
  index.css                    Frame de celular (computador) / tela cheia (celular)
  main.jsx                     Ponto de entrada do app
referencia/                    Material original, só para consulta (não entra no site)
```

**Exemplos rápidos**

- Mudar um texto da landing → `src/landing/content.js`.
- Mudar/adicionar uma vaga de exemplo → `src/data/mock.js` (lista `INITIAL_JOBS`).
- Mudar o visual de um botão do app → `src/components/ui.jsx`.
- Mudar o que acontece ao aceitar um candidato → `src/App.jsx` (`handleAccept`).

**Estilos:** o projeto usa [Tailwind CSS](https://tailwindcss.com/docs): o visual é definido
pelas classes no próprio `className` (ex.: `bg-emerald-600` = fundo verde, `rounded-xl` =
cantos arredondados, `text-[15px]` = tamanho da fonte). **Ícones:** [lucide-react](https://lucide.dev/icons)
(importe pelo nome, ex.: `import { MapPin } from "lucide-react"`).

**Regras de negócio que não podem ser quebradas** ao editar estão em
`referencia/PROMPT_PROJETO_CONEXAO_FREE.md` (ex.: endereço só para o candidato aprovado;
modais, toasts e botões flutuantes com `position: absolute`, nunca `fixed`).

---

## Como publicar

O build é um site estático: basta publicar a pasta `dist/`.

- **Netlify:** comando de build `npm run build`, pasta de publicação `dist`.
- **Vercel:** já configurado em `vercel.json` (framework Vite, build `npm run build`, saída
  `dist`, `/app` redireciona para `/app/`, cache longo para `assets/`). Em vercel.com:
  **Add New → Project → Import** o repositório do GitHub e clique em **Deploy**, sem mudar
  nenhuma opção. Cada `git push` na `main` publica uma nova versão automaticamente.
- **GitHub Pages:** rode `npm run build` e publique o conteúdo de `dist/`
  (por exemplo, com a action oficial `actions/deploy-pages`). Como os caminhos são
  relativos, funciona em `https://<usuario>.github.io/<repositorio>/`.

Não precisa de regra de redirecionamento: a landing é `dist/index.html` e o app é
`dist/app/index.html`.

## O que é simulado (e exigiria backend)

| Funcionalidade | No protótipo | Em produção |
|---|---|---|
| Login, cadastro, recuperação de senha | Validação só na tela | Autenticação real, hash de senha, sessões |
| Verificação de e-mail (código de 6 dígitos) e celular | Código simulado | Envio de e-mail/SMS |
| Documento (RG/CNH), selfie ao vivo, KYC | Captura local, nada é enviado | Upload seguro + verificação de identidade (LGPD) |
| Dados bancários e chave PIX | Só em memória | Armazenamento criptografado / provedor de pagamento |
| Vagas, candidaturas, avaliações, notificações | Estado React em memória | Banco de dados + API + push |
| Endereço da vaga antes do aceite | Escondido na tela | A API nem envia o endereço antes da aprovação |
| Chat (texto e áudio) | Em memória; áudio é URL local temporária | Mensageria em tempo real + armazenamento de mídia |
| Mapa | Posições estimadas; distância por Haversine | Geocodificação real dos endereços |
| Nota das empresas | Valor fixo (mock) | Média calculada das avaliações |

Nenhuma senha, token ou chave fica no código. Se um dia for preciso credencial
(API, mapas etc.), ela deve vir de variável de ambiente (`.env`, já ignorado no git).

## Tecnologias

React 18 · Vite 8 · Tailwind CSS 3 (PostCSS) · lucide-react. Sem backend, sem outras bibliotecas.

## Documentação do produto

- Contexto e regras de negócio: `referencia/PROMPT_PROJETO_CONEXAO_FREE.md`
- Requisitos detalhados: `referencia/docs/03_Documento_Requisitos_ConexaoFree.md`
- Histórico: `referencia/DOCUMENTACAO_PASSOS.md`
