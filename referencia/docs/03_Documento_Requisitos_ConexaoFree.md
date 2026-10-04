# Documento de Requisitos do Software
## Conexão Free — Regras de Negócio e Requisitos Funcionais

**Versão:** 1.0 | **Data:** 13/09/2026

---

## 1. Convenções

- **RN-XXX**: Regra de Negócio
- **RF-XXX**: Requisito Funcional
- **RNF-XXX**: Requisito Não Funcional
- **BUG-XXX**: Defeito identificado, tratado formalmente como regra a garantir

---

## 2. Módulo 1 — Autenticação, Cadastro e Segurança

### Requisitos Funcionais

- **RF-101** — Login via e-mail/senha, levando diretamente ao aplicativo principal (usuário já cadastrado). Os botões de login social (Google, Facebook) atendem tanto entrada quanto cadastro: ao serem clicados, levam à tela de Cadastro com nome, e-mail e foto de perfil pré-preenchidos (simulação de dados importados da plataforma), e-mail já marcado como verificado, e sem exigir criação de senha — o usuário segue apenas para os demais campos obrigatórios (celular, endereço, data de nascimento) e para as etapas de onboarding, documento e verificação de segurança, que continuam obrigatórias independentemente do método de entrada. Distinto do fluxo padrão de "Cadastre-se" por e-mail/senha (RF-102 a RF-109).
- **RF-101-A** — A tela de Login possui a opção "Esqueci minha senha", que leva a uma tela de recuperação com: instrução "Insira seu e-mail para receber as instruções de redefinição de senha", campo de e-mail, botão "Continuar" (envia — de forma simulada — as instruções de redefinição), e, logo abaixo, a opção secundária "Encontrar pelo número do celular". Ao clicar nessa opção secundária, é revelado um campo para digitar o número de celular cadastrado, com seu próprio botão "Continuar". Concluído qualquer um dos dois caminhos, é exibida uma tela de confirmação genérica ("verifique seu e-mail/celular"), com botão para voltar ao login.
- **RF-102** — Cadastro com nome completo, e-mail (com verificação por código — ver RF-102-A), senha + confirmação de senha (ambas com opção mostrar/ocultar), celular (campo simples, sem verificação), foto de perfil (avatar circular com botão de câmera).
- **RF-102-A** — Verificação de e-mail: ao informar um e-mail em formato válido, o usuário aciona "Verificar", que simula o envio de um código de 6 dígitos. O código deve ser digitado e confirmado antes que o campo seja considerado verificado (selo "Verificado" em verde); código incorreto exibe mensagem de erro sem bloquear novas tentativas.
- **RF-102-C** — Confirmação de senha: campo "Confirme sua senha" ao lado do campo "Criar senha"; enquanto os dois valores não forem idênticos, é exibida a mensagem "As senhas não coincidem" e o cadastro não pode ser concluído.
- **RF-103** — Onboarding com escolha de perfil: "Quero Contratar" ou "Quero Trabalhar".
- **RF-104** — Seleção de tipo de documento: CPF (pessoa física) ou CNPJ (empresa).
- **RF-105** — Upload obrigatório de foto do documento (RG/CNH); a selfie de verificação é capturada **ao vivo pela câmera do dispositivo** (acesso via `getUserMedia`), com pré-visualização em tempo real, opção de repetir a captura antes de confirmar, e bloqueio de envio de imagem da galeria para essa etapa.
- **RF-106** — Cadastro de dados bancários (banco, agência, conta) e chave PIX.
- **RF-107** — Minicurrículo opcional: foto, histórico profissional, competências via chips selecionáveis + campo livre para "outras competências".
- **RF-108** — Captura de celular, endereço (rua, número, bairro) e data de nascimento.
- **RF-109** — Aceite de Termos de Uso e Política de Privacidade (LGPD).
- **RF-110** — Exclusão de conta permanente com tela de confirmação por digitação, removendo os dados cadastrais.
- **RF-111** — Alternância de perfil (Contratante ⇄ Prestador) a qualquer momento, a partir da tela de conta.

### Regras de Negócio

