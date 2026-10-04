# Conexão Free

Marketplace de **diárias e serviços freelancer** para o Brasil. Conecta quem precisa
contratar uma diária (modo **Contratar**) a profissionais que querem trabalhar
(modo **Trabalhar**). Inclui mural de vagas com filtros, mapa por raio de distância,
ciclo completo da diária (candidatura → aceite → confirmação → check-in/check-out →
avaliação), chat com emojis/áudio/PIX e reputação bidirecional.

> **Protótipo.** Todos os dados são mockados e vivem só em memória: recarregar a
> página volta ao estado inicial. Veja [O que é simulado](#o-que-é-simulado-e-exigiria-backend).

## Requisitos

- Node.js 20 ou superior (testado com Node 24)

## Como rodar

```bash
npm install
```

```bash
npm run dev
```

Abre em `http://localhost:5173`.

```bash
npm run build
```

Gera o site estático em `dist/`. Para conferir o build localmente:

```bash
npm run preview
```

## Estrutura de pastas

```
index.html                 Página base (pt-BR, viewport-fit=cover)
src/
  main.jsx                 Ponto de entrada: monta o App dentro do Error Boundary
  App.jsx                  Protótipo completo (componente App e telas)
  AppErrorBoundary.jsx     Tela de recuperação se alguma tela falhar
  index.css                Tailwind + frame de celular (desktop) / tela cheia (celular)
referencia/                Material original, só para consulta (não entra no build)
  codigo-fonte/            ConexaoFree.jsx original
  site/                    Versão standalone anterior (CDN)
  docs/                    Documento de requisitos (RF, RN, BUG)
  exemplos/                Prompts de exemplo usados como referência
tailwind.config.js         Tailwind 3 varrendo index.html e src/**/*.{js,jsx}
postcss.config.js
vite.config.js             base "./" (funciona em qualquer subpasta)
```

## Como publicar

O build é um site estático: basta publicar a pasta `dist/`.

- **Netlify:** comando de build `npm run build`, pasta de publicação `dist`.
- **Vercel:** framework "Vite", build `npm run build`, saída `dist`.
- **GitHub Pages:** rode `npm run build` e publique o conteúdo de `dist/`
  (por exemplo, com a action oficial `actions/deploy-pages`). Como o `base` é
  relativo, funciona em `https://<usuario>.github.io/<repositorio>/`.

O app não usa rotas de URL hoje, então não precisa de regra de redirecionamento.

## O que é simulado (e exigiria backend)

| Funcionalidade | No protótipo | Em produção |
|---|---|---|
| Login, cadastro, recuperação de senha | Validação só na tela | Autenticação real, hash de senha, sessões |
| Verificação de e-mail (código de 6 dígitos) e celular | Código simulado | Envio de e-mail/SMS |
| Documento (RG/CNH), selfie ao vivo, KYC | Captura local, nada é enviado | Upload seguro + verificação de identidade (LGPD) |
| Dados bancários e chave PIX | Só em memória | Armazenamento criptografado / provedor de pagamento |
| Vagas, candidaturas, avaliações, notificações | Estado React em memória | Banco de dados + API + push |
| Chat (texto e áudio) | Em memória; áudio é URL local temporária | Mensageria em tempo real + armazenamento de mídia |
| Mapa | Posições estimadas; distância por Haversine | Geocodificação real dos endereços |
| Nota das empresas | Valor fixo (mock) | Média calculada das avaliações |

Nenhuma senha, token ou chave fica no código. Se um dia for preciso credencial
(API, mapas, etc.), ela deve vir de variável de ambiente (`.env`, já ignorado no git).

## Documentação do produto

- Contexto e regras de negócio: `referencia/PROMPT_PROJETO_CONEXAO_FREE.md`
- Requisitos detalhados: `referencia/docs/03_Documento_Requisitos_ConexaoFree.md`
- Histórico: `referencia/DOCUMENTACAO_PASSOS.md`
