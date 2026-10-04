# TAREFA: gerar o site do Conexão Free como projeto web real

## Material de entrada (leia tudo antes de começar)
Estes arquivos estão na pasta do projeto:
- `PROMPT_PROJETO_CONEXAO_FREE.md`: contexto, finalidade, fluxos, regras de negócio e pendências. É a fonte de verdade do produto.
- `codigo-fonte/ConexaoFree.jsx`: protótipo React completo (~4.000 linhas, componente `App`), com imports de `react` e `lucide-react`.
- `docs/03_Documento_Requisitos_ConexaoFree.md`: requisitos detalhados (RF, RN, BUG).
- `site/index.html`: versão atual publicada (standalone, com CDN), só para comparação visual e de comportamento.
- `DOCUMENTACAO_PASSOS.md`: histórico do que já foi feito.

## Objetivo
Transformar o protótipo em um **projeto web de verdade, com build**, que rode localmente e possa ser hospedado como site estático. O comportamento e o visual devem ficar **idênticos** ao protótipo atual. Esta tarefa é de estruturação e entrega, não de redesenho.

## Stack
- Vite + React 18 (JavaScript, não TypeScript)
- Tailwind CSS configurado de forma padrão (via PostCSS, não CDN)
- `lucide-react` para ícones
- Sem backend, sem bibliotecas extras, a menos que sejam realmente necessárias

## Passos
1. **Plano curto primeiro.** Antes de criar arquivos, mostre em até 10 linhas a estrutura de pastas que pretende usar e peça confirmação.
2. **Scaffold.** Crie o projeto Vite + React, instale `tailwindcss`, `postcss`, `autoprefixer` e `lucide-react`. Configure o Tailwind para varrer `index.html` e `src/**/*.{js,jsx}`.
3. **Migrar o código.**
   - Comece colocando `ConexaoFree.jsx` em `src/App.jsx` quase sem alterações, só ajustando imports, para provar que roda igual.
   - Só depois, e se eu aprovar, divida em arquivos menores (por exemplo `src/screens/`, `src/components/`, `src/data/mock.js`). Preserve nomes de componentes e props. Não mude lógica ao dividir.
4. **Ajustes de página.** `index.html` com `lang="pt-BR"`, título "Conexão Free", `meta viewport` com `viewport-fit=cover` e fundo externo neutro. O app deve aparecer como um frame de celular centralizado em telas grandes e ocupar a tela inteira em celulares.
5. **Verificar.** Rode `npm run build` e `npm run dev`. Corrija qualquer erro ou warning de console. Compare com `site/index.html` e liste qualquer diferença que encontrar.
6. **BUG-501 (chat).** Teste enviar a primeira mensagem nos dois chats (chat da vaga e chat direto) no navegador. Se aparecer erro, capture o stack trace real e corrija a causa raiz. Se não aparecer, diga isso explicitamente e mantenha o Error Boundary e os ids estáveis nas mensagens.
7. **Documentação.** Crie um `README.md` com: o que é o projeto, como instalar e rodar (`npm install`, `npm run dev`, `npm run build`), estrutura de pastas e como publicar (Netlify, Vercel ou GitHub Pages).
8. **Git.** Crie `.gitignore` (inclua `node_modules` e `dist`), faça `git init` e commits pequenos e descritivos em português, um por etapa. Não faça push.

## Regras que não podem ser quebradas
- Mantenha todas as regras de negócio do `PROMPT_PROJETO_CONEXAO_FREE.md` (endereço só para candidato aprovado, selfie só por câmera ao vivo, vaga concluída nunca reabre, auto-candidatura bloqueada, exclusão de vaga com candidato ativo bloqueada etc.).
- Modais, toasts e botões flutuantes continuam com `position: absolute` dentro do frame do app, nunca `fixed`.
- Interface toda em português do Brasil, com o nome "Conexão Free".
- Todos os dados continuam mockados e em memória. Deixe claro nos comentários e no README o que seria backend em produção.
- Nunca escreva senhas, tokens ou chaves em arquivos, commits ou mensagens. Se precisar de credencial, peça que eu configure por variável de ambiente.

## Como trabalhar
- Faça uma etapa de cada vez e diga o que testou em cada uma.
- Se algo no protótipo parecer um bug, avise e pergunte antes de mudar o comportamento.
- Ao final, entregue um resumo com: o que foi feito, como rodar, o que ainda está pendente (backend real, decisão React web vs. React Native, backlog da Fase 2) e sugestões de próximos passos.

## Fase 2 (só depois de eu aprovar a fase 1)
Criar uma página inicial institucional simples (landing page) que apresente o Conexão Free para contratantes e prestadores, com explicação em 3 passos, botões "Quero contratar" e "Quero trabalhar" e um botão que abre o app em `/app`. Mesma identidade visual do protótipo (verde esmeralda).