- **RN-101** — O aplicativo é destinado exclusivamente a maiores de 18 anos. A idade é calculada a partir da data de nascimento informada; se menor de 18, o botão "Continuar" é bloqueado e uma mensagem de erro é exibida.
- **RN-102** — Upload de documento e selfie é obrigatório para conclusão do cadastro (verificação de identidade).
- **RN-102-A** — A selfie de verificação deve ser obtida exclusivamente por captura ao vivo da câmera do dispositivo no momento do cadastro, nunca por upload de arquivo/galeria, como camada adicional de segurança (prova de vida simplificada). Caso o navegador negue a permissão de câmera ou não a suporte, o cadastro deve exibir uma mensagem de erro clara em vez de travar ou permitir contorno.
- **RN-102-B** — O cadastro só pode ser concluído (botão "Continuar" habilitado) se: e-mail verificado, senha e confirmação de senha idênticas (mínimo 6 caracteres) e data de nascimento válida (18+). O celular é um campo obrigatório de preenchimento, mas não passa por verificação por código. Qualquer item pendente entre os demais bloqueia o avanço.
- **RN-102-C** *(nota de arquitetura — limitação atual do protótipo)* — Como o app não possui backend, a verificação de e-mail é **simulada**: o código de confirmação é gerado no próprio front-end e exibido na tela (rotulado como "simulação de protótipo, sem envio real"), em vez de ser enviado de fato por e-mail. Isso comprova a existência de um endereço em formato válido e testa o fluxo de UX, mas não substitui uma verificação real de titularidade. **Para produção, é obrigatório substituir por um serviço real de envio de e-mail (ex.: SendGrid, SES), com geração de código no backend.**
- **RN-103** — O minicurrículo (histórico, foto, competências) é opcional e não bloqueia o cadastro.
- **RN-104** — A exclusão de conta é irreversível e requer confirmação explícita por digitação, não apenas um clique de confirmação.
- **RN-105** *(gap identificado — a formalizar)* — Os campos de cadastro (e-mail, senha, celular, dados bancários, PIX) devem ter validação de formato antes do envio (ex.: e-mail válido, senha com requisitos mínimos, chave PIX em formato aceito). **Status atual: validação de formulário ausente nas telas de autenticação — tratar como débito técnico prioritário antes da produção.**
- **RN-106** — O nome comercial do aplicativo é **Conexão Free** (histórico: "ConectaGig" → "ConectaFree" → "Conexão Free"). Todas as menções textuais ao nome do produto na interface (login, onboarding, termos de uso/LGPD, validação de idade, header do feed, banner patrocinado, mensagens de contato) devem estar sincronizadas com o nome vigente; qualquer renomeação futura deve ser propagada de forma consistente por todo o app, não apenas nas telas de maior visibilidade.
- **RN-107** *(bug de fluxo corrigido)* — "Entrar" (login por e-mail/senha) pressupõe que o usuário já possui cadastro completo e deve levá-lo direto ao aplicativo principal. Apenas os caminhos "Cadastre-se" e login social (Google/Facebook) devem passar pelo fluxo completo de onboarding (escolha de perfil → documento → verificação de segurança → minicurrículo → termos) — nenhum usuário, independentemente do método de entrada, pode pular a verificação de identidade (KYC) exigida pela plataforma. **Status anterior (corrigido):** o botão de login estava incorretamente configurado para reiniciar todo o fluxo de cadastro a cada vez, como se o usuário fosse sempre novo; em seguida, os botões de Google/Facebook foram corrigidos de um segundo problema — antes levavam direto ao aplicativo (pulando toda a verificação de identidade), o que é uma falha de regra de negócio para uma plataforma que exige documento e selfie de todo prestador/contratante, independentemente do método de cadastro.
- **RN-110** — O botão "Continuar" da tela de Cadastro permanece desabilitado enquanto houver pendências (nome, e-mail verificado, senha+confirmação quando aplicável, data de nascimento válida); a lista de pendências restantes é exibida visivelmente abaixo do botão, evitando a percepção de que o botão "não funciona" quando, na verdade, requisitos obrigatórios ainda não foram cumpridos.
- **RN-108** — A recuperação de senha aceita e-mail **ou** número de celular (não ambos simultaneamente) como identificador da conta; a mensagem de confirmação exibida ao final é sempre genérica ("se houver uma conta associada a esse e-mail/número, enviamos as instruções"), independentemente de o e-mail/celular estar de fato cadastrado — prática recomendada de segurança para não revelar quais contas existem na base.
- **RN-109** *(nota de arquitetura — limitação atual do protótipo)* — O envio das instruções de redefinição de senha é **simulado**: nenhuma mensagem real é enviada por e-mail ou SMS; a tela apenas avança para a confirmação. **Para produção, é obrigatório integrar um serviço real de envio (e-mail transacional e/ou SMS) e um mecanismo de geração de link/token de redefinição com expiração, no backend.**

---

## 3. Módulo 2 — Feed, Categorias e Gestão de Publicação

### Requisitos Funcionais

- **RF-201** — Três abas principais: "Mural de Vagas", "Minhas Vagas Criadas" (somente contratante) e "Profissionais Disponíveis".
- **RF-202** — Botão "Publicar Vaga" fixo/flutuante (canto inferior direito), visível apenas para contratantes, abrindo modal com: título, categoria, valor da diária, data/horário, bairro/região, cidade, estado. Modal possui botão de voltar (seta) além do fechar (X), e "Cancelar" ao lado de "Confirmar e Publicar". **Correção de usabilidade:** havia uma segunda cópia do botão fixa no cabeçalho (visível apenas em telas maiores), duplicando a ação; foi removida para deixar um único ponto de entrada, mais previsível.
- **RF-203** — Carrossel "Serviços por área": categorias (Todas, Gastronomia, Eventos, Design/Digital, Estética, Manutenção/Obras, Serviços Gerais), navegável por arraste e por setas laterais (◀ ▶) para evitar sobreposição de texto entre itens.
- **RF-204** — Clique em uma categoria filtra o mural; cabeçalho de contexto exibe "Vagas em [Categoria] · N" com botão "Limpar".
- **RF-205** — Estado vazio: mensagem + atalho "Ver todas as vagas" quando não há resultados no filtro.
- **RF-206** — Painel de filtros (bottom sheet) com: cidade, estado (27 UFs), valor mínimo da diária, data do serviço (seletor de data nativo), período do dia (Manhã/Tarde/Noite), distância máxima (5/10/20 km) — todos exibidos como chips removíveis individualmente, com contador no botão "Filtros" e opção "Limpar filtros". A data selecionada é exibida no chip em formato brasileiro (dd/mm/aaaa) e pode ser limpa tanto pelo chip quanto por um link "Limpar data" dentro do próprio painel.
- **RF-207** — Card de vaga exibe: categoria, tag de experiência necessária ("Sem experiência" / "Com experiência mínima"), título, contratante + selo de verificado, data/horário, bairro + distância, valor da diária, status, badge de candidatura do usuário ("Candidatado"/"Em análise", quando aplicável), número de candidatos inscritos, ícone de favoritar/salvar (não navega ao card ao ser clicado) e botão "Ver Oportunidade".
- **RF-208** — Painel "Minhas Vagas Criadas": lista as vagas publicadas pelo próprio contratante, cada uma com opções "Gerenciar" e "Excluir".
- **RF-209** — Sino de notificações no topo do mural, com indicador de não lidas; ao clicar, abre a aba de Alertas e marca tudo como lido.
- **RF-210** — Layout em grid responsivo (1 coluna mobile, 2–3 colunas em telas maiores), com `flex flex-col justify-between h-full` nos cards para alinhar rodapé (valor + botão) independentemente do tamanho do conteúdo.
- **RF-211** — O avatar do usuário, no canto superior direito do Mural de Vagas, é clicável e abre um menu suspenso (dropdown) posicionado logo abaixo, com exatamente duas opções: "Ver meu perfil" (leva à tela "Minha Conta") e "Sair do perfil" (encerra a sessão). O avatar mostra a inicial do nome cadastrado (ou ícone de prédio no modo Contratar — ver RF-215). O menu abre/fecha com transição suave (opacidade + escala) e fecha automaticamente ao clicar fora dele. A opção "Sair do perfil" tem destaque visual diferenciado (texto vermelho + ícone de saída) por ser uma ação de encerramento de sessão.
- **RF-212** — Nova aba "Favoritas" no cabeçalho da página inicial (visível apenas no modo "Trabalhar"), listando todas as vagas marcadas com o ícone de favoritar/salvar, no mesmo layout de card usado no Mural de Vagas. Estado vazio orienta o usuário a tocar no ícone de marcador em um card para salvá-lo ali.

