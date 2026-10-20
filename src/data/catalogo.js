import {
  Utensils, PartyPopper, ShoppingBag, BriefcaseBusiness, Palette, Clapperboard, Camera, Laptop,
  Sparkles, Hammer, Wrench, Truck, Car, HeartHandshake, BookOpen, Tractor,
} from "lucide-react";

/* Listas fixas do app (categorias, tipos de vaga, períodos, estados). Nenhum dado de exemplo:
   vagas, profissionais e conversas vêm só do Supabase.
   As categorias precisam ser iguais às da função categorias_eifreela() no banco. */

export const CATEGORIES = [
  { id: "gastro", label: "Gastronomia", icon: Utensils },
  { id: "eventos", label: "Eventos", icon: PartyPopper },
  { id: "vendas", label: "Vendas e comércio", icon: ShoppingBag },
  { id: "adm", label: "Administrativo", icon: BriefcaseBusiness },
  { id: "design", label: "Design gráfico", icon: Palette },
  { id: "conteudo", label: "Criação de conteúdo", icon: Clapperboard },
  { id: "foto", label: "Fotografia e vídeo", icon: Camera },
  { id: "ti", label: "Tecnologia e TI", icon: Laptop },
  { id: "beleza", label: "Estética/Beleza", icon: Sparkles },
  { id: "obras", label: "Manutenção/Obras", icon: Hammer },
  { id: "gerais", label: "Serviços Gerais", icon: Wrench },
  { id: "logistica", label: "Logística e entregas", icon: Truck },
  { id: "motorista", label: "Motorista", icon: Car },
  { id: "cuidados", label: "Cuidados (babá e idosos)", icon: HeartHandshake },
  { id: "aulas", label: "Aulas e reforço", icon: BookOpen },
  { id: "agro", label: "Agro e campo", icon: Tractor },
];

/* Tipos de contratação. */
export const TIPOS_VAGA = [
  { id: "diaria", label: "Diária", curto: "Diária", ajuda: "Um dia de trabalho (ou poucos dias)." },
  { id: "temporario", label: "Temporário", curto: "Temporário", ajuda: "Contrato por um período, como fim de ano ou safra." },
  { id: "freela", label: "Freela / projeto", curto: "Freela", ajuda: "Serviço por entrega: arte, vídeo, site, conteúdo…" },
];
export const tipoDaVaga = (id) => TIPOS_VAGA.find((t) => t.id === id) ?? TIPOS_VAGA[0];

export const UNIDADES_VALOR = [
  { id: "hora", label: "por hora", curto: "/h" },
  { id: "dia", label: "por dia", curto: "/dia" },
  { id: "semana", label: "por semana", curto: "/semana" },
  { id: "mes", label: "por mês", curto: "/mês" },
  { id: "projeto", label: "pelo projeto", curto: " (projeto)" },
];
export const unidadeCurta = (id) => UNIDADES_VALOR.find((u) => u.id === id)?.curto ?? "";

export const REGIMES = [
  { id: "clt_temporario", label: "Carteira assinada (temporário)" },
  { id: "prestacao_servico", label: "Prestação de serviço (contrato)" },
  { id: "a_combinar", label: "A combinar" },
];
export const regimeLabel = (id) => REGIMES.find((r) => r.id === id)?.label ?? null;

export const iconeDaCategoria = (label) => CATEGORIES.find((c) => c.label === label)?.icon ?? Wrench;

export const PERIODS = ["Manhã", "Tarde", "Noite"];

export const STATES = [
  "Todos", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
