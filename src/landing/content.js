/*
 * Textos da landing page do Conexão Free.
 * Para mudar um texto da página, edite aqui; o layout fica em Landing.jsx.
 */
import {
  Utensils, PartyPopper, Palette, Sparkles, Hammer, Wrench,
  UserCheck, Search, MessageCircle, ShieldCheck, MapPin, Star,
  Briefcase, Users, Wallet, Calendar, Bell, BadgeCheck,
} from "lucide-react";

// Endereço do app (relativo: funciona na raiz do site e em subpastas, ex. GitHub Pages).
export const APP_URL = "app/";

export const HERO = {
  eyebrow: "Diárias e serviços freelancer",
  title: "A mão extra que você precisa, na hora certa.",
  subtitle:
    "O Conexão Free conecta quem precisa contratar uma diária a profissionais verificados perto de você. Publique, encontre, combine e avalie, tudo pelo celular.",
};

export const CATEGORIES = [
  { label: "Gastronomia", icon: Utensils },
  { label: "Eventos", icon: PartyPopper },
  { label: "Design/Digital", icon: Palette },
  { label: "Estética", icon: Sparkles },
  { label: "Manutenção/Obras", icon: Hammer },
  { label: "Serviços Gerais", icon: Wrench },
];

export const STEPS = [
  {
    icon: UserCheck,
    title: "Crie sua conta verificada",
    text: "Cadastro com verificação de e-mail, documento e selfie ao vivo. Só para maiores de 18 anos.",
  },
  {
    icon: Search,
    title: "Publique ou encontre uma diária",
    text: "Contratantes publicam vagas em minutos. Profissionais filtram por categoria, valor, data e distância no mapa.",
  },
  {
    icon: MessageCircle,
    title: "Combine, trabalhe e avalie",
    text: "Chat liberado após o aceite, check-in e check-out da diária e avaliação dos dois lados ao final.",
  },
];

export const AUDIENCES = [
  {
    id: "contratar",
    cta: "Quero contratar",
    kicker: "Para contratantes",
    title: "Encontre quem resolve, sem burocracia.",
    text: "Empresas e pessoas físicas publicam vagas avulsas de curta duração e escolhem o profissional ideal.",
    icon: Briefcase,
    points: [
      { icon: Calendar, text: "Publique a vaga com data, horário, valor e bairro" },
      { icon: Users, text: "Veja candidatos e perfis com nota, competências e histórico" },
      { icon: MessageCircle, text: "Converse pelo chat da vaga depois de aceitar o candidato" },
      { icon: Star, text: "Acompanhe a diária e avalie o profissional ao final" },
    ],
  },
  {
    id: "trabalhar",
    cta: "Quero trabalhar",
    kicker: "Para profissionais",
    title: "Diárias perto de você, do seu jeito.",
    text: "Encontre oportunidades por categoria, distância, valor e data, e construa sua reputação a cada serviço.",
    icon: Wallet,
    points: [
      { icon: MapPin, text: "Mapa com vagas abertas no raio que você escolher" },
      { icon: Bell, text: "Candidate-se e acompanhe o status de cada candidatura" },
      { icon: Calendar, text: "Confirme presença e faça check-in e check-out pelo app" },
      { icon: BadgeCheck, text: "Receba avaliações e mostre sua nota para novos contratantes" },
    ],
  },
];

export const TRUST = [
  {
    icon: ShieldCheck,
    title: "Identidade verificada",
    text: "Documento e selfie capturada ao vivo pela câmera, nunca da galeria.",
  },
  {
    icon: MapPin,
    title: "Endereço protegido",
    text: "O endereço exato da vaga só é liberado ao candidato aprovado. Antes disso, só o bairro.",
  },
  {
    icon: Star,
    title: "Reputação dos dois lados",
    text: "Contratantes e profissionais se avaliam com critérios claros depois de cada diária.",
  },
];

export const FOOTER_NOTE =
  "Protótipo em desenvolvimento: os dados do app são simulados e não são salvos. Uso exclusivo para maiores de 18 anos.";