### Regras de Negócio

- **RN-201** *(gap identificado — a formalizar como regra obrigatória)* — Um contratante não deve conseguir se candidatar à própria vaga publicada. **Status atual: essa validação não está implementada; deve ser adicionada antes da produção.**
- **RN-202** — Exclusão de uma vaga pelo contratante deve tratar candidatos ativos vinculados a ela (notificação e/ou impedimento de exclusão enquanto houver candidatura em andamento), evitando "candidatos órfãos". **Status atual: exclusão de vaga não trata esse cenário — débito técnico a formalizar.**
- **RN-203** — O banner publicitário foi removido do mural por decisão de produto; a seção de categorias ("Serviços por área") passou a ocupar a posição de destaque na tela inicial do feed.
- **RN-204** — O escopo do mural é nacional por padrão (sem cidade fixa); cidade/estado só aparecem no cabeçalho quando o usuário aplica um filtro.
- **RN-207** *(gap identificado — a formalizar)* — O filtro de data compara a data selecionada com um campo interno padronizado (`dateISO`) presente nas vagas de exemplo (mock). O formulário "Publicar Vaga" (Módulo 2) ainda captura a data como texto livre ("Data e horário"), sem um seletor de data nativo — por isso, vagas publicadas pelo próprio usuário atualmente **não aparecem** ao aplicar o filtro de data, mesmo que a data informada coincida. **Recomenda-se, antes da produção, trocar o campo de texto livre por um seletor de data no formulário de publicação**, gravando o mesmo padrão `dateISO` usado pelo filtro.
- **RN-205** — "Sair do perfil"/"Sair da conta" deve encerrar a sessão do usuário e retorná-lo à tela de Login, sem apagar nenhum dado cadastral (ação não destrutiva, distinta de "Excluir conta permanentemente"). **Status anterior (corrigido):** o botão "Sair da conta" existente na tela "Minha Conta" não possuía nenhuma ação associada (clique sem efeito); foi corrigido nesta revisão para usar a mesma rotina de logout do novo menu do avatar (RF-211), garantindo comportamento consistente nos dois pontos de saída do app.

---

## 4. Módulo 3 — Geolocalização e Notificações

### Requisitos Funcionais

- **RF-301** — Mapa interativo exibindo pontos (pins) somente das vagas abertas (status "Disponível" ou "Em Negociação") cuja distância é menor ou igual ao raio de busca selecionado. Cada pin é clicável e leva ao detalhe da vaga correspondente.
- **RF-302** — Controle de raio de busca ajustável por barra deslizante (slider) de 1 km até 150 km, com valor atual exibido em destaque e representação visual proporcional do raio sobre o mapa. Ao mover o slider, os pins e a lista de vagas (RF-306) são recalculados imediatamente.
- **RF-307** — Botão "Usar minha localização atual" no Mapa de Oportunidades, que solicita a localização do navegador (`navigator.geolocation`) e, quando concedida, recalcula a distância real (fórmula de Haversine) entre o usuário e cada vaga com coordenadas cadastradas, substituindo a distância simulada nos filtros, pins e lista. Exibe estado de carregamento ("Obtendo localização..."), confirmação ("Localização atual em uso") e mensagem de erro clara caso a permissão seja negada ou o navegador não suporte geolocalização.
- **RF-303** — Simulação de alerta push (toast) para novas vagas urgentes dentro do raio configurado.
- **RF-304** — Notificação ao contratante quando um prestador se candidata; notificação ao prestador quando o contratante aceita a candidatura.
- **RF-305** — Histórico/central de notificações de status.
- **RF-306** — Abaixo do mapa, uma lista das vagas dentro do raio selecionado (ordenada da mais próxima para a mais distante), cada item mostrando título, bairro/cidade/estado, distância e valor da diária; clicar em um item também leva ao detalhe da vaga. O texto acima da lista informa a contagem atual ("N vagas abertas dentro de X km").

### Regras de Negócio

- **RN-301** — O raio de busca é configurável pelo próprio usuário e afeta quais alertas de vagas urgentes ele recebe, além de filtrar diretamente quais vagas aparecem no mapa e na lista abaixo dele (RF-301/RF-306).
- **RN-302** *(nota de arquitetura)* — Toda a geolocalização atual é simulada (mock); a implementação real exigirá permissão de GPS do navegador ou do sistema operacional (relevante para a decisão React vs. React Native).
- **RN-303** *(atualizado)* — Quando o usuário concede a localização (RF-307), a distância exibida é real, calculada por Haversine entre as coordenadas do dispositivo e as coordenadas cadastradas em cada vaga (adicionadas aos dados mock desta revisão). Sem a permissão concedida, o app usa a distância simulada (`distanceKm`) como antes. Em ambos os casos, o mapa em si permanece decorativo (grade de fundo, sem base cartográfica real) — a posição visual dos pins é estimada a partir da distância e do id da vaga, não de projeção geográfica real. **Para produção, é necessário integrar um provedor de mapas real (ex.: Google Maps, Mapbox) para exibir a posição real tanto do usuário quanto das vagas.**

---

## 5. Módulo 4 — Ciclo de Vida da Vaga e Candidatura

### Requisitos Funcionais

