# Exemplo de prompt — site institucional (somente referência)

> **Não é tarefa do Conexão Free.** Este texto foi enviado como **exemplo de estrutura**
> de prompt/site institucional. Não deve ser construído e não muda nada do que já foi
> combinado para o Conexão Free (nome, regras de negócio, stack em JavaScript,
> identidade verde-esmeralda).
>
> **O que aproveitar como referência para a Fase 2 (landing page do Conexão Free):**
> - Organização por seções (hero, como funciona, chamada para ação, rodapé).
> - Conteúdo de texto centralizado num arquivo de dados (`src/data/`), fácil de trocar.
> - Reveal suave das seções ao rolar (IntersectionObserver, sem biblioteca extra).
> - Transições curtas (200–400 ms, ease-out), navegação discreta, boa acessibilidade
>   (alt em imagens, contraste, navegação por teclado).
> - README curto explicando onde trocar textos e imagens.
>
> **O que NÃO se aplica ao Conexão Free:** TypeScript, shadcn/ui, paleta off-white/terrosa,
> fontes serifadas de portfólio de arquitetura, nome "PROJETO CONECTA"/"ARCH STUDIO",
> rotas de blog/portfólio. A landing do Conexão Free mantém Vite + React (JS), Tailwind,
> lucide-react e o verde-esmeralda do protótipo.

---

## Texto original recebido

Crie um site institucional completo para um estúdio de arquitetura chamado PROJETO CONECTA.

## Conceito visual
Estética minimalista, editorial e sofisticada, inspirada em portfólios de arquitetos contemporâneos. Muito espaço em branco (respiro generoso entre seções), layout assimétrico e elegante, sensação de revista de arquitetura impressa. Nada de cartões genéricos, sombras pesadas ou gradientes coloridos. O luxo está na contenção.

## Stack técnica
- React + Vite + TypeScript
- Tailwind CSS + shadcn/ui
- React Router para todas as rotas
- react-hook-form + zod para o formulário de contato
- Totalmente responsivo (mobile-first, breakpoints cuidadosos)
- Estrutura de pastas limpa: /pages, /components, /components/ui, /lib, /data

## Paleta (definir como tokens no tailwind.config e CSS variables)
- off-white / papel: #F5F3EF
- preto fosco: #1A1A1A
- bege / areia: #D9CFC1
- cinza pedra: #8A8580
- terroso de acento: #6E5C4E
Fundo padrão off-white, texto preto fosco. Usar bege e cinza pedra para divisores, legendas e detalhes. Acento terroso apenas em micro-detalhes (links em hover, pequenos rótulos).

## Tipografia
- Display serifada: Cormorant Garamond (ou Playfair Display) para títulos, hero e números de projeto. Pesos leves a médios, tracking levemente negativo nos títulos grandes, tamanhos generosos.
- Sans-serif para corpo e navegação: Inter (ou similar limpa), peso normal, boa altura de linha, letras de rótulo com tracking aberto e caixa alta em labels pequenos (ex: "01 — RESIDENCIAL").
Carregar via Google Fonts.

## Interações
- Transições suaves (200–400ms, ease-out).
- Imagens com hover sutil: leve zoom (scale 1.03) e/ou dessaturação que ganha cor no hover, sem exageros.
- Navegação fixa no topo, minimalista: logotipo "ARCH STUDIO" em serifada à esquerda, links discretos à direita. Fundo transparente sobre o hero, ganhando fundo off-white sólido ao rolar.
- Reveal sutil de elementos ao entrar na viewport (fade + leve translateY), usando IntersectionObserver ou framer-motion.
- Scroll suave.

## Imagens
Usar placeholders de arquitetura de alta qualidade (ex: Unsplash com URLs de arquitetura/interiores/concreto), preferindo composições em preto e branco ou tons terrosos. Imagens grandes, com proporções variadas (algumas retrato, algumas paisagem) para sustentar o layout assimétrico. Centralizar as URLs num arquivo /data para fácil troca.

## Páginas e rotas
1. **Home (/)**
   - Hero em tela cheia: imagem arquitetônica de alto impacto, nome "ARCH STUDIO" em serifada grande sobreposto, frase curta de posicionamento (ex: "Espaços que respiram. Arquitetura que permanece."), indicador discreto de scroll.
   - Seção de projetos em destaque: 3 a 4 projetos em layout assimétrico (imagens de tamanhos alternados), com número, nome e categoria.
   - Seção de filosofia do estúdio: texto editorial curto em coluna estreita, muito espaço em branco, talvez uma citação em serifada grande.
   - Seção de prêmios / clientes: lista discreta em tipografia pequena, caixa alta, alinhada em grid sóbrio.
   - CTA final para contato: bloco amplo, frase serifada e botão minimalista (link sublinhado ou botão de borda fina).

2. **Sobre (/sobre)**
   - História do estúdio, abordagem, equipe (fotos em P&B), valores. Layout editorial com colunas assimétricas.

3. **Projetos (/projetos)**
   - Portfólio em grid assimétrico/masonry. Filtro discreto por categoria (Residencial, Comercial, Cultural, Interiores). Cada item leva ao detalhe.

4. **Detalhe do Projeto (/projetos/:slug)**
   - Imagem grande de capa, metadados (ano, local, área, categoria, cliente) em coluna lateral, texto descritivo, galeria de imagens grandes em layout vertical com respiro, navegação para o próximo projeto.

5. **Serviços (/servicos)**
   - Lista de serviços (ex: Projeto Arquitetônico, Interiores, Consultoria, Reforma, Paisagismo) com numeração, descrição editorial e divisores finos.

6. **Blog (/blog)**
   - Lista de posts em layout editorial: título serifado, data, categoria, resumo. Sóbrio, sem thumbnails pesados (ou imagem discreta).

7. **Post do Blog (/blog/:slug)**
   - Layout de leitura confortável: coluna estreita, tipografia serifada para título, sans para corpo, imagem de destaque, boa hierarquia.

8. **Contato (/contato)**
   - Formulário funcional (nome, e-mail, assunto, mensagem) com validação via zod + react-hook-form, estados de sucesso/erro e feedback visual. Por enquanto, simular envio (console.log + toast de sucesso), deixando comentado onde plugar uma API real. Incluir também informações de contato (endereço, e-mail, telefone) e redes sociais em tipografia discreta.

## Componentes compartilhados
- Header/Navbar fixo (com comportamento de scroll descrito acima)
- Footer minimalista (logotipo, links de navegação, contato, redes, copyright)
- Componente de seção com reveal animado
- Card de projeto reutilizável
- Dados mockados em /data: projetos (com slug, nome, categoria, ano, local, área, descrição, imagens), posts do blog, serviços, prêmios/clientes.

## Qualidade
- Código TypeScript tipado (interfaces para Projeto, Post, Serviço).
- Acessível (alt em imagens, contraste adequado, navegação por teclado).
- Sem travessões em nenhum texto de interface ou conteúdo.
- README curto explicando como rodar (npm install / npm run dev) e onde trocar as imagens e os dados mockados.

Comece criando a estrutura do projeto, configurando Tailwind com os tokens da paleta e as fontes, depois construa os componentes compartilhados e por fim cada página. Garanta que todas as rotas funcionem e que o resultado seja coeso, elegante e claramente inspirado em portfólios de arquitetura de alto nível.
