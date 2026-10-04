# Conexão Free — Documentação dos passos do projeto

Última atualização: 30/09/2026

## 1. O que é
Protótipo do site/app **Conexão Free**, marketplace de diárias e serviços freelancer (contratantes publicam vagas, profissionais se candidatam, com chat, mapa, avaliações e fluxo de diária).

Site publicado (artefato): https://claude.ai/artifact/8Z3ZjRP7jNsetyCcuZciVa

## 2. Material recebido
- `ConexaoFree.jsx` — protótipo React (~4.000 linhas, componente único `App`, ícones `lucide-react`, estilos Tailwind).
- `03_Documento_Requisitos_ConexaoFree.md` — requisitos, regras de negócio e débitos técnicos (v1.0).

## 3. Passos executados

### Rodada 1 — Transformar o protótipo em site publicável
1. Extração do zip e leitura do documento de requisitos.
2. Diagnóstico do `.jsx`: só dependia de `react` e `lucide-react`; sem CSS externo.
3. Conversão para uma página HTML única e autocontida:
   - Removidos os `import` de módulo.
   - Criado um componente `Icon` (shim) que usa a biblioteca `lucide` via CDN, mantendo os mesmos nomes de ícones do código original.
   - `export default function App()` virou `function App()` (a página roda como script comum, não módulo).
   - Carregamento por CDN: React 18.2.0, ReactDOM 18.2.0, Babel Standalone 7.28.4, lucide 0.525.0, Tailwind (play CDN).
   - Ajustes de tela: safe-area para celular, fundo externo, tema claro/escuro do sistema.
4. Validação de sintaxe do JSX com o compilador TypeScript (sem erros de sintaxe).
5. Publicação como artefato.

### Rodada 2 — Correção de pendências do backlog
| Item | Prioridade | O que foi feito |
|---|---|---|
| RN-201 | Alta | Contratante não pode se candidatar à própria vaga (aviso no lugar do botão) |
| RN-202 | Alta | Exclusão de vaga com candidatura ativa é bloqueada, com aviso |
| RN-105 | Alta | Tela de Login agora valida e-mail (formato) e exige senha |
| RN-406 | Média | Campo de WhatsApp/telefone no formulário de Publicar Vaga |
| RN-207 | Média | Data da vaga virou seletor nativo (`dateISO`), compatível com o filtro do mural |
| BUG-501 | Crítica | Mitigação: Error Boundary global, ids estáveis nas mensagens dos dois chats, try/catch nos envios |

**Sobre o BUG-501:** o erro `i is not a function` não existe literalmente no código-fonte; o nome `i` é típico de variável ofuscada por minificador de build de produção. Nenhum defeito funcional foi achado nos caminhos de envio de mensagem. A causa raiz não foi confirmada: é preciso testar o chat e, se travar, abrir o console do navegador (F12) e capturar o erro real (a versão publicada não é minificada, então o nome virá legível).

### Rodada 3 — Repositório git
1. Criado repositório local com commit inicial (`web/`, `src/`, `docs/`, `README.md`, `.gitignore`).
2. O ambiente de trabalho não tem acesso à internet, então o envio ao GitHub foi feito manualmente pelo site (upload de arquivos).
3. Repositório: https://github.com/projetoconecta401-cell/Projeto-Conecta---Repositorios
4. Problema encontrado: os arquivos foram para dentro de pastas extras (`conexao-free-repo/conecta-free-repo/`). Correção: mover cada arquivo editando o caminho no GitHub, ou apagar e reenviar o conteúdo da pasta (não a pasta).
5. Segurança: um token de acesso pessoal foi colado no chat e precisou ser revogado. Nunca compartilhe tokens em conversas.

## 4. Estrutura deste pacote
```
site/index.html                  Site pronto (abrir no navegador)
codigo-fonte/ConexaoFree.jsx     Componente React com imports de módulo e todas as correções
docs/03_Documento_Requisitos_ConexaoFree.md
originais/projeto_conecta_26_09.zip   Arquivos originais recebidos, sem alterações
DOCUMENTACAO_PASSOS.md           Este arquivo
```

## 5. Como usar
- **Ver o site:** abrir `site/index.html` no navegador (precisa de internet, pois React, Babel, lucide e Tailwind vêm de CDN).
- **Projeto com build de verdade:** criar um projeto Vite + React + Tailwind, instalar `lucide-react` e usar `codigo-fonte/ConexaoFree.jsx` como componente principal.

## 6. Pendências em aberto
- Sem backend: cadastro, verificação de e-mail, upload de documentos, dados bancários são simulados (RN-102-C, RN-109, RN-602/604).
- BUG-501: causa raiz não confirmada (ver seção 3).
- RNF-006: decidir entre manter React web ou migrar para React Native (app nativo).
- Câmera e microfone (selfie e áudio do chat) dependem de permissão do navegador e podem não funcionar dentro do preview do artefato.
- Áudios do chat existem só como URL local (não persistem); posições do mapa são estimadas.
- Reorganizar o repositório no GitHub (arquivos aninhados em pastas extras).

---

## Rodada 4 — Projeto web real (Vite) — 03/10/2026
1. Projeto Vite + React 18 + Tailwind 3 (PostCSS) + lucide-react, com build (`npm run build`).
2. Protótipo migrado sem mudança de lógica e dividido em `src/screens`, `src/components`,
   `src/data/mock.js` e `src/lib` (divisão automatizada e conferida declaração por declaração).
3. Error Boundary do site publicado trazido para `src/AppErrorBoundary.jsx`.
4. Frame de celular no computador e tela cheia no celular (só CSS).
5. BUG-501: não reproduzido nos dois chats (dev e build minificado). Mitigações mantidas.
6. Correções: endereço exato só após o aceite (e fora do HTML antes disso), vaga mock do
   contratante para percorrer aceite → chat, chave PIX com o nome vigente.
7. Fase 2: landing page em `/` e app em `/app/` (duas páginas no Vite, sem redirecionamento
   no servidor). Textos da landing em `src/landing/content.js`.
8. README com guia de instalação, edição e publicação.