- **RF-401** — Tela de detalhe da vaga com botão "Candidatar-se à Vaga".
- **RF-402** — Endereço da vaga exibido de forma parcial (apenas bairro) até a aprovação do candidato.
- **RF-403** — Ao aceitar um candidato, o status muda automaticamente para "Em Atendimento", notificação é enviada, e a vaga é ocultada do mural público.
- **RF-404** — Em caso de cancelamento (por qualquer uma das partes) antes da execução, a vaga retorna automaticamente para o status "Disponível" no mural público ("Reabrir Vaga").
- **RF-405** — Aba "Minha Agenda" organiza compromissos em "Confirmados" e "Pendentes".
- **RF-406** — A tela de detalhe da vaga exibe um botão "Falar com [contratante] no WhatsApp", visível quando há telefone de contato cadastrado para a vaga. O botão abre uma conversa no WhatsApp (link `wa.me`) com o número do contratante e uma mensagem pré-preenchida referenciando o título da vaga, em nova aba/janela do navegador.

### Regras de Negócio

- **RN-401** — O endereço exato só é liberado para o candidato aprovado, nunca publicamente. Esta é uma regra de privacidade obrigatória, não uma preferência de exibição.
- **RN-402** — A transição de status da vaga é automática e não deve depender de ação manual adicional do contratante além de "Aceitar Candidato" ou "Cancelar".
- **RN-403** *(gap identificado — bug de integridade a corrigir)* — Uma vaga marcada como "Concluída" não deve reverter para o status "Disponível" em nenhuma circunstância. Esse comportamento incorreto foi identificado em revisão de código e deve ser tratado como regra formal de integridade de dados.
- **RN-404** — Reabertura da vaga (RF-404) deve ocorrer apenas quando o cancelamento acontece antes da conclusão do serviço.
- **RN-405** — O botão de contato via WhatsApp (RF-406) exibe o telefone comercial do contratante vinculado à vaga, não seu endereço; portanto não conflita com a regra de sigilo de endereço (RN-401). O botão é exibido independentemente do status da vaga, permitindo que o prestador esclareça dúvidas antes mesmo de se candidatar.
- **RN-406** *(gap identificado — a formalizar)* — Vagas publicadas pelo próprio usuário (Módulo 2 → "Publicar Vaga") atualmente não coletam um telefone de contato; nesses casos o botão de WhatsApp não é exibido. Recomenda-se incluir um campo de telefone/WhatsApp no formulário de publicação de vaga para que esse recurso funcione também para vagas criadas dentro do próprio app, não apenas para os dados mock pré-carregados.

---

## 6. Módulo 5 — Chat, Pagamento e Reputação

### Requisitos Funcionais

- **RF-501** — Chat liberado somente após o aceite da candidatura, vinculado à vaga.
- **RF-502** — Atalho no chat para compartilhamento seguro da chave PIX cadastrada.
- **RF-503** — Botão "Concluir Serviço" finaliza a diária e libera a tela de avaliação.
- **RF-504** — Botão "Desistir/Cancelar Negociação" aciona a reabertura automática da vaga (RF-404).
- **RF-505** — Avaliação bidirecional (1 a 5 estrelas) com comentários, exibida no perfil do avaliado.
- **RF-506** — Envio de mensagem funciona de forma idêntica via clique no botão de enviar e via tecla Enter (mesma chamada de função, sem argumentos divergentes).
- **RF-507** — O campo de digitação do chat (tanto o chat vinculado à vaga quanto o chat direto) possui um botão de emoji que abre um painel com emojis de uso comum; ao selecionar um emoji, ele é inserido no texto da mensagem, podendo o usuário selecionar mais de um antes de enviar. O painel fecha automaticamente ao clicar fora dele.
- **RF-508** — O campo de digitação do chat possui um botão de microfone que inicia a gravação de áudio ao vivo (acesso real ao microfone do dispositivo via `getUserMedia`/`MediaRecorder`). Durante a gravação, o botão é substituído por um indicador com cronômetro e um botão de parar; ao parar, o áudio gravado é enviado automaticamente como uma mensagem de voz reproduzível na conversa (com botão de play/pause, barra de progresso e duração). Caso o navegador negue a permissão de microfone ou não a suporte, é exibida uma mensagem de erro clara.

### Regras de Negócio

- **RN-501** — O chat de uma vaga só existe/é acessível após o aceite formal da candidatura.
- **RN-502** — Cancelar a negociação no chat deve, obrigatoriamente, disparar a reabertura da vaga (integração RN-404).
- **RN-503** — A avaliação é bidirecional: tanto contratante quanto prestador avaliam um ao outro ao final do serviço.

### Defeito Conhecido

- **BUG-501** — Erro `i is not a function` ao clicar no botão de enviar mensagem, reproduzido de forma determinística pelo usuário (computador/navegador), na primeira mensagem de qualquer chat, mesmo após recarregamento da página. Investigação indicou origem na fase de "commit" do React, relacionada à transição de estado entre lista de mensagens vazia e lista preenchida (rolagem automática / troca condicional de elemento). Duas correções aplicadas sem resolução confirmada:
  1. Padronização do handler para `onClick={() => handleSendClick()}` em ambos os chats;
  2. Renomeação da função `send` para `handleSendClick` (eliminar possível colisão de nome).
  **Próximo passo formal:** obter o stack trace completo do console do navegador (F12 → Console) no momento exato do erro, para identificar a linha/componente exato e aplicar correção definitiva. Este item permanece **aberto** e deve ser tratado com prioridade alta antes de qualquer entrega para usuários finais.

---

## 7. Funcionalidades Transversais (Perfil de Profissional e Mensageria Direta)

### Requisitos Funcionais

