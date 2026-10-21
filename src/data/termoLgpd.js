/*
 * Termo de Consentimento para Tratamento de Dados Pessoais (LGPD – Lei nº 13.709/2018).
 * Fonte única: o app mostra este texto (tela de aceite e Configurações) e a página
 * pública /lgpd/ é gerada a partir dele. Ao mudar o texto, troque VERSAO_TERMO:
 * todos os usuários terão de aceitar de novo.
 */

export const VERSAO_TERMO = "1.3-2026-10-21";
export const DATA_TERMO = "21 de outubro de 2026";
export const LINK_LEI = "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm";
export const CONTATO = "projetoconecta401@gmail.com";

export const TITULO_TERMO = "Termo de Consentimento para Tratamento de Dados Pessoais";

export const INTRO_TERMO =
  "Este termo segue a Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709, de 14 de agosto de 2018). " +
  "Ao aceitá-lo, você, titular dos dados, manifesta de forma livre, informada e inequívoca (art. 5º, XII) " +
  "que concorda com o tratamento dos seus dados pessoais pelo EiFreela, nas condições abaixo.";

export const SECOES_TERMO = [
  {
    titulo: "1. Quem trata seus dados",
    paragrafos: [
      "Controlador: EiFreela, plataforma que aproxima contratantes de diárias e serviços avulsos e profissionais disponíveis.",
      `Encarregado pelo tratamento de dados (art. 41): ${CONTATO}.`,
    ],
  },
  {
    titulo: "2. Dados que tratamos",
    itens: [
      "Cadastro: nome completo, CPF, e-mail, data de nascimento, telefone/WhatsApp, foto de perfil e áreas de atuação.",
      "Resumo profissional (opcional): apresentação, escolaridade, curso, instituição, situação (cursando ou concluído), experiências e cursos que você decidir informar.",
      "Login com Google ou Facebook (se você escolher): nome, e-mail e foto pública fornecidos pelo provedor. Não recebemos sua senha.",
      "Avaliação do aplicativo (opcional): nota, se recomendaria e sugestões de melhoria. Usada só para melhorar o EiFreela e em resultados gerais, sem identificar você.",
      "Uso do app: vagas, candidaturas, mensagens de texto e de áudio, avaliações, denúncias, bloqueios, notificações e horário do último acesso.",
      "Localização aproximada (opcional): arredondada para cerca de 1 km, só para mostrar a distância das vagas. A posição exata nunca é gravada.",
      "Não coletamos dados bancários, de cartão, chaves PIX nem dados pessoais sensíveis (art. 5º, II).",
    ],
  },
  {
    titulo: "3. Para que usamos e com qual base legal (art. 7º)",
    itens: [
      "Criar e manter sua conta, mostrar vagas e perfis, permitir candidaturas, chat e avaliações: execução do contrato de uso (art. 7º, V) e consentimento (art. 7º, I).",
      "Confirmar sua identidade, impedir contas duplicadas pelo CPF e prevenir golpes, spam e abusos (denúncias, bloqueios e limites de uso): legítimo interesse e proteção dos usuários (art. 7º, IX, e art. 10).",
      "Enviar avisos de novas vagas e de mensagens: consentimento (art. 7º, I), que você pode desligar a qualquer momento.",
      "Cumprir obrigações legais e atender pedidos de autoridades: art. 7º, II e VI.",
    ],
  },
  {
    titulo: "4. Com quem compartilhamos (art. 9º, V, e art. 39)",
    itens: [
      "Outros usuários veem apenas seu nome, foto, áreas de atuação, avaliações (sem mostrar quem avaliou) e o resumo profissional, se você o preencher. CPF, e-mail, nascimento e telefone ficam visíveis só para você.",
      "O WhatsApp informado numa vaga aparece apenas para o profissional contratado.",
      "Operadores que guardam e processam os dados em nosso nome: Supabase (banco de dados, arquivos e login) e Vercel (hospedagem do site).",
      "Google e Facebook, somente se você escolher entrar por eles.",
      "Os servidores desses operadores podem ficar fora do Brasil; a transferência internacional segue o art. 33 da LGPD.",
      "Não vendemos nem cedemos seus dados para publicidade.",
    ],
  },
  {
    titulo: "5. Segurança dos dados (art. 46)",
    itens: [
      "Conexão sempre criptografada (HTTPS).",
      "Regras de acesso no banco de dados que limitam cada conta aos próprios dados.",
      "Senhas guardadas de forma criptografada pelo serviço de login; ninguém do EiFreela consegue vê-las.",
      "Áudios do chat em armazenamento privado, acessível só às duas pessoas da conversa.",
      "Se houver um incidente de segurança que possa causar risco ou dano relevante, avisaremos os titulares e a ANPD (art. 48).",
    ],
  },
  {
    titulo: "6. Por quanto tempo guardamos (arts. 15 e 16)",
    paragrafos: [
      "Enquanto sua conta estiver ativa. Ao excluir a conta, apagamos perfil, vagas, conversas, áudios e avaliações vinculados a ela, exceto o que a lei obrigar a manter.",
      "Conversas de vagas (mensagens e áudios) são apagadas automaticamente quando a diária é concluída e as duas pessoas avaliam, ou 7 dias após a conclusão. Se houver denúncia em análise, a conversa é guardada só até o fim da análise.",
    ],
  },
  {
    titulo: "7. Seus direitos como titular (art. 18)",
    itens: [
      "Confirmar se tratamos seus dados e acessá-los.",
      "Corrigir dados incompletos, inexatos ou desatualizados (em Perfil → Editar perfil).",
      "Pedir anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.",
      "Pedir a portabilidade dos seus dados.",
      "Pedir a eliminação dos dados tratados com base no seu consentimento.",
      "Saber com quem compartilhamos seus dados.",
      "Saber que pode não dar o consentimento e quais as consequências disso.",
      "Revogar o consentimento.",
      `Os pedidos são gratuitos: escreva para ${CONTATO}. Você também pode reclamar à Autoridade Nacional de Proteção de Dados – ANPD (art. 18, § 1º).`,
    ],
  },
  {
    titulo: "8. Como revogar o consentimento (art. 8º, § 5º)",
    paragrafos: [
      `A qualquer momento e sem custo, excluindo sua conta em Perfil → Excluir conta permanentemente, ou pelo e-mail ${CONTATO}.`,
      "Sem o consentimento não é possível usar o EiFreela. Os tratamentos feitos antes da revogação continuam válidos.",
    ],
  },
  {
    titulo: "9. Idade mínima",
    paragrafos: ["O EiFreela é destinado exclusivamente a maiores de 18 anos."],
  },
  {
    titulo: "10. Alterações deste termo",
    paragrafos: [
      "Se este termo mudar, o app mostrará a nova versão e pedirá um novo aceite antes de você continuar.",
    ],
  },
];

export const DECLARACAO_ACEITE =
  "Declaro que tenho 18 anos ou mais, que li e entendi este Termo de Consentimento, os Termos de Uso e a Política de " +
  "Privacidade, e que autorizo o EiFreela a tratar meus dados pessoais conforme a Lei nº 13.709/2018 (LGPD).";
