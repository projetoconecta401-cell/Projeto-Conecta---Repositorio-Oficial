import { Utensils, PartyPopper, Palette, Sparkles, Hammer, Wrench } from "lucide-react";

/* Listas fixas do app (categorias, períodos, estados). Nenhum dado de exemplo:
   vagas, profissionais e conversas vêm só do Supabase. */

export const CATEGORIES = [
  { id: "gastro", label: "Gastronomia", icon: Utensils },
  { id: "eventos", label: "Eventos", icon: PartyPopper },
  { id: "digital", label: "Design/Digital", icon: Palette },
  { id: "beleza", label: "Estética/Beleza", icon: Sparkles },
  { id: "obras", label: "Manutenção/Obras", icon: Hammer },
  { id: "gerais", label: "Serviços Gerais", icon: Wrench },
];

export const iconeDaCategoria = (label) => CATEGORIES.find((c) => c.label === label)?.icon ?? Wrench;

export const PERIODS = ["Manhã", "Tarde", "Noite"];

export const STATES = [
  "Todos", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