- **RF-601** — Cards em "Profissionais Disponíveis" são clicáveis e levam a uma página de perfil completa.
- **RF-602** — Perfil do profissional exibe: nome, informações básicas, nota média calculada a partir do histórico, competências (chips), bio, e histórico de diárias realizadas (contratante, data e nota por serviço).
- **RF-603** — Botão "Enviar mensagem" no perfil: se já existe conversa com aquele profissional, abre a conversa existente; caso contrário, cria uma nova.
- **RF-604** — Aba "Chat" na navegação inferior, entre Mapa e Agenda, com indicador (bolinha verde + número) de conversas com mensagens não lidas.
- **RF-605** — Lista de conversas exibe: avatar, nome, prévia da última mensagem, tempo relativo, destaque visual para não lidas.
- **RF-606** — Ao abrir uma conversa pela lista, ela é marcada como lida automaticamente.
- **RF-607** — O chat direto (mensageria) é uma funcionalidade independente do chat vinculado à vaga (Módulo 5); ambos coexistem sem conflito.
- **RF-608** — A tela "Minha Conta" possui um item "Histórico de trabalho" que leva a uma tela dedicada listando todos os serviços que o próprio usuário já realizou como prestador, com título do serviço, contratante, data e nota recebida em cada um, além de um resumo com o total de serviços e a nota média. Segue o mesmo padrão visual já usado no histórico exibido no perfil público de outros profissionais.
- **RF-609** — Os botões de emoji e de gravação de áudio (RF-507 e RF-508) estão disponíveis igualmente no chat direto (mensageria) e no chat vinculado à vaga, com o mesmo comportamento e componentes visuais em ambos.

### Regras de Negócio

- **RN-601** — Não deve ser criada mais de uma conversa direta entre o mesmo par de usuários (prevenção de duplicidade); a lógica de "abrir existente vs. criar nova" (RF-603) é obrigatória.
- **RN-602** — Dados de conversas e contadores de não lidas existem apenas em memória de sessão no protótipo atual — não há persistência entre recarregamentos de página. Esta é uma limitação conhecida do estágio atual, não um requisito final de produto.
- **RN-603** *(gap identificado — a formalizar)* — O "Histórico de trabalho" da Minha Conta atualmente exibe uma lista mock fixa, não conectada dinamicamente aos serviços que o usuário efetivamente concluiu através do fluxo real do app (Módulo 5 → "Concluir Serviço"). **Para produção, cada conclusão de serviço deve gravar automaticamente um registro nesse histórico**, da mesma forma que a avaliação recebida deve refletir a nota dada pelo contratante ao final daquele serviço específico.
- **RN-604** *(nota de arquitetura — limitação atual do protótipo)* — As mensagens de áudio gravadas (RF-508) são armazenadas apenas como URLs de objeto locais ao navegador (`URL.createObjectURL`), válidas somente durante a sessão atual; ao recarregar a página, os áudios enviados deixam de estar disponíveis, assim como o restante do histórico de conversas (já coberto por RN-602). **Para produção, é obrigatório fazer upload do áudio gravado para armazenamento persistente (ex.: S3, Cloud Storage) e referenciar a URL definitiva na mensagem salva no backend.**

---

## 8. Requisitos Não Funcionais

- **RNF-001** — A interface deve ser mobile-first e responsiva, funcionando corretamente dentro do frame de smartphone e em telas maiores (grid adaptativo).
- **RNF-002** — Nenhuma nova funcionalidade deve remover ou quebrar funcionalidades existentes (regra de trabalho estabelecida ao longo de todo o desenvolvimento).
- **RNF-003** — O aplicativo deve estar em conformidade com a LGPD (Lei Geral de Proteção de Dados), especialmente quanto a dados sensíveis (documento, selfie, dados bancários).
- **RNF-004** — Cards e listas devem usar técnicas de contenção de texto (`break-words`, `truncate`, `leading-snug`) para impedir sobreposição visual em conteúdo longo (título, endereço, data).
- **RNF-005** — Toda alteração de escopo geográfico, nome do produto ou paleta de cores deve ser propagada de forma consistente por todas as telas — evitando referências residuais (ex.: menções fixas a "Ji-Paraná" após a expansão nacional).
- **RNF-006** *(pendência arquitetural)* — Definir, antes da fase de produção, se a base tecnológica será mantida em React web ou migrada para React Native, dado o requisito declarado de disponibilização multiplataforma.

---

## 9. Rastreabilidade de Débitos Técnicos (Resumo)

| ID | Descrição | Módulo | Prioridade |
|---|---|---|---|
| RN-105 | Falta de validação de formulário no cadastro/login | 1 | Alta |
| RN-201 | Contratante pode se candidatar à própria vaga | 2 | Alta |
| RN-202 | Exclusão de vaga não trata candidatos ativos | 2 | Alta |
| RN-403 | Vaga concluída pode reverter para "Disponível" | 4 | Corrigido nesta revisão |
| BUG-501 | Erro ao enviar mensagem no chat | 5 | Crítica (aberto) |
| RNF-006 | Decisão de arquitetura React vs. React Native | Transversal | Alta |
| RN-406 | Formulário de publicar vaga não coleta telefone/WhatsApp do contratante | 2 | Média |
| RN-205 | Botão "Sair da conta" sem ação associada | 1 | Corrigido nesta revisão |
| RN-102-C | Verificação de e-mail é simulada no front-end (sem envio real) | 1 | Alta (antes da produção) |
| RN-603 | Histórico de trabalho da Minha Conta é mock, não gravado a partir de serviços concluídos de verdade | Transversal | Média |
| RN-107 | Login social (Google/Facebook) pulava toda a verificação de identidade (KYC) | 1 | Corrigido nesta revisão |
| RN-110 | Botão "Continuar" do Cadastro sem feedback de pendências (parecia não funcionar) | 1 | Corrigido nesta revisão |
| RN-604 | Áudios do chat existem só como URL de objeto local (não persistem entre sessões) | 5 | Média (antes da produção) |
| RN-207 | Filtro de data não funciona para vagas publicadas manualmente (campo é texto livre) | 2 | Média |
| RN-710 | Última aba de "Minhas Candidaturas" ficava escondida na rolagem horizontal | Transversal | Corrigido nesta revisão |
| — | Pins do mapa eram fixos/decorativos, sem relação com o raio selecionado | 3 | Corrigido nesta revisão |
| RN-303 | Posição dos pins no mapa é estimada (sem coordenadas geográficas reais) | 3 | Média (antes da produção) |
| BUG-601 | Toast, modais e botão flutuante usavam `fixed` e escapavam do frame do app | Transversal | Corrigido nesta revisão |
| RN-711 | Abas da página inicial só rolavam por toque, não por arraste do mouse | 2 | Corrigido nesta revisão |
| RN-712 | Diferenciação "modo Empresa" é só visual/textual, sem dashboard próprio | Transversal | Backlog Fase 2 (item 21) |
| RN-713 | Edição de perfil não reflete em "Você" na lista de Profissionais Disponíveis | Transversal | Média |
| RN-714 | Cadastro inicial e Editar Perfil não compartilham dados entre si | 1 | Baixa (natureza do protótipo) |
| — | Botão "Publicar Vaga" duplicado (topo do header + flutuante) | 2 | Corrigido nesta revisão |

