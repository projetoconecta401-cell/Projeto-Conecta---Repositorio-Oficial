/*
 * Textos da landing page do EiFreela.
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
    "O EiFreela conecta quem precisa contratar uma diária a profissionais perto de você. Publique, encontre, combine e avalie, tudo pelo celular. Instale grátis direto do navegador, sem loja de aplicativos.",
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
    title: "Crie sua conta em 2 minutos",
    text: "Nome, CPF, contato, foto e suas áreas de atuação. O e-mail é confirmado com um código. Só para maiores de 18 anos.",
  },
  {
    icon: Search,
    title: "Publique ou encontre uma diária",
    text: "Contratantes publicam vagas em minutos. Profissionais filtram por categoria, valor, data e distância no mapa.",
  },
  {
    icon: MessageCircle,
    title: "Combine, trabalhe e avalie",
    text: "Chat com texto e áudio, check-in e check-out da diária e avaliação dos dois lados ao final.",
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
      { icon: Users, text: "Veja candidatos com foto, áreas de atuação e avaliações" },
      { icon: MessageCircle, text: "Converse pelo chat da vaga, por texto ou áudio" },
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
      { icon: Bell, text: "Receba aviso quando sair vaga nas suas áreas" },
      { icon: Calendar, text: "Acompanhe a agenda e faça check-in e check-out pelo app" },
      { icon: BadgeCheck, text: "Receba avaliações e mostre sua nota para novos contratantes" },
    ],
  },
];

export const TRUST = [
  {
    icon: ShieldCheck,
    title: "Seus dados protegidos",
    text: "CPF, telefone e nascimento ficam visíveis só para você. O EiFreela não pede dados bancários.",
  },
  {
    icon: MapPin,
    title: "Endereço protegido",
    text: "As vagas mostram só a região aproximada. O endereço exato é combinado pelo chat.",
  },
  {
    icon: Star,
    title: "Reputação dos dois lados",
    text: "Contratantes e profissionais se avaliam com critérios claros depois de cada diária.",
  },
];

export const FOOTER_NOTE =
  "Instale grátis na tela inicial do Android ou do iPhone, direto do navegador. Uso exclusivo para maiores de 18 anos.";