---

## 10. Evolução — Fluxo Completo de Candidatura e Diária

Esta seção documenta a transformação do ConexãoFree de um fluxo simples de candidatura/aceite (Módulo 4 original) para um rastreador completo de ciclo de vida da diária, inspirado conceitualmente em plataformas como GetNinjas, Workana e Indeed, mas com identidade e regras próprias do Conexão Free.

### 10.1 Modelo de Status

Cada vaga com um candidato passa a ter, além do `status` público existente (Disponível / Em Negociação / Em Atendimento / Concluída), um campo interno `applicationStatus` com o histórico granular da candidatura de "Você":

- **RF-701** — Status suportados: Em análise, Candidatura oficializada, Diária agendada, Em andamento, Diária concluída, Finalizada, Cancelada. Os status "Pré-selecionado", "Aguardando confirmação", "Candidatura recusada" e "Candidatura retirada pelo profissional" fazem parte do modelo de dados e da paleta visual (`ApplicationStatusPill`), mas neste estágio do protótipo o caminho automático testável cobre: Em análise → Candidatura oficializada → Diária agendada → Em andamento → Diária concluída → Finalizada, além do desvio para Cancelada a qualquer momento antes da conclusão.
- **RN-701** *(simplificação de protótipo, a formalizar)* — Como o app modela um único candidato por vaga (não uma lista de candidatos concorrendo), os status "Pré-selecionado" e "Aguardando confirmação" não têm, hoje, uma tela de gestão de múltiplos candidatos que os utilize. **Para produção, com suporte a múltiplos candidatos por vaga, esses status passam a ser acionáveis pela empresa antes da oficialização.**

### 10.2 Candidatura Oficializada

- **RF-702** — Ao aceitar um candidato, a empresa passa a vaga para "Em Atendimento" com `applicationStatus: "Candidatura oficializada"`, e o profissional é levado automaticamente à tela "Candidatura Oficializada" (🎉), exibindo: empresa, cargo/função, data, horário, local (bairro), valor da diária, forma de pagamento, observações da empresa e responsável, além de um indicador de status ("Aguardando sua confirmação" / "Diária confirmada ✅").
- **RF-703** — O botão "Confirmar participação" muda `applicationStatus` para "Diária agendada" e notifica (toast + central de notificações) tanto o "recebimento" simulado da confirmação. Após confirmar, o botão desaparece e o indicador muda para "Diária confirmada ✅".
- **RN-702** — A tela de Candidatura Oficializada deriva o estado "confirmado" diretamente do `applicationStatus` da vaga (não de um estado local otimista), para nunca exibir "confirmada" caso a confirmação seja bloqueada por conflito de horário (RN-704).

### 10.3 Minhas Candidaturas e Minhas Diárias

- **RF-704** — Nova área "Minhas candidaturas", acessível a partir de "Minha Conta", com um filtro em formato de dropdown ("Todas ▾", expansível para Em análise / Confirmadas / Em andamento / Concluídas / Recusadas), listando todas as vagas em que "Você" é candidato, cada uma como um card compacto (`ApplicationCard`) com título, empresa, status colorido, data, horário, bairro e valor.
- **RN-710** *(correção de usabilidade)* — O filtro de "Minhas Candidaturas" era originalmente uma fileira de abas com rolagem horizontal, o que deixava a última opção ("Recusadas") escondida fora da área visível sem indicação clara de que havia mais opções. Foi substituído por um filtro em dropdown (`FilterDropdown`): um botão mostrando a opção atual ("Todas") com uma seta, que ao ser clicado abre um menu com todas as opções disponíveis, incluindo a que estava escondida — mesmo padrão de menu suspenso (abre/fecha com transição, fecha ao clicar fora) já estabelecido pelo `UserAvatarMenu`.
- **RF-705** — Nova área "Minhas diárias", também acessível a partir de "Minha Conta", destacando a próxima diária confirmada/em andamento em um card ampliado com botão "Ver detalhes", seguido da lista completa de diárias agendadas.
- **RN-703** — Ambas as áreas foram posicionadas como itens de lista dentro de "Minha Conta" (reaproveitando o padrão visual já existente de itens de menu com ícone + chevron), em vez de novas abas na navegação inferior, para não sobrecarregar a barra de 6 ícones já estabelecida.

### 10.4 Check-in / Check-out

- **RF-706** — Quando a diária está "Diária agendada", o detalhe da vaga exibe o botão "Fazer check-in", que registra a data/hora atual (`checkInAt`) e muda o `applicationStatus` para "Em andamento".
- **RF-707** — Quando "Em andamento", o botão passa a ser "Fazer check-out / Finalizar diária", que registra `checkOutAt`, muda o status para "Diária concluída", dispara uma notificação ("🔔 Diária concluída — avalie sua experiência") e leva automaticamente à tela de avaliação.
- **RF-708** — Os horários de check-in e check-out ficam visíveis permanentemente no detalhe da vaga, mesmo após a conclusão, como registro histórico.
- **RN-704** *(nova regra)* — Ao confirmar participação (RF-703), o sistema verifica se "Você" já possui outra diária com `applicationStatus` "Diária agendada" ou "Em andamento" na mesma data (`dateISO`); havendo conflito, a confirmação é bloqueada e uma notificação "Conflito de horário — Você já possui uma diária confirmada neste dia" é exibida.
- **RN-705** *(nota de arquitetura — limitação atual do protótipo)* — O check-in registra apenas o horário do dispositivo do profissional (localização "aproximada" mencionada no pedido original não foi implementada, pois exigiria geolocalização real do navegador). **Para produção, recomenda-se capturar coordenadas via `navigator.geolocation` no momento do check-in/check-out**, e permitir que a empresa também confirme a presença pelo seu lado.

### 10.5 Cancelamento com Motivo

- **RF-709** — O cancelamento de uma negociação/diária confirmada (tanto pelo botão no detalhe da vaga quanto pelo botão "Cancelar" dentro do chat) abre um modal de confirmação (`CancelReasonModal`) com aviso claro ("Você está cancelando uma diária confirmada. Tem certeza?") e um campo de texto opcional para o motivo do cancelamento.
- **RN-706** — O motivo informado é salvo no campo `cancelReason` da vaga, junto com `cancelledBy` ("profissional" ou "empresa"), compondo um histórico de cancelamentos por vaga. A vaga volta ao status "Disponível" no mural público após o cancelamento.
- **RN-707** *(gap identificado — a formalizar)* — O histórico de cancelamentos (RN-706) é armazenado por vaga, mas ainda não é agregado em um indicador de confiabilidade por usuário (ex.: "taxa de cancelamento"). **Recomenda-se, para produção, consolidar esse dado no perfil do profissional/empresa**, conforme mencionado no item 16/17 do backlog (Seção 11).

### 10.6 Avaliação com Critérios e Resumo Pós-Diária

- **RF-710** — Após o check-out, a tela de avaliação (`RatingScreen`) pede: nota geral (1-5 estrelas), notas por critério (Organização, Comunicação, Respeito, Cumprimento do combinado, Ambiente de trabalho, Pontualidade no pagamento — via `CriteriaStars`), a pergunta "Você trabalharia novamente com esta empresa?" (Sim/Talvez/Não) e um comentário opcional.
- **RF-711** — Ao enviar, a vaga recebe `status: "Concluída"` (definitivo, nunca reabre — corrige BUG/RN-403 antigo) e `applicationStatus: "Finalizada"`, com todos os dados da avaliação salvos no campo `rating` da vaga.
- **RF-712** — Em seguida, é exibida a tela "Diária concluída! 🎉" (`PostJobSummaryScreen`) com estatísticas agregadas calculadas a partir de todas as vagas concluídas por "Você": número de diárias realizadas, total recebido (soma de `value`) e nota média das avaliações dadas.
- **RN-708** *(simplificação de protótipo, a formalizar)* — A avaliação bilateral (empresa avalia o profissional) descrita no pedido original não tem, neste estágio, uma sessão/visão da empresa dentro do mesmo app para ser exercida de forma independente — o app modela a experiência do lado do profissional. **Para produção, a avaliação da empresa sobre o profissional deve ser implementada como um fluxo simétrico no lado "Contratar"**, com a regra de só publicar as duas notas quando ambos os lados avaliarem (ou o prazo expirar), exatamente como descrito no pedido original.

### 10.7 Chat Vinculado à Vaga

- **RF-713** — O chat da vaga (Módulo 5) agora exibe, logo abaixo do cabeçalho, um cartão de contexto fixo com título da vaga + empresa, data/horário, valor da diária e o `ApplicationStatusPill` atual — para que o usuário nunca perca de vista a qual diária aquela conversa se refere, especialmente tendo várias conversas na aba "Chat".

### 10.8 Reputação da Empresa (versão inicial)

- **RF-714** — O detalhe da vaga agora exibe, ao lado do nome do contratante verificado, a nota média da empresa e o número de avaliações (ex.: "★ 4,8 (32)"), quando esses dados existem na vaga.
- **RN-709** *(simplificação de protótipo, a formalizar)* — Atualmente todas as empresas do mock recebem a mesma nota base (4,8) com contagem variando por vaga, apenas para exercitar a exibição visual — não há ainda um perfil de empresa dedicado nem indicadores por critério (Comunicação, Organização, Respeito, Pontualidade, Pagamento) como descrito no pedido original. Esse é o item mais visível do backlog de Fase 2 (Seção 11, item 9).

---

## 11. Backlog Priorizado — Fase 2 (Solicitado, Ainda Não Implementado)

A solicitação de evolução do Conexão Free trouxe 28 blocos de funcionalidades. As Seções 10.1 a 10.8 cobrem o fluxo principal conectado (candidatura → oficialização → confirmação → check-in/out → conclusão → avaliação → histórico), que era o núcleo mais crítico do pedido (itens 1 a 8, 13 parcial, 14, 19, 22, 23, 24). Os itens abaixo foram analisados, fazem sentido para o produto, mas **ainda não foram implementados** — ficam registrados aqui como backlog priorizado, para não se perderem:

| # | Funcionalidade solicitada | Observação de escopo |
|---|---|---|
| 9 | Reputação completa da empresa (indicadores por critério, "empresa verificada", profissionais que já trabalharam com ela) | Hoje só existe a nota agregada (RF-714); requer um perfil de empresa dedicado |
| 10 | Histórico de relacionamento profissional↔empresa ("você já trabalhou com esta empresa", total recebido, "trabalhar novamente") | Depende de um perfil de empresa (item 9) para ter onde ser exibido |
| 11 | Favoritos de empresas (pelo profissional) e de profissionais (pela empresa) | Já existe favoritar **vaga** (Módulo 2); favoritar **empresa/profissional** como entidade é um recurso novo |
| 12 | Convite direto da empresa para uma diária ("Você foi convidado!" com Aceitar/Recusar) | Fluxo inverso ao de candidatura; requer tela de convite dedicada |
| 15 | Filtros adicionais: urgente, empresa verificada, avaliação da empresa, forma de pagamento, "vagas compatíveis com meu perfil" | Complementa o painel de filtros já existente (cidade/estado/valor/data/período/distância) |
| 16 | Perfil do profissional como mini currículo completo (portfólio, certificados, indicador "perfil X% completo") | O perfil hoje cobre histórico e notas; faltam portfólio/certificados/indicador de completude |
| 17 | Perfil completo da empresa (descrição, fotos do estabelecimento, tempo na plataforma, últimas vagas publicadas) | Perfil de empresa ainda não existe como tela própria |
| 18 | Selos de confiança adicionais (telefone verificado, documentos verificados como badge público) e botão "Denunciar" | Documento/selfie já são coletados no cadastro (Módulo 1), mas não viram selo público no perfil; "Denunciar" é novo |
| 20 | Área de acompanhamento financeiro (pagamento pendente/confirmado, histórico financeiro agregado) | Hoje o PIX é só um atalho de compartilhamento no chat, sem status de pagamento |
| 21 | Dashboard da empresa no modo "Contratar" (candidaturas pendentes, diárias confirmadas, favoritos) | O modo Contratar hoje usa o mesmo mural/gestão de vagas; um painel agregado é um recurso novo |

Recomenda-se tratar este backlog em uma próxima rodada, priorizando os itens 9 e 17 (perfil de empresa) por serem pré-requisito de vários outros (10, 11 parcial, 18).

---

## 12. Correções Estruturais e Novas Funcionalidades (Rodada Atual)

### 12.1 Correção Estrutural Crítica — Elementos "fixed" escapando do frame do app

- **BUG-601** *(corrigido)* — O Toast de notificação, o modal de "Publicar Vaga", o modal de "Filtros" e o botão flutuante "Publicar Vaga" usavam `position: fixed`, que se posiciona sempre em relação à janela real do navegador — não ao contêiner do aplicativo. Como o app é exibido dentro de um frame de celular simulado, esses elementos "escapavam" do frame e apareciam grudados no canto da janela real do navegador (especialmente visível em telas de desktop), quebrando a experiência de protótipo contido. **Correção:** todos os elementos citados foram trocados para `position: absolute`, ancorados corretamente ao contêiner principal do app (que já possui `position: relative`). Esta era uma falha estrutural que afetava potencialmente qualquer novo modal ou elemento flutuante adicionado ao app — recomenda-se, para qualquer novo componente flutuante futuro, usar sempre `absolute` (nunca `fixed`) dentro da estrutura deste protótipo.

### 12.2 Mapa — Uso da Localização Real do Usuário

Ver RF-307 e RN-303 atualizados na Seção 4.

### 12.3 Navegação por Arraste nas Abas da Página Inicial

- **RF-213** — A fileira de abas do cabeçalho da página inicial ("Mural de Vagas", "Minhas Vagas Criadas"/"Favoritas", "Profissionais Disponíveis") agora pode ser arrastada lateralmente tanto por toque (já suportado nativamente) quanto por clique e arraste do mouse, evitando que a última aba fique escondida sem indicação de que há mais conteúdo para o lado. Um clique que termina em arraste não aciona a troca de aba (evita seleção acidental).
- **RN-711** *(correção de usabilidade)* — Antes desta correção, a rolagem horizontal dependia apenas de gestos de toque ou da roda do mouse na horizontal, o que não é intuitivo em navegadores desktop comuns; o arraste por clique resolve isso sem alterar o layout visual das abas.

### 12.4 Publicar Vaga — Botão Cancelar

- **RF-214** — O formulário de "Publicar Vaga" (modal) agora exibe dois botões lado a lado no rodapé: "Cancelar" (fecha o formulário sem publicar, mesmo comportamento do X/seta já existentes) e "Confirmar e Publicar".

### 12.5 Interface Diferenciada no Modo "Contratar" (Empresa)

- **RF-215** — Quando o modo ativo é "Contratar", o cabeçalho da página inicial exibe um selo "🏢 Empresa" ao lado do nome do app, e o avatar do usuário (menu suspenso do canto superior direito) exibe um ícone de prédio em vez das iniciais do nome — sinalizando visualmente, em toda a navegação, que a sessão está operando como contratante/empresa, não como profissional individual.
- **RF-216** — Na tela "Minha Conta", o cartão de perfil reflete o modo ativo: nome e cidade vêm do perfil editável (RF-217), o ícone muda para prédio no modo Contratar, e o selo de verificação exibe "Empresa verificada" (Contratar) ou "Verificado" (Trabalhar).
- **RN-712** *(simplificação de protótipo, a formalizar)* — Esta diferenciação é hoje visual/textual (ícones, selos e rótulos). Uma transformação mais profunda da interface no modo Contratar — como um dashboard de empresa dedicado (candidaturas recebidas, vagas publicadas, favoritos) — é o item 21 do backlog de Fase 2 (Seção 11).

### 12.6 Editar Perfil

- **RF-217** — Nova tela "Editar Perfil", acessível ao tocar no cartão de perfil dentro de "Minha Conta" (com um ícone de lápis indicando que é editável). Permite alterar: foto/logo, nome (rotulado "Nome completo" no modo Trabalhar ou "Nome da empresa" no modo Contratar), e-mail, celular, cidade, uma biografia/descrição ("Sobre você" ou "Sobre a empresa") e, apenas no modo Trabalhar, as competências (mesma lista de chips selecionáveis já usada no minicurrículo do cadastro).
- **RF-218** — As alterações salvas em "Editar Perfil" atualizam imediatamente o nome, a cidade e o selo exibidos no cabeçalho de "Minha Conta" e no avatar do menu suspenso.
- **RN-713** *(gap identificado — a formalizar)* — Os dados editados no próprio perfil ainda não se refletem em como outros usuários veriam "Você" caso "Você" aparecesse como card na aba "Profissionais Disponíveis" (essa lista usa um conjunto de profissionais fictícios independente, `PROFESSIONALS`). **Para produção, o próprio usuário precisaria ser incluído nessa listagem (do lado de quem o está buscando) refletindo os dados editados aqui.**
- **RN-714** — Nem o cadastro inicial (Módulo 1) nem o "Editar Perfil" persistem dados entre si hoje — são estados independentes no protótipo (o cadastro não pré-preenche o Editar Perfil, e vice-versa). Isso é consistente com a natureza mock do protótipo (sem backend), mas deve ser unificado em produção.
