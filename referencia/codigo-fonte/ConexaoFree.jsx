import React, { useState, useRef, useEffect } from "react";
import {
  Mail, Lock, User, MapPin, Star, ShieldCheck, Upload, Camera, CreditCard,
  Wallet, Bell, X, Plus, ChevronRight, ChevronLeft, LogOut, Trash2, MessageCircle,
  Send, ArrowLeft, Settings, SlidersHorizontal, Navigation2, Clock, Calendar,
  Building2, UserCheck, AlertTriangle, CheckCircle2, Briefcase, Search,
  Utensils, PartyPopper, Palette, Sparkles, Hammer, Wrench, BadgeCheck,
  Eye, EyeOff, FileText, Check, ImagePlus, Phone, Home, Cake, MessageSquare, History, Bookmark, Users,
  Smile, Mic, Play, Pause, Square, Pencil
} from "lucide-react";


/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                          */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { id: "gastro", label: "Gastronomia", icon: Utensils },
  { id: "eventos", label: "Eventos", icon: PartyPopper },
  { id: "digital", label: "Design/Digital", icon: Palette },
  { id: "beleza", label: "Estética/Beleza", icon: Sparkles },
  { id: "obras", label: "Manutenção/Obras", icon: Hammer },
  { id: "gerais", label: "Serviços Gerais", icon: Wrench },
];

const INITIAL_JOBS = [
  {
    id: 1,
    title: "Garçom para evento corporativo",
    category: "Gastronomia",
    value: 180,
    date: "30/08 · 18h às 23h",
    dateISO: "2026-08-30",
    period: "Noite",
    neighborhood: "Jardim Clodoaldo",
    address: "Av. Marechal Rondon, 1450",
    city: "Ji-Paraná",
    state: "RO",
    verified: true,
    lat: -10.8791,
    lng: -61.9986,
    status: "Disponível",
    contractor: "Buffet Sabor & Cia",
    candidate: null,
    urgent: true,
    experience: "Com experiência mínima",
    candidatesCount: 3,
    distanceKm: 1.8,
    contractorPhone: "(69) 99911-2233",
  },
  {
    id: 2,
    title: "Designer para identidade visual",
    category: "Design/Digital",
    value: 350,
    date: "02/09 · Remoto",
    dateISO: "2026-09-02",
    period: "Tarde",
    neighborhood: "Centro",
    address: "Rua Getúlio Vargas, 812",
    city: "Ji-Paraná",
    state: "RO",
    lat: -10.9021,
    lng: -62.0134,
    verified: true,
    status: "Disponível",
    contractor: "Studio Rondônia Digital",
    candidate: null,
    urgent: false,
    experience: "Com experiência mínima",
    candidatesCount: 5,
    distanceKm: 3.4,
    contractorPhone: "(69) 99822-4455",
  },
  {
    id: 3,
    title: "Pedreiro para reforma de varanda",
    category: "Manutenção/Obras",
    value: 220,
    date: "31/08 · 07h às 16h",
    dateISO: "2026-08-31",
    period: "Manhã",
    neighborhood: "Urupá",
    address: "Rua das Palmeiras, 233",
    city: "Ji-Paraná",
    state: "RO",
    lat: -10.8654,
    lng: -61.9312,
    verified: false,
    status: "Em Negociação",
    contractor: "Marcos Andrade",
    candidate: "Você",
    urgent: false,
    experience: "Sem experiência",
    candidatesCount: 1,
    distanceKm: 2.1,
    contractorPhone: "(69) 99733-6677",
  },
  {
    id: 4,
    title: "Maquiadora para casamento",
    category: "Estética/Beleza",
    value: 300,
    date: "05/09 · 08h às 14h",
    dateISO: "2026-09-05",
    period: "Manhã",
    neighborhood: "Centro",
    address: "Rua Rio Branco, 55",
    city: "Cacoal",
    state: "RO",
    lat: -11.4386,
    lng: -61.4472,
    verified: true,
    status: "Disponível",
    contractor: "Espaço Beleza Cacoal",
    candidate: null,
    urgent: false,
    experience: "Com experiência mínima",
    candidatesCount: 2,
    distanceKm: 6.5,
    contractorPhone: "(69) 99644-8899",
  },
  {
    id: 5,
    title: "Auxiliar de montagem para feira",
    category: "Eventos",
    value: 160,
    date: "06/09 · 06h às 12h",
    dateISO: "2026-09-06",
    period: "Manhã",
    neighborhood: "Setor 01",
    address: "Av. Capitão Sílvio, 900",
    city: "Ariquemes",
    state: "RO",
    lat: -9.9133,
    lng: -63.0406,
    verified: true,
    status: "Disponível",
    contractor: "Feira do Empreendedor",
    candidate: null,
    urgent: false,
    experience: "Sem experiência",
    candidatesCount: 6,
    distanceKm: 4.0,
    contractorPhone: "(69) 99555-1122",
  },
  {
    id: 6,
    title: "Recepcionista para lançamento de produto",
    category: "Eventos",
    value: 210,
    date: "07/09 · 14h às 20h",
    dateISO: "2026-09-07",
    period: "Tarde",
    neighborhood: "Moema",
    address: "Av. Ibirapuera, 2200",
    city: "São Paulo",
    state: "SP",
    lat: -23.5505,
    lng: -46.6333,
    verified: true,
    status: "Disponível",
    contractor: "Agência Prime Eventos",
    candidate: null,
    urgent: false,
    experience: "Com experiência mínima",
    candidatesCount: 4,
    distanceKm: 9.2,
    contractorPhone: "(11) 98877-3344",
  },
  {
    id: 7,
    title: "Eletricista para instalação residencial",
    category: "Manutenção/Obras",
    value: 190,
    date: "08/09 · 08h às 17h",
    dateISO: "2026-09-08",
    period: "Manhã",
    neighborhood: "Copacabana",
    address: "Rua Barata Ribeiro, 320",
    city: "Rio de Janeiro",
    state: "RJ",
    lat: -22.9068,
    lng: -43.1729,
    verified: true,
    status: "Disponível",
    contractor: "Condomínio Vista Mar",
    candidate: null,
    urgent: true,
    experience: "Com experiência mínima",
    candidatesCount: 2,
    distanceKm: 7.8,
    contractorPhone: "(21) 98766-5544",
  },
];

const PERIODS = ["Manhã", "Tarde", "Noite"];

const CITIES = ["Todas", "Ji-Paraná", "Cacoal", "Ariquemes", "São Paulo", "Rio de Janeiro"];
const STATES = [
  "Todos", "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const PROFESSIONALS = [
  {
    id: 1,
    name: "Fernanda Lima",
    rating: 4.9,
    skills: "Bartender · Recepção · Eventos",
    avatar: "FL",
    city: "Ji-Paraná",
    state: "RO",
    bio: "Bartender e recepcionista com 4 anos de experiência em eventos corporativos e festas particulares. Pontual, organizada e com ótimo relacionamento com o público.",
    history: [
      { title: "Recepção — Lançamento de produto", contractor: "Agência Prime Eventos", date: "12/08/2026", rating: 5 },
      { title: "Bartender — Casamento", contractor: "Buffet Sabor & Cia", date: "02/07/2026", rating: 5 },
      { title: "Garçonete — Aniversário 50 anos", contractor: "Marcos Andrade", date: "18/06/2026", rating: 4 },
    ],
  },
  {
    id: 2,
    name: "João Pedro Souza",
    rating: 4.7,
    skills: "Pedreiro · Pintor · Elétrica básica",
    avatar: "JP",
    city: "Ji-Paraná",
    state: "RO",
    bio: "Pedreiro e pintor autônomo há 8 anos. Atende reformas residenciais, pequenos reparos e serviços de manutenção geral com agilidade.",
    history: [
      { title: "Reforma de varanda", contractor: "Marcos Andrade", date: "20/07/2026", rating: 5 },
      { title: "Pintura de fachada", contractor: "Condomínio Vista Mar", date: "05/06/2026", rating: 4 },
      { title: "Reparo elétrico residencial", contractor: "Studio Rondônia Digital", date: "22/05/2026", rating: 5 },
    ],
  },
  {
    id: 3,
    name: "Camila Torres",
    rating: 5.0,
    skills: "Maquiagem · Penteados · Estética",
    avatar: "CT",
    city: "Cacoal",
    state: "RO",
    bio: "Maquiadora profissional especializada em noivas e eventos sociais. Atendimento a domicílio em Cacoal e região.",
    history: [
      { title: "Maquiagem para casamento", contractor: "Espaço Beleza Cacoal", date: "30/07/2026", rating: 5 },
      { title: "Penteado para formatura", contractor: "Buffet Sabor & Cia", date: "14/06/2026", rating: 5 },
    ],
  },
];

const SOCIAL_MOCK = {
  google: { name: "Convidado Google", email: "convidado.google@gmail.com" },
  facebook: { name: "Convidado Facebook", email: "convidado.facebook@outlook.com" },
};

const MY_WORK_HISTORY = [
  { title: "Garçom — Evento corporativo", contractor: "Buffet Sabor & Cia", date: "28/08/2026", rating: 5 },
  { title: "Auxiliar de montagem — Feira de negócios", contractor: "Studio Rondônia Digital", date: "15/08/2026", rating: 5 },
  { title: "Recepção — Aniversário de 15 anos", contractor: "Marcos Andrade", date: "30/07/2026", rating: 4 },
  { title: "Garçom — Casamento", contractor: "Agência Prime Eventos", date: "10/07/2026", rating: 5 },
];

/* ------------------------------------------------------------------ */
/*  SMALL SHARED UI PIECES                                             */
/* ------------------------------------------------------------------ */

const Screen = ({ children }) => (
  <div className="min-h-full flex flex-col bg-slate-50">{children}</div>
);

const TopBar = ({ title, onBack, right }) => (
  <div className="flex items-center gap-3 px-4 py-4 bg-white border-b border-slate-100 sticky top-0 z-20">
    {onBack && (
      <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-600">
        <ArrowLeft size={20} />
      </button>
    )}
    <h1 className="text-[17px] font-bold text-slate-800 flex-1 truncate">{title}</h1>
    {right}
  </div>
);

const Field = ({ icon: Icon, ...props }) => (
  <div className="relative">
    {Icon && <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
    <input
      {...props}
      className={`w-full ${Icon ? "pl-10" : "pl-3.5"} pr-3.5 py-3 rounded-xl border border-slate-200 bg-white text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition`}
    />
  </div>
);

/* ------------------------------------------------------------------ */
/*  CAMPO COM VERIFICAÇÃO (e-mail / celular) — envia código simulado   */
/*  e só marca como confirmado quando o código digitado bate.          */
/* ------------------------------------------------------------------ */
const VerifiableField = ({
  icon: Icon, type = "text", placeholder, value, onChange, verified, onVerify,
  codeSent, code, onCodeChange, onConfirmCode, generatedCode, verifyLabel, sentLabel, codeError,
}) => (
  <div>
    <div className="relative">
      <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={verified}
        className={`w-full pl-10 pr-[6.5rem] py-3 rounded-xl border bg-white text-[15px] placeholder:text-slate-400 focus:outline-none focus:ring-2 transition ${
          verified
            ? "border-emerald-300 bg-emerald-50/50 text-emerald-700"
            : "border-slate-200 text-slate-800 focus:ring-emerald-500/40 focus:border-emerald-500"
        }`}
      />
      {verified ? (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[12px] font-bold text-emerald-600">
          <CheckCircle2 size={15} /> Verificado
        </span>
      ) : (
        <button
          type="button"
          onClick={onVerify}
          disabled={!value}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11.5px] font-bold disabled:opacity-40 transition"
        >
          {verifyLabel}
        </button>
      )}
    </div>

    {codeSent && !verified && (
      <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <p className="text-[11.5px] text-slate-500 mb-2 leading-snug">
          {sentLabel} Código (simulação de protótipo, sem envio real):{" "}
          <span className="font-bold text-slate-700 tracking-wider">{generatedCode}</span>
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={onCodeChange}
            placeholder="Digite o código"
            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <button
            type="button"
            onClick={onConfirmCode}
            disabled={code.length < 6}
            className="shrink-0 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold disabled:opacity-40 transition"
          >
            Confirmar
          </button>
        </div>
        {codeError && (
          <p className="text-[11.5px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
            <AlertTriangle size={12} /> {codeError}
          </p>
        )}
      </div>
    )}
  </div>
);

const PrimaryButton = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold text-[15px] shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition disabled:opacity-40 disabled:shadow-none ${className}`}
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`w-full py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-[15px] active:scale-[0.98] transition ${className}`}
  >
    {children}
  </button>
);

const OrangeButton = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold text-[15px] shadow-lg shadow-teal-500/25 active:scale-[0.98] transition disabled:opacity-40 ${className}`}
  >
    {children}
  </button>
);

const GreenButton = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-[15px] shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition disabled:opacity-40 disabled:shadow-none ${className}`}
  >
    {children}
  </button>
);

const Pill = ({ children, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-teal-50 text-teal-600",
    blue: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-500",
  };
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
};

const UploadBox = ({ label, hint, done, onClick, icon: Icon = Upload }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition text-left ${
      done ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-emerald-300"
    }`}
  >
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${done ? "bg-emerald-500 text-white" : "bg-white text-slate-400 border border-slate-200"}`}>
      {done ? <Check size={18} /> : <Icon size={18} />}
    </div>
    <div className="min-w-0">
      <p className="text-[14px] font-semibold text-slate-800">{label}</p>
      <p className="text-[12px] text-slate-500 truncate">{done ? "Arquivo enviado ✓" : hint}</p>
    </div>
  </button>
);

const WhatsAppIcon = ({ size = 16, className = "" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.63 1.44 5.15L2 22l5.09-1.55a9.87 9.87 0 0 0 4.95 1.33h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2Zm5.8 14.14c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.02-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.11.32.02.51-.09.19-.14.31-.27.48-.14.17-.29.38-.41.51-.14.14-.28.29-.12.57.16.28.7 1.16 1.51 1.88 1.04.93 1.91 1.22 2.19 1.36.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.44.19.5.3.06.11.06.63-.18 1.31Z" />
  </svg>
);

const Toast = ({ toast }) =>
  !toast ? null : (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] w-[92%] max-w-sm animate-[fadeIn_.2s_ease]">
      <div className="flex items-start gap-3 bg-slate-900 text-white rounded-2xl shadow-2xl p-4">
        <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
          <Bell size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold">{toast.title}</p>
          <p className="text-[12px] text-slate-300 mt-0.5">{toast.body}</p>
        </div>
      </div>
    </div>
  );

/* ------------------------------------------------------------------ */
/*  AVATAR DO USUÁRIO — MENU SUSPENSO (Ver perfil / Sair do perfil)    */
/* ------------------------------------------------------------------ */

function UserAvatarMenu({ onViewProfile, onLogout, mode, name }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu do usuário"
        className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-transparent hover:ring-emerald-200 active:scale-95 transition"
      >
        {mode === "contratar" ? <Building2 size={16} /> : (name?.[0] || "V").toUpperCase()}
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-900/10 py-1.5 z-30 origin-top-right transition-all duration-150 ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            setOpen(false);
            onViewProfile();
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition text-left"
        >
          <User size={16} className="text-slate-500 shrink-0" />
          Ver meu perfil
        </button>
        <div className="h-px bg-slate-100 mx-1.5 my-1" />
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            setOpen(false);
            onLogout();
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition text-left"
        >
          <LogOut size={16} className="shrink-0" />
          Sair do perfil
        </button>
      </div>
    </div>
  );
}

const BottomNav = ({ active, setScreen, mode, unreadConversations }) => {
  const items = [
    { id: "feed", label: "Início", icon: Briefcase },
    { id: "map", label: "Mapa", icon: MapPin },
    { id: "chatList", label: "Chat", icon: MessageSquare, badge: unreadConversations },
    { id: "agenda", label: "Agenda", icon: Calendar },
    { id: "notifs", label: "Alertas", icon: Bell },
    { id: "account", label: "Perfil", icon: User },
  ];
  return (
    <div className="sticky bottom-0 z-20 bg-white border-t border-slate-100 px-1 py-2 flex items-center justify-between">
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setScreen(it.id)}
            className="flex-1 min-w-0 flex flex-col items-center gap-1 py-1.5"
          >
            <span className="relative">
              <Icon size={19} className={isActive ? "text-emerald-600" : "text-slate-400"} strokeWidth={isActive ? 2.5 : 2} />
              {!!it.badge && (
                <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-[3px] rounded-full bg-emerald-500 border-2 border-white text-white text-[9px] font-bold flex items-center justify-center leading-none">
                  {it.badge}
                </span>
              )}
            </span>
            <span className={`text-[9px] font-medium truncate max-w-full ${isActive ? "text-emerald-600" : "text-slate-400"}`}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  MODULE 1 — AUTH / ONBOARDING / SECURITY / TERMS / ACCOUNT          */
/* ------------------------------------------------------------------ */

function CadastroScreen({ onBack, onNext, socialProvider, socialPrefill }) {
  const [photo, setPhoto] = useState(!!socialProvider);
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [ageError, setAgeError] = useState("");

  const [name, setName] = useState(socialPrefill?.name || "");
  const [email, setEmail] = useState(socialPrefill?.email || "");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [generatedEmailCode, setGeneratedEmailCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(!!socialProvider);
  const [emailCodeError, setEmailCodeError] = useState("");

  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const passwordsOk = socialProvider ? true : password.length >= 6 && password === confirmPassword;

  const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

  const handleSendEmailCode = () => {
    if (!emailFormatValid) return;
    setGeneratedEmailCode(generateCode());
    setEmailCodeSent(true);
    setEmailCode("");
    setEmailCodeError("");
  };

  const handleConfirmEmailCode = () => {
    if (emailCode === generatedEmailCode) {
      setEmailVerified(true);
      setEmailCodeError("");
    } else {
      setEmailCodeError("Código incorreto. Confira e tente novamente.");
    }
  };

  const calcAge = (dateStr) => {
    if (!dateStr) return null;
    const today = new Date();
    const birth = new Date(dateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleBirthChange = (e) => {
    const value = e.target.value;
    setBirthDate(value);
    const age = calcAge(value);
    if (age !== null && age < 18) {
      setAgeError("A Conexão Free é destinada apenas a maiores de 18 anos.");
    } else {
      setAgeError("");
    }
  };

  const pendencies = [
    { done: !!name.trim(), label: "Informar o nome completo" },
    { done: emailVerified, label: "Verificar o e-mail" },
    ...(socialProvider ? [] : [{ done: passwordsOk, label: "Criar e confirmar a senha (mínimo 6 caracteres)" }]),
    { done: !!birthDate && !ageError, label: "Informar uma data de nascimento válida (18+)" },
  ];
  const canContinue = pendencies.every((p) => p.done);

  return (
    <Screen>
      <TopBar title="Criar conta" onBack={onBack} />
      <div className="flex-1 px-6 py-6 space-y-4">
        {socialProvider ? (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <span
              className={`w-7 h-7 rounded-full text-white text-[12px] font-bold flex items-center justify-center shrink-0 ${
                socialProvider === "google" ? "bg-red-500" : "bg-blue-600"
              }`}
            >
              {socialProvider === "google" ? "G" : "f"}
            </span>
            <p className="text-[12.5px] text-emerald-700 leading-snug">
              Continuando cadastro com informações do {socialProvider === "google" ? "Google" : "Facebook"}. Nome,
              e-mail e foto já foram importados — confira os dados e conclua as próximas etapas.
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-slate-500">Preencha seus dados de cadastro para começar.</p>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setPhoto(true)}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed transition ${
              photo ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-slate-50"
            }`}
          >
            {photo ? (
              <Check size={26} className="text-emerald-500" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <ImagePlus size={22} />
                <span className="text-[10px] font-medium">Foto de perfil</span>
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white">
              <Camera size={13} />
            </span>
          </button>
        </div>

        <Field icon={User} placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />

        <VerifiableField
          icon={Mail}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailVerified(false);
            setEmailCodeSent(false);
          }}
          verified={emailVerified}
          onVerify={handleSendEmailCode}
          codeSent={emailCodeSent}
          code={emailCode}
          onCodeChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onConfirmCode={handleConfirmEmailCode}
          generatedCode={generatedEmailCode}
          verifyLabel="Verificar"
          sentLabel="Enviamos um código de confirmação para o seu e-mail."
          codeError={emailCodeError}
        />

        {!socialProvider && (
          <>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Criar senha"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua senha"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-white text-[15px] focus:outline-none focus:ring-2 transition ${
                    passwordMismatch
                      ? "border-red-300 focus:ring-red-500/30"
                      : "border-slate-200 focus:ring-emerald-500/40 focus:border-emerald-500"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordMismatch && (
                <p className="text-[12px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={12} /> As senhas não coincidem.
                </p>
              )}
            </div>
          </>
        )}

        <Field
          icon={Phone}
          type="tel"
          placeholder="Número de celular · (69) 99999-9999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Field icon={Home} placeholder="Endereço (rua, número, bairro)" />

        <div>
          <div className="relative">
            <Cake size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={birthDate}
              onChange={handleBirthChange}
              max={new Date().toISOString().split("T")[0]}
              className={`w-full pl-10 pr-3.5 py-3 rounded-xl border bg-white text-[15px] text-slate-700 focus:outline-none focus:ring-2 transition ${
                ageError ? "border-red-300 focus:ring-red-500/30" : "border-slate-200 focus:ring-emerald-500/40 focus:border-emerald-500"
              }`}
            />
          </div>
          {ageError ? (
            <p className="text-[12px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
              <AlertTriangle size={12} /> {ageError}
            </p>
          ) : (
            <p className="text-[11.5px] text-slate-400 mt-1.5">A Conexão Free é destinada apenas a maiores de 18 anos.</p>
          )}
        </div>

        <PrimaryButton className="mt-2" disabled={!canContinue} onClick={onNext}>Continuar</PrimaryButton>

        {!canContinue && (
          <div className="text-[11.5px] text-slate-400 pt-1">
            <p className="font-semibold text-slate-500 mb-1">Para continuar, finalize:</p>
            <ul className="space-y-0.5">
              {pendencies
                .filter((p) => !p.done)
                .map((p, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" /> {p.label}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </Screen>
  );
}

function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [sentVia, setSentVia] = useState("email");

  const handleContinueEmail = () => {
    if (!email) return;
    setSentVia("email");
    setSent(true);
  };

  const handleContinuePhone = () => {
    if (!phone) return;
    setSentVia("celular");
    setSent(true);
  };

  if (sent) {
    return (
      <Screen>
        <TopBar title="Recuperar senha" onBack={onBack} />
        <div className="flex-1 px-6 py-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            {sentVia === "email" ? <Mail size={28} /> : <Phone size={28} />}
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">
            Verifique {sentVia === "email" ? "seu e-mail" : "seu celular"}
          </h2>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
            Se houver uma conta associada a {sentVia === "email" ? "esse e-mail" : "esse número"}, enviamos as
            instruções para redefinir sua senha.
          </p>
          <PrimaryButton className="mt-8" onClick={onBack}>Voltar para o login</PrimaryButton>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title="Recuperar senha" onBack={onBack} />
      <div className="flex-1 px-6 py-8">
        <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
          Insira seu e-mail para receber as instruções de redefinição de senha.
        </p>

        <Field icon={Mail} type="email" placeholder="Insira seu e-mail" value={email} onChange={(e) => setEmail(e.target.value)} />

        <PrimaryButton className="mt-4" disabled={!email} onClick={handleContinueEmail}>
          Continuar
        </PrimaryButton>

        {!showPhone ? (
          <button
            type="button"
            onClick={() => setShowPhone(true)}
            className="w-full text-center text-[13px] text-emerald-600 font-semibold mt-4 py-1"
          >
            Encontrar pelo número do celular
          </button>
        ) : (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-[13px] text-slate-500 mb-3">Ou informe o número de celular cadastrado:</p>
            <Field
              icon={Phone}
              type="tel"
              placeholder="(69) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <PrimaryButton className="mt-4" disabled={!phone} onClick={handleContinuePhone}>
              Continuar
            </PrimaryButton>
          </div>
        )}
      </div>
    </Screen>
  );
}

function LoginScreen({ onLogin, goCadastro, goForgot, goSocial }) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState(false);

  const emailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailFormatValid && password.length > 0;

  const handleSubmit = () => {
    setTouched(true);
    if (!canSubmit) return;
    onLogin();
  };

  return (
    <Screen>
      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Briefcase className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Conexão Free</h1>
          <p className="text-slate-500 text-[13px] mt-1">Conecta Serviços Freelancer, na hora certa</p>
        </div>

        <div className="space-y-3">
          <div>
            <Field
              icon={Mail}
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {touched && email && !emailFormatValid && (
              <p className="text-[11.5px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
                <AlertTriangle size={12} /> Informe um e-mail em formato válido.
              </p>
            )}
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={show ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-white text-[15px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            />
            <button onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="text-right">
            <button onClick={goForgot} className="text-[13px] text-emerald-600 font-medium">Esqueci minha senha</button>
          </div>
          <PrimaryButton onClick={handleSubmit}>Entrar</PrimaryButton>
          {touched && !canSubmit && (
            <p className="text-[11.5px] text-red-500 font-semibold text-center flex items-center justify-center gap-1">
              <AlertTriangle size={12} /> Informe um e-mail válido e sua senha para entrar.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[12px] text-slate-400">ou entre/cadastre-se com</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => goSocial("google")} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white font-semibold text-[14px] text-slate-700 active:scale-[0.98] transition">
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">G</span>
            Google
          </button>
          <button onClick={() => goSocial("facebook")} className="flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white font-semibold text-[14px] text-slate-700 active:scale-[0.98] transition">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">f</span>
            Facebook
          </button>
        </div>

        <p className="text-center text-[13px] text-slate-500 mt-8">
          Ainda não tem conta?{" "}
          <button onClick={goCadastro} className="text-teal-600 font-bold">Cadastre-se</button>
        </p>
      </div>
    </Screen>
  );
}

function OnboardingProfile({ onSelect }) {
  const [sel, setSel] = useState(null);
  const options = [
    { id: "contratar", title: "Quero Contratar", desc: "Publicar vagas e encontrar profissionais para meus serviços.", icon: Building2 },
    { id: "trabalhar", title: "Quero Trabalhar", desc: "Encontrar serviços e diárias disponíveis perto de mim.", icon: UserCheck },
  ];
  return (
    <Screen>
      <div className="flex-1 flex flex-col px-6 py-10 justify-center">
        <h2 className="text-xl font-extrabold text-slate-800 text-center">Como você vai usar a Conexão Free?</h2>
        <p className="text-[13px] text-slate-500 text-center mt-1.5 mb-8">Você poderá alternar isso a qualquer momento no seu perfil</p>
        <div className="space-y-3">
          {options.map((o) => {
            const Icon = o.icon;
            const active = sel === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setSel(o.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 flex items-center gap-4 transition ${
                  active ? "border-emerald-600 bg-emerald-50/60" : "border-slate-200 bg-white"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-[15px]">{o.title}</p>
                  <p className="text-[12.5px] text-slate-500 mt-0.5 leading-snug">{o.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        <PrimaryButton className="mt-8" disabled={!sel} onClick={() => onSelect(sel)}>
          Continuar
        </PrimaryButton>
      </div>
    </Screen>
  );
}

function DocumentSelection({ onNext, onBack }) {
  const [type, setType] = useState("cpf");
  return (
    <Screen>
      <TopBar title="Documento" onBack={onBack} />
      <div className="flex-1 px-6 py-6">
        <p className="text-[13px] text-slate-500 mb-4">Selecione o tipo de cadastro para continuar</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { id: "cpf", label: "Pessoa Física", sub: "CPF" },
            { id: "cnpj", label: "Empresa", sub: "CNPJ" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`p-4 rounded-2xl border-2 text-left transition ${type === t.id ? "border-teal-500 bg-teal-50/60" : "border-slate-200 bg-white"}`}
            >
              <p className="font-bold text-slate-800 text-[14px]">{t.label}</p>
              <p className="text-[12px] text-slate-500">{t.sub}</p>
            </button>
          ))}
        </div>
        <Field placeholder={type === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"} />
        <PrimaryButton className="mt-8" onClick={onNext}>Continuar</PrimaryButton>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/*  LIVE CAMERA CAPTURE (verificação de identidade por selfie ao vivo) */
/* ------------------------------------------------------------------ */

function CameraCaptureModal({ title, hint, onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState(null);

  useEffect(() => {
    let active = true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador não tem suporte a acesso à câmera.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        if (active) setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
      });
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopStream = () => streamRef.current?.getTracks().forEach((t) => t.stop());

  const handleShoot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    setCaptured(canvas.toDataURL("image/jpeg", 0.9));
  };

  const handleConfirm = () => {
    stopStream();
    onCapture(captured);
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-slate-900 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <p className="text-white font-bold text-[13.5px]">{title}</p>
          <button type="button" onClick={handleClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="relative bg-black aspect-[3/4] flex items-center justify-center">
          {error ? (
            <p className="text-red-400 text-[12px] text-center px-6 leading-snug">{error}</p>
          ) : captured ? (
            <img src={captured} alt="Selfie capturada" className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <p className="text-slate-400 text-[11px] text-center px-5 py-2 leading-snug">{hint}</p>

        <div className="flex gap-2 p-4 pt-1">
          {!error && !captured && (
            <button
              type="button"
              onClick={handleShoot}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Camera size={16} /> Capturar foto
            </button>
          )}
          {captured && (
            <>
              <button
                type="button"
                onClick={() => setCaptured(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[13px] py-3 rounded-xl"
              >
                Tirar novamente
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Check size={16} /> Usar esta foto
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SecurityVerification({ onNext, onBack }) {
  const [doc, setDoc] = useState(false);
  const [selfie, setSelfie] = useState(false);
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const canContinue = doc && selfie;

  const handleSelfieCapture = (photoDataUrl) => {
    setSelfiePhoto(photoDataUrl);
    setSelfie(true);
    setShowCamera(false);
  };

  return (
    <Screen>
      <TopBar title="Verificação de Segurança" onBack={onBack} />
      <div className="flex-1 px-6 py-6 space-y-6 relative">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-emerald-700 leading-snug">
            Para garantir a segurança de toda a comunidade, precisamos confirmar sua identidade. Seus dados são protegidos conforme a LGPD.
          </p>
        </div>

        <div>
          <p className="text-[13px] font-bold text-slate-700 mb-2">Documento com foto (RG ou CNH)</p>
          <UploadBox label="Foto do documento" hint="Frente legível, sem cortes" icon={FileText} done={doc} onClick={() => setDoc(true)} />
        </div>

        <div>
          <p className="text-[13px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Camera size={15} /> Selfie de verificação (ao vivo)
          </p>
          <p className="text-[11.5px] text-slate-400 mb-2.5 leading-snug">
            Por segurança, a foto é tirada agora, pela câmera do dispositivo — não é possível enviar uma imagem da galeria.
          </p>

          {selfie && selfiePhoto ? (
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-left"
            >
              <img src={selfiePhoto} alt="Selfie capturada" className="w-14 h-14 rounded-lg object-cover border border-emerald-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={14} className="shrink-0" /> Selfie verificada
                </p>
                <p className="text-[11.5px] text-emerald-600 truncate">Toque para tirar novamente</p>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/50 transition"
            >
              <Camera size={22} className="text-slate-400" />
              <span className="text-[13px] font-semibold text-slate-600">Abrir câmera e tirar selfie</span>
              <span className="text-[11px] text-slate-400">Rosto visível, boa iluminação</span>
            </button>
          )}
        </div>

        <div className="border-t border-slate-100 pt-5">
          <p className="text-[13px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Wallet size={15} /> Dados bancários para recebimento
          </p>
          <div className="space-y-2.5">
            <Field placeholder="Banco" />
            <div className="grid grid-cols-2 gap-2.5">
              <Field placeholder="Agência" />
              <Field placeholder="Conta" />
            </div>
            <Field icon={CreditCard} placeholder="Chave PIX (CPF, e-mail ou celular)" />
          </div>
        </div>

        <PrimaryButton disabled={!canContinue} onClick={onNext}>Continuar</PrimaryButton>
      </div>

      {showCamera && (
        <CameraCaptureModal
          title="Selfie de verificação"
          hint="Centralize o rosto no quadro e mantenha boa iluminação antes de capturar."
          onCapture={handleSelfieCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </Screen>
  );
}

const SKILL_OPTIONS = [
  "Garçom", "Bartender", "Cozinheiro(a)", "Recepção", "Montagem de eventos",
  "Design Gráfico", "Marketing Digital", "Edição de vídeo",
  "Maquiagem", "Cabeleireiro(a)", "Manicure/Pedicure",
  "Pedreiro(a)", "Pintor(a)", "Elétrica básica", "Encanamento",
  "Limpeza", "Motorista", "Entregas",
];

function MiniResume({ onNext, onBack, onSkip }) {
  const [photo, setPhoto] = useState(false);
  const [skills, setSkills] = useState([]);
  const toggleSkill = (s) =>
    setSkills((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <Screen>
      <TopBar title="Minicurrículo (opcional)" onBack={onBack} />
      <div className="flex-1 px-6 py-6 space-y-4">
        <p className="text-[13px] text-slate-500">
          Aumente suas chances de ser chamado. Esta etapa é opcional e pode ser preenchida depois no seu perfil.
        </p>
        <UploadBox label="Foto de perfil" hint="Uma boa foto aumenta a confiança" icon={ImagePlus} done={photo} onClick={() => setPhoto(true)} />
        <textarea
          rows={3}
          placeholder="Breve histórico profissional (ex: 3 anos como garçom em eventos...)"
          className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />

        <div>
          <p className="text-[13px] font-bold text-slate-700 mb-2">Principais competências</p>
          <p className="text-[11.5px] text-slate-400 mb-2.5">Selecione quantas quiser ou digite outras abaixo</p>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((s) => {
              const active = skills.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-[12.5px] font-semibold border transition ${
                    active ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-600"
                  }`}
                >
                  {active && <Check size={12} className="inline mr-1 -mt-0.5" />}
                  {s}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <Field placeholder="Outras competências (separadas por vírgula)" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <SecondaryButton onClick={onSkip}>Pular</SecondaryButton>
          <PrimaryButton onClick={onNext}>Salvar</PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}

function TermsScreen({ onFinish, onBack }) {
  const [accepted, setAccepted] = useState(false);
  return (
    <Screen>
      <TopBar title="Termos e Privacidade" onBack={onBack} />
      <div className="flex-1 px-6 py-6 flex flex-col">
        <div className="flex-1 overflow-y-auto max-h-72 p-4 rounded-xl bg-white border border-slate-200 text-[12.5px] text-slate-600 leading-relaxed">
          <p className="font-bold text-slate-800 mb-1.5">Termos de Uso</p>
          <p className="mb-3">
            Ao utilizar a Conexão Free você concorda com as regras de intermediação entre contratantes e prestadores de
            serviço em todo o Brasil, incluindo verificação de identidade, avaliações mútuas e uso responsável
            do chat interno.
          </p>
          <p className="font-bold text-slate-800 mb-1.5">Política de Privacidade (LGPD)</p>
          <p>
            Seus dados pessoais, documentos e dados bancários são tratados conforme a Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018), utilizados exclusivamente para validação de identidade e pagamento de diárias, e
            nunca compartilhados com terceiros sem seu consentimento. Você pode solicitar a exclusão definitiva dos
            seus dados a qualquer momento nas Configurações da Conta.
          </p>
        </div>
        <label className="flex items-start gap-2.5 mt-4">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 w-4 h-4 accent-emerald-600" />
          <span className="text-[12.5px] text-slate-600">Li e aceito os Termos de Uso e a Política de Privacidade, conforme a LGPD.</span>
        </label>
        <PrimaryButton className="mt-6" disabled={!accepted} onClick={onFinish}>
          Concluir cadastro
        </PrimaryButton>
      </div>
    </Screen>
  );
}

function MyWorkHistoryScreen({ onBack }) {
  const history = MY_WORK_HISTORY;
  const avgRating = history.length
    ? (history.reduce((sum, h) => sum + h.rating, 0) / history.length).toFixed(1)
    : "—";
  return (
    <Screen>
      <TopBar title="Histórico de Trabalho" onBack={onBack} />
      <div className="flex-1 px-5 py-6 space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <History size={24} />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-slate-800 text-[15px]">{history.length} serviços realizados</p>
            <p className="text-[12.5px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Star size={13} className="text-teal-500" fill="currentColor" />
              Nota média: <span className="font-semibold text-slate-700">{avgRating}</span>
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <History size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nenhum serviço concluído ainda</h3>
            <p className="text-[12.5px] text-slate-500 mt-1">
              Quando você concluir uma diária, ela aparecerá aqui com a avaliação recebida.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
              <History size={14} /> Todos os serviços que você já realizou
            </p>
            <div className="space-y-2.5">
              {history.map((h, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-[13.5px] leading-snug break-words min-w-0">{h.title}</p>
                    <div className="flex items-center gap-1 shrink-0 text-teal-500 font-bold text-[13px]">
                      <Star size={13} fill="currentColor" /> {h.rating}.0
                    </div>
                  </div>
                  <p className="text-[11.5px] text-slate-500 mt-1 truncate">{h.contractor} · {h.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}

function EditProfileScreen({ mode, profile, onSave, onBack }) {
  const isCompany = mode === "contratar";
  const [name, setName] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [city, setCity] = useState(profile.city || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [hasPhoto, setHasPhoto] = useState(profile.hasPhoto || false);
  const [skills, setSkills] = useState(profile.competencies || []);

  const toggleSkill = (s) => setSkills((arr) => (arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]));

  const handleSave = () => {
    onSave({ name, email, phone, city, bio, hasPhoto, competencies: skills });
    onBack();
  };

  return (
    <Screen>
      <TopBar title="Editar Perfil" onBack={onBack} />
      <div className="flex-1 px-6 py-6 space-y-4">
        <p className="text-[12.5px] text-slate-500 leading-relaxed">
          {isCompany
            ? "Essas informações aparecem para os profissionais quando visualizam sua empresa."
            : "Essas informações aparecem para contratantes quando visualizam seu perfil."}
        </p>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setHasPhoto(true)}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center border-2 border-dashed transition ${
              hasPhoto ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-slate-50"
            }`}
          >
            {hasPhoto ? (
              isCompany ? <Building2 size={28} className="text-emerald-500" /> : <Check size={26} className="text-emerald-500" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-slate-400">
                <ImagePlus size={22} />
                <span className="text-[10px] font-medium">{isCompany ? "Logo da empresa" : "Foto de perfil"}</span>
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white">
              <Camera size={13} />
            </span>
          </button>
        </div>

        <Field icon={isCompany ? Building2 : User} placeholder={isCompany ? "Nome da empresa" : "Nome completo"} value={name} onChange={(e) => setName(e.target.value)} />
        <Field icon={Mail} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field icon={Phone} type="tel" placeholder="Número de celular" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Field icon={MapPin} placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />

        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">{isCompany ? "Sobre a empresa" : "Sobre você"}</p>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={isCompany ? "Conte um pouco sobre o negócio..." : "Conte um pouco sobre sua experiência..."}
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        {!isCompany && (
          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-2">Principais competências</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border-2 transition ${
                    skills.includes(s) ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {skills.includes(s) && <Check size={11} className="inline mr-1 -mt-0.5" />}
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <PrimaryButton className="mt-2" onClick={handleSave}>Salvar alterações</PrimaryButton>
      </div>
    </Screen>
  );
}

function AccountScreen({ mode, setMode, onDelete, onBack, onLogout, onOpenHistory, onOpenApplications, onOpenDiarias, profile, onEditProfile }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  if (confirming) {
    return (
      <Screen>
        <TopBar title="Excluir Conta" onBack={() => setConfirming(false)} />
        <div className="flex-1 px-6 py-8 flex flex-col">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <AlertTriangle size={26} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">Isso é permanente</h2>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
            Ao confirmar, seus dados cadastrais, documentos, dados bancários e histórico serão apagados
            definitivamente da Conexão Free, conforme previsto na LGPD. Essa ação não pode ser desfeita.
          </p>
          <p className="text-[12.5px] font-semibold text-slate-600 mt-6 mb-2">Digite EXCLUIR para confirmar</p>
          <Field placeholder="EXCLUIR" value={typed} onChange={(e) => setTyped(e.target.value.toUpperCase())} />
          <div className="flex-1" />
          <button
            disabled={typed !== "EXCLUIR"}
            onClick={onDelete}
            className="w-full py-3.5 rounded-xl bg-red-500 text-white font-bold disabled:opacity-40 flex items-center justify-center gap-2 mt-6"
          >
            <Trash2 size={17} /> Excluir conta permanentemente
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title="Minha Conta" onBack={onBack} />
      <div className="flex-1 px-5 py-6 space-y-6">
        <button
          type="button"
          onClick={onEditProfile}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 text-left relative"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-lg shrink-0">
            {mode === "contratar" ? <Building2 size={24} /> : (profile.name?.[0] || "V").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-800 truncate">{profile.name || "Você"}</p>
            <p className="text-[12px] text-slate-500 truncate">
              {profile.city || "Brasil"} · {mode === "contratar" ? "Empresa verificada" : "Verificado"}{" "}
              <BadgeCheck size={12} className="inline text-emerald-500 -mt-0.5" />
            </p>
          </div>
          <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Pencil size={14} />
          </span>
        </button>

        <div>
          <p className="text-[13px] font-bold text-slate-700 mb-2">Tipo de perfil</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: "contratar", label: "Contratar" },
              { id: "trabalhar", label: "Trabalhar" },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => setMode(o.id)}
                className={`py-3 rounded-xl border-2 font-semibold text-[13.5px] transition ${
                  mode === o.id ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="text-[11.5px] text-slate-400 mt-1.5">Alterne quando quiser, sem precisar de novo cadastro.</p>
        </div>

        <div className="space-y-2">
          {[
            { icon: Briefcase, label: "Minhas candidaturas", onClick: onOpenApplications },
            { icon: Calendar, label: "Minhas diárias", onClick: onOpenDiarias },
            { icon: History, label: "Histórico de trabalho", onClick: onOpenHistory },
            { icon: FileText, label: "Dados bancários e PIX" },
            { icon: ShieldCheck, label: "Documentos de verificação" },
            { icon: Settings, label: "Preferências de notificação" },
          ].map((it, i) => {
            const Icon = it.icon;
            return (
              <button key={i} onClick={it.onClick} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-100">
                <Icon size={17} className="text-slate-500" />
                <span className="text-[13.5px] font-medium text-slate-700 flex-1 text-left">{it.label}</span>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-2">
          <button onClick={onLogout} className="w-full flex items-center gap-2.5 p-3.5 rounded-xl text-slate-500 font-medium text-[13.5px]">
            <LogOut size={17} /> Sair da conta
          </button>
          <button onClick={() => setConfirming(true)} className="w-full flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 text-red-500 font-bold text-[13.5px]">
            <Trash2 size={17} /> Excluir conta permanentemente
          </button>
        </div>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/*  MODULE 2 — FEED / PUBLICAÇÃO                                       */
/* ------------------------------------------------------------------ */

function JobCard({ job, onOpen, saved = false, onToggleSave = () => {} }) {
  const statusTone = job.status === "Disponível" ? "green" : job.status === "Em Negociação" ? "orange" : job.status === "Concluída" ? "slate" : "blue";
  const isMine = job.candidate === "Você";
  const applicationLabel = job.status === "Em Atendimento" ? "Candidatado" : job.status === "Em Negociação" ? "Em análise" : null;

  return (
    <div className="relative">
      <button
        onClick={() => onToggleSave(job.id)}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border transition ${
          saved ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white/90 border-slate-200 text-slate-400"
        }`}
      >
        <Bookmark size={15} fill={saved ? "currentColor" : "none"} />
      </button>

      <button
        onClick={() => onOpen(job)}
        className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md active:scale-[0.99] transition flex flex-col justify-between h-full p-4"
      >
        {/* Topo do card */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2.5 pr-8">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Pill tone="blue">{job.category}</Pill>
              {job.urgent && <Pill tone="orange">Urgente</Pill>}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <Pill tone={statusTone}>{job.status}</Pill>
            {isMine && applicationLabel && <Pill tone="slate">{applicationLabel}</Pill>}
          </div>

          <h3 className="font-bold text-slate-800 text-[14.5px] leading-snug break-words mt-1.5">{job.title}</h3>

          <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mt-1.5">
            <span className="font-medium text-slate-600">{job.contractor}</span>
            {job.verified && <BadgeCheck size={13} className="text-emerald-500 shrink-0" />}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-500">
              {job.experience}
            </span>
          </div>

          <div className="space-y-1.5 text-[12px] text-slate-500 border-t border-slate-100 pt-3 mt-3">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{job.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{job.neighborhood} · {job.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={13} className="text-slate-400 shrink-0" />
              <span className="truncate">{job.candidatesCount} candidato{job.candidatesCount === 1 ? "" : "s"} inscrito{job.candidatesCount === 1 ? "" : "s"}</span>
            </div>
          </div>
        </div>

        {/* Rodapé do card */}
        <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">Valor diária</span>
            <span className="text-[17px] font-extrabold text-emerald-700">R$ {job.value}</span>
          </div>
          <span className="bg-emerald-600 text-white text-[12px] font-bold px-4 py-2 rounded-lg">Ver oportunidade</span>
        </div>
      </button>
    </div>
  );
}

function ProfessionalCard({ p, onOpen }) {
  return (
    <button
      onClick={() => onOpen(p)}
      className="w-full h-full text-left bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md active:scale-[0.99] transition flex items-center gap-3"
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center shrink-0">{p.avatar}</div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-800 text-[14px] truncate">{p.name}</p>
        <p className="text-[12px] text-slate-500 truncate">{p.skills}</p>
      </div>
      <div className="flex items-center gap-1 text-[13px] font-bold text-teal-500 shrink-0">
        <Star size={14} fill="currentColor" /> {p.rating}
      </div>
      <ChevronRight size={16} className="text-slate-300 shrink-0" />
    </button>
  );
}

function PublishModal({ onClose, onPublish }) {
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0].label,
    value: "",
    dateISO: "",
    timeLabel: "",
    neighborhood: "",
    city: "",
    state: "RO",
    phone: "",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const canSubmit = form.title && form.value && form.dateISO && form.neighborhood && form.city;

  return (
    <div className="absolute inset-0 z-50 bg-black/40 flex items-end">
      <div className="w-full bg-white rounded-t-3xl p-6 max-h-[88%] overflow-y-auto">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-[16px] font-extrabold text-slate-800 flex-1">+ Publicar Vaga</h2>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="space-y-3">
          <Field placeholder="Título do serviço (ex: Garçom, Cozinheiro, Designer)" value={form.title} onChange={set("title")} />

          <div>
            <p className="text-[11.5px] font-semibold text-slate-500 mb-1.5">Categoria</p>
            <select
              value={form.category}
              onChange={set("category")}
              className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.label}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Field placeholder="Valor sugerido (R$)" value={form.value} onChange={set("value")} />
            <div>
              <p className="text-[11.5px] font-semibold text-slate-500 mb-1.5">Data do serviço</p>
              <input
                type="date"
                value={form.dateISO}
                onChange={set("dateISO")}
                className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>
          <Field placeholder="Horário (ex: 18h às 23h)" value={form.timeLabel} onChange={set("timeLabel")} />

          <Field icon={Phone} type="tel" placeholder="WhatsApp para contato (ex: 69 99999-9999)" value={form.phone} onChange={set("phone")} />

          <Field placeholder="Bairro / Região" value={form.neighborhood} onChange={set("neighborhood")} />
          <div className="grid grid-cols-2 gap-2.5">
            <Field placeholder="Cidade" value={form.city} onChange={set("city")} />
            <select
              value={form.state}
              onChange={set("state")}
              className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {STATES.filter((s) => s !== "Todos").map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            O endereço exato só é liberado para o candidato aprovado — no mural fica visível apenas o bairro/região.
          </p>

          <textarea rows={3} placeholder="Detalhes do serviço (opcional)" className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40" />
        </div>
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <button type="button" onClick={onClose} className="py-3.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-[13.5px]">
            Cancelar
          </button>
          <OrangeButton disabled={!canSubmit} onClick={() => onPublish(form)}>
            Confirmar e Publicar
          </OrangeButton>
        </div>
      </div>
    </div>
  );
}

function FilterModal({ city, state, minValue, period, maxDistance, date, onClose, onApply }) {
  const [localCity, setLocalCity] = useState(city);
  const [localState, setLocalState] = useState(state);
  const [localMinValue, setLocalMinValue] = useState(minValue);
  const [localPeriod, setLocalPeriod] = useState(period);
  const [localMaxDistance, setLocalMaxDistance] = useState(maxDistance);
  const [localDate, setLocalDate] = useState(date);

  const clearAll = () => {
    setLocalCity("Todas");
    setLocalState("Todos");
    setLocalMinValue("");
    setLocalPeriod("Qualquer");
    setLocalMaxDistance("Qualquer");
    setLocalDate("");
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/40 flex items-end">
      <div className="w-full bg-white rounded-t-3xl p-6 max-h-[88%] overflow-y-auto">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-extrabold text-slate-800">Filtrar vagas</h2>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Cidade</p>
              <select
                value={localCity}
                onChange={(e) => setLocalCity(e.target.value)}
                className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Estado</p>
              <select
                value={localState}
                onChange={(e) => setLocalState(e.target.value)}
                className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Valor mínimo da diária (R$)</p>
            <input
              type="number"
              min="0"
              placeholder="Ex: 150"
              value={localMinValue}
              onChange={(e) => setLocalMinValue(e.target.value)}
              className="w-full py-3 px-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Data do serviço</p>
            <div className="relative">
              <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
                className="w-full py-3 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-[14px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            {localDate && (
              <button
                type="button"
                onClick={() => setLocalDate("")}
                className="text-[11.5px] text-emerald-600 font-semibold mt-1.5"
              >
                Limpar data
              </button>
            )}
          </div>

          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Período do dia</p>
            <div className="flex gap-2">
              {["Qualquer", ...PERIODS].map((p) => (
                <button
                  key={p}
                  onClick={() => setLocalPeriod(p)}
                  className={`flex-1 py-2 rounded-xl text-[12.5px] font-bold border-2 transition ${
                    localPeriod === p ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Distância máxima</p>
            <div className="flex gap-2">
              {["Qualquer", 5, 10, 20].map((d) => (
                <button
                  key={d}
                  onClick={() => setLocalMaxDistance(d)}
                  className={`flex-1 py-2 rounded-xl text-[12.5px] font-bold border-2 transition ${
                    localMaxDistance === d ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
                  }`}
                >
                  {d === "Qualquer" ? d : `${d} km`}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <SecondaryButton onClick={clearAll}>Limpar</SecondaryButton>
          <PrimaryButton onClick={() => onApply({ city: localCity, state: localState, minValue: localMinValue, period: localPeriod, maxDistance: localMaxDistance, date: localDate })}>
            Aplicar filtros
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function MyJobCard({ job, onOpen, onDelete }) {
  const statusTone = job.status === "Disponível" ? "green" : job.status === "Em Negociação" ? "orange" : job.status === "Concluída" ? "slate" : "blue";
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-full p-4">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Pill tone="blue">{job.category}</Pill>
          <Pill tone={statusTone}>{job.status}</Pill>
        </div>
        <h3 className="font-bold text-slate-800 text-[14.5px] leading-snug break-words">{job.title}</h3>
        <div className="space-y-1.5 text-[12px] text-slate-500 border-t border-slate-100 pt-3 mt-3">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{job.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">{job.neighborhood} · {job.city}</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between gap-2">
        <span className="text-[16px] font-extrabold text-emerald-700">R$ {job.value}</span>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => onOpen(job)} className="px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-bold">
            Gerenciar
          </button>
          <button onClick={() => onDelete(job)} className="p-2 rounded-lg bg-red-50 text-red-500">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedScreen({ mode, jobs, onOpenJob, onPublish, onDeleteJob, onOpenProfile, savedJobIds, onToggleSave, unreadNotifications, onOpenNotifications, onViewProfile, onLogout, profile }) {
  const [tab, setTab] = useState("vagas");
  const [showPublish, setShowPublish] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("Todas");
  const [state, setState] = useState("Todos");
  const [minValue, setMinValue] = useState("");
  const [period, setPeriod] = useState("Qualquer");
  const [maxDistance, setMaxDistance] = useState("Qualquer");
  const [date, setDate] = useState("");
  const tabsScrollRef = useRef(null);
  const tabsDrag = useRef({ isDown: false, startX: 0, scrollLeft: 0, moved: false });

  const handleTabsPointerDown = (e) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    tabsDrag.current = { isDown: true, startX: e.pageX, scrollLeft: el.scrollLeft, moved: false };
  };
  const handleTabsPointerMove = (e) => {
    const el = tabsScrollRef.current;
    if (!el || !tabsDrag.current.isDown) return;
    const delta = e.pageX - tabsDrag.current.startX;
    if (Math.abs(delta) > 3) tabsDrag.current.moved = true;
    el.scrollLeft = tabsDrag.current.scrollLeft - delta;
  };
  const endTabsDrag = () => {
    tabsDrag.current.isDown = false;
  };

  const catScrollRef = useRef(null);

  const openJobs = jobs.filter((j) => j.status !== "Em Atendimento" && j.status !== "Concluída");
  const visibleJobs = openJobs
    .filter((j) => category === "all" || j.category === category)
    .filter((j) => city === "Todas" || j.city === city)
    .filter((j) => state === "Todos" || j.state === state)
    .filter((j) => !minValue || j.value >= Number(minValue))
    .filter((j) => period === "Qualquer" || j.period === period)
    .filter((j) => maxDistance === "Qualquer" || j.distanceKm <= maxDistance)
    .filter((j) => !date || j.dateISO === date);
  const myJobs = jobs.filter((j) => j.contractor === "Você");
  const favoriteJobs = jobs.filter((j) => savedJobIds.includes(j.id));
  const activeCategoryLabel = category === "all" ? null : CATEGORIES.find((c) => c.label === category)?.label;
  const activeFilterCount =
    (city !== "Todas" ? 1 : 0) +
    (state !== "Todos" ? 1 : 0) +
    (minValue ? 1 : 0) +
    (period !== "Qualquer" ? 1 : 0) +
    (maxDistance !== "Qualquer" ? 1 : 0) +
    (date ? 1 : 0);
  const clearAll = () => {
    setCategory("all");
    setCity("Todas");
    setState("Todos");
    setMinValue("");
    setPeriod("Qualquer");
    setMaxDistance("Qualquer");
    setDate("");
  };

  const tabs = [
    { id: "vagas", label: "Mural de Vagas" },
    ...(mode === "contratar" ? [{ id: "minhas", label: "Minhas Vagas Criadas" }] : []),
    ...(mode === "trabalhar" ? [{ id: "favoritas", label: "Favoritas" }] : []),
    { id: "pros", label: "Profissionais Disponíveis" },
  ];

  return (
    <Screen>
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between px-5 pt-5 gap-2">
          <div className="min-w-0">
            <p className="text-[12px] text-slate-400 truncate">{city !== "Todas" ? `${city}${state !== "Todos" ? `, ${state}` : ""}` : "Todo o Brasil"}</p>
            <div className="flex items-center gap-1.5 -mt-0.5">
              <h1 className="text-lg font-extrabold text-slate-800">Conexão Free</h1>
              {mode === "contratar" && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold">
                  <Building2 size={10} /> Empresa
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onOpenNotifications} className="relative w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Bell size={17} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-emerald-500 border-2 border-white text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <UserAvatarMenu onViewProfile={onViewProfile} onLogout={onLogout} mode={mode} name={profile?.name} />
          </div>
        </div>
        <div
          ref={tabsScrollRef}
          onMouseDown={handleTabsPointerDown}
          onMouseMove={handleTabsPointerMove}
          onMouseUp={endTabsDrag}
          onMouseLeave={endTabsDrag}
          className="flex gap-1 px-5 mt-4 pb-3 overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (tabsDrag.current.moved) return;
                setTab(t.id);
              }}
              className={`shrink-0 px-3.5 py-2.5 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition ${
                tab === t.id ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "bg-slate-100 text-slate-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative pb-6">
        {tab !== "minhas" && tab !== "favoritas" && (
          <>
            {/* Serviços por área */}
            <div className="px-5 pt-5 flex items-center justify-between">
              <p className="text-[13px] font-bold text-slate-700">Serviços por área</p>
            </div>
            <div className="relative mt-2">
              <button
                onClick={() => catScrollRef.current?.scrollBy({ left: -160, behavior: "smooth" })}
                className="flex absolute left-1 top-7 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-500"
              >
                <ChevronLeft size={16} />
              </button>
              <div ref={catScrollRef} className="flex gap-4 px-5 overflow-x-auto no-scrollbar scroll-smooth">
                <button onClick={() => setCategory("all")} className="flex flex-col items-center gap-1.5 shrink-0 w-[68px]">
                  <div
                    className={`w-14 h-14 rounded-2xl border shadow-sm flex items-center justify-center transition ${
                      category === "all" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-100 text-emerald-600"
                    }`}
                  >
                    <SlidersHorizontal size={20} />
                  </div>
                  <span className={`block w-full text-[10px] text-center leading-tight font-medium break-words ${category === "all" ? "text-emerald-700" : "text-slate-600"}`}>
                    Todas
                  </span>
                </button>
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const active = category === c.label;
                  return (
                    <button key={c.id} onClick={() => setCategory(c.label)} className="flex flex-col items-center gap-1.5 shrink-0 w-[68px]">
                      <div
                        className={`w-14 h-14 rounded-2xl border shadow-sm flex items-center justify-center transition ${
                          active ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-100 text-emerald-600"
                        }`}
                      >
                        <Icon size={22} />
                      </div>
                      <span className={`block w-full text-[10px] text-center leading-tight font-medium break-words ${active ? "text-emerald-700" : "text-slate-600"}`}>
                        {c.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => catScrollRef.current?.scrollBy({ left: 160, behavior: "smooth" })}
                className="flex absolute right-1 top-7 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-500"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Filter bar */}
            <div className="px-5 mt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-1.5 shrink-0 px-3.5 py-2 rounded-full border-2 border-emerald-600 text-emerald-700 text-[12.5px] font-bold bg-emerald-50"
              >
                <SlidersHorizontal size={13} /> Filtros
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
              {city !== "Todas" && (
                <span className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold">
                  <MapPin size={12} className="shrink-0" /> <span className="truncate max-w-[110px]">{city}</span>
                  <button onClick={() => setCity("Todas")}><X size={12} /></button>
                </span>
              )}
              {state !== "Todos" && (
                <span className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold">
                  {state}
                  <button onClick={() => setState("Todos")}><X size={12} /></button>
                </span>
              )}
              {minValue && (
                <span className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold">
                  Min. R$ {minValue}
                  <button onClick={() => setMinValue("")}><X size={12} /></button>
                </span>
              )}
              {period !== "Qualquer" && (
                <span className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold">
                  {period}
                  <button onClick={() => setPeriod("Qualquer")}><X size={12} /></button>
                </span>
              )}
              {maxDistance !== "Qualquer" && (
                <span className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold">
                  Até {maxDistance} km
                  <button onClick={() => setMaxDistance("Qualquer")}><X size={12} /></button>
                </span>
              )}
              {date && (
                <span className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold">
                  {new Date(date + "T00:00:00").toLocaleDateString("pt-BR")}
                  <button onClick={() => setDate("")}><X size={12} /></button>
                </span>
              )}
            </div>
          </>
        )}

        {/* List */}
        <div className="px-5 mt-5">
          {tab === "vagas" && (
            <div className="flex items-center justify-between mb-3 gap-2">
              <p className="text-[12.5px] font-bold text-slate-600 truncate">
                {activeCategoryLabel ? `Vagas em ${activeCategoryLabel}` : "Todas as vagas"}
                <span className="text-slate-400 font-medium"> · {visibleJobs.length}</span>
              </p>
              {(activeCategoryLabel || activeFilterCount > 0) && (
                <button onClick={clearAll} className="shrink-0 text-[12px] font-semibold text-teal-600 flex items-center gap-1">
                  <X size={12} /> Limpar
                </button>
              )}
            </div>
          )}
          {tab === "minhas" && (
            <p className="text-[12.5px] font-bold text-slate-600 mb-3">
              Vagas publicadas por você <span className="text-slate-400 font-medium">· {myJobs.length}</span>
            </p>
          )}
          {tab === "favoritas" && (
            <p className="text-[12.5px] font-bold text-slate-600 mb-3">
              Vagas favoritadas <span className="text-slate-400 font-medium">· {favoriteJobs.length}</span>
            </p>
          )}

          {tab === "vagas" && (
            visibleJobs.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleJobs.map((j) => (
                  <JobCard key={j.id} job={j} onOpen={onOpenJob} saved={savedJobIds.includes(j.id)} onToggleSave={onToggleSave} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-[13px] font-semibold text-slate-500">Nenhuma vaga encontrada com esses filtros</p>
                <button onClick={clearAll} className="text-[12.5px] text-emerald-600 font-bold mt-1">Limpar filtros</button>
              </div>
            )
          )}

          {tab === "minhas" && (
            myJobs.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myJobs.map((j) => <MyJobCard key={j.id} job={j} onOpen={onOpenJob} onDelete={onDeleteJob} />)}
              </div>
            ) : (
              <div className="text-center py-10">
                <Briefcase size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[13px] font-semibold text-slate-500">Você ainda não publicou nenhuma vaga</p>
                <button onClick={() => setShowPublish(true)} className="text-[12.5px] text-emerald-600 font-bold mt-1">Publicar a primeira vaga</button>
              </div>
            )
          )}

          {tab === "pros" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROFESSIONALS.map((p) => <ProfessionalCard key={p.id} p={p} onOpen={onOpenProfile} />)}
            </div>
          )}

          {tab === "favoritas" && (
            favoriteJobs.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteJobs.map((j) => (
                  <JobCard key={j.id} job={j} onOpen={onOpenJob} saved={true} onToggleSave={onToggleSave} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Bookmark size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[13px] font-semibold text-slate-500">Você ainda não favoritou nenhuma vaga</p>
                <p className="text-[12px] text-slate-400 mt-1">Toque no ícone de marcador em um card para salvá-lo aqui.</p>
              </div>
            )
          )}
        </div>
      </div>

      {mode === "contratar" && (
        <button
          onClick={() => setShowPublish(true)}
          className="absolute bottom-24 right-5 z-30 flex items-center gap-2 bg-teal-500 text-white px-5 py-3.5 rounded-full shadow-xl shadow-teal-500/30 font-bold text-[13.5px] active:scale-95 transition"
        >
          <Plus size={18} /> Publicar Vaga
        </button>
      )}

      {showPublish && (
        <PublishModal
          onClose={() => setShowPublish(false)}
          onPublish={(formData) => {
            setShowPublish(false);
            onPublish(formData);
          }}
        />
      )}

      {showFilters && (
        <FilterModal
          city={city}
          state={state}
          minValue={minValue}
          period={period}
          maxDistance={maxDistance}
          date={date}
          onClose={() => setShowFilters(false)}
          onApply={(f) => {
            setCity(f.city);
            setState(f.state);
            setMinValue(f.minValue);
            setPeriod(f.period);
            setMaxDistance(f.maxDistance);
            setDate(f.date);
            setShowFilters(false);
          }}
        />
      )}
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/*  MODULE 3 — GEOLOCALIZAÇÃO / NOTIFICAÇÕES / MAPA                    */
/* ------------------------------------------------------------------ */

// Distância real entre duas coordenadas (fórmula de Haversine), em km.
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function MapScreen({ jobs, pushToast, onOpenJob }) {
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const MAX_RADIUS = 150;
  const MIN_RADIUS = 1;
  // Escala não linear (raiz quadrada) para o círculo visual: mantém boa
  // diferenciação em distâncias curtas sem estourar o quadro do mapa
  // quando o usuário seleciona valores próximos de 150 km.
  const visualDiameter = 24 + Math.sqrt(radius / MAX_RADIUS) * (230 - 24);

  const handleUseLocation = () => {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Este navegador não tem suporte a geolocalização.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocating(false);
        pushToast({ title: "Localização obtida ✅", body: "As vagas agora mostram a distância real até você." });
      },
      () => {
        setLocating(false);
        setLocationError("Não foi possível obter sua localização. Verifique a permissão do navegador.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Quando a localização real do usuário está disponível, a distância de
  // cada vaga é recalculada com coordenadas de verdade (Haversine); caso
  // contrário, usa a distância simulada (distanceKm) dos dados mock.
  const jobsWithDistance = jobs.map((j) => {
    const distance =
      userLocation && typeof j.lat === "number" && typeof j.lng === "number"
        ? haversineDistanceKm(userLocation.lat, userLocation.lng, j.lat, j.lng)
        : j.distanceKm;
    return { ...j, effectiveDistance: distance };
  });

  const nearbyJobs = jobsWithDistance
    .filter((j) => j.status !== "Em Atendimento" && j.status !== "Concluída")
    .filter((j) => typeof j.effectiveDistance === "number" && j.effectiveDistance <= radius)
    .sort((a, b) => a.effectiveDistance - b.effectiveDistance);

  // Posiciona cada pin dentro do círculo do raio: ângulo distribuído pelo
  // ângulo áureo (evita pins empilhados) e distância do centro proporcional
  // à distância real da vaga em relação ao raio selecionado.
  const pinnedJobs = nearbyJobs.map((j) => {
    const angleRad = ((j.id * 137.508) % 360) * (Math.PI / 180);
    const distRatio = radius > 0 ? Math.min(j.effectiveDistance / radius, 1) : 0;
    const reach = 10 + distRatio * 36;
    const top = Math.min(Math.max(50 + reach * Math.sin(angleRad), 8), 92);
    const left = Math.min(Math.max(50 + reach * Math.cos(angleRad), 8), 92);
    return { ...j, top: `${top}%`, left: `${left}%` };
  });

  return (
    <Screen>
      <TopBar title="Mapa de Oportunidades" />
      <div className="px-5 pt-4">
        <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
          <SlidersHorizontal size={14} /> Raio de busca: <span className="text-emerald-600">{radius} km</span>
        </p>
        <input
          type="range"
          min={MIN_RADIUS}
          max={MAX_RADIUS}
          step={1}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none bg-slate-200 accent-emerald-600 cursor-pointer"
          aria-label="Raio de busca em quilômetros"
        />
        <div className="flex justify-between text-[10.5px] text-slate-400 mt-1">
          <span>{MIN_RADIUS} km</span>
          <span>{MAX_RADIUS} km</span>
        </div>

        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating}
          className={`w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12.5px] font-bold transition ${
            userLocation ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200" : "bg-slate-100 text-slate-600 border-2 border-transparent"
          } disabled:opacity-60`}
        >
          <Navigation2 size={15} />
          {locating ? "Obtendo localização..." : userLocation ? "Localização atual em uso" : "Usar minha localização atual"}
        </button>
        {locationError && (
          <p className="text-[11.5px] text-red-500 font-semibold mt-1.5 flex items-center gap-1">
            <AlertTriangle size={12} /> {locationError}
          </p>
        )}
      </div>

      <div className="px-5 pt-4 flex-1 overflow-y-auto pb-6">
        <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-200 bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] bg-slate-50">
          <div
            className="absolute rounded-full border-2 border-emerald-400/40 bg-emerald-400/10 transition-[width,height] duration-150"
            style={{
              width: `${visualDiameter}px`, height: `${visualDiameter}px`,
              top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow" />
          {pinnedJobs.map((j) => (
            <button
              key={j.id}
              type="button"
              onClick={() => onOpenJob?.(j)}
              className="absolute -translate-x-1/2 -translate-y-full transition-all duration-200"
              style={{ top: j.top, left: j.left }}
              aria-label={`${j.title} · ${j.effectiveDistance.toFixed(1)} km`}
            >
              <MapPin size={26} className="text-teal-500 drop-shadow" fill="#99f6e4" />
            </button>
          ))}
          <span className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-white/80 px-2 py-0.5 rounded-full">
            {userLocation ? "Baseado na sua localização" : "Todo o Brasil"}
          </span>
        </div>
        <p className="text-[12px] text-slate-500 mt-3">
          {nearbyJobs.length} {nearbyJobs.length === 1 ? "vaga aberta" : "vagas abertas"} dentro de {radius} km.
        </p>

        {nearbyJobs.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {nearbyJobs.map((j) => (
              <button
                key={j.id}
                type="button"
                onClick={() => onOpenJob?.(j)}
                className="w-full text-left p-3.5 rounded-xl bg-white border border-slate-100 flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 text-[13px] leading-snug break-words">{j.title}</p>
                  <p className="text-[11.5px] text-slate-500 truncate">{j.neighborhood} — {j.city}/{j.state} · {j.effectiveDistance.toFixed(1)} km</p>
                </div>
                <p className="text-[13px] font-extrabold text-emerald-700 shrink-0">R$ {j.value}</p>
              </button>
            ))}
          </div>
        )}


        <button
          onClick={() =>
            pushToast({ title: "🔥 Vaga urgente perto de você!", body: "Garçom para evento corporativo · a 1.8 km · R$ 180" })
          }
          className="w-full mt-5 py-3 rounded-xl border-2 border-dashed border-teal-300 text-teal-600 font-semibold text-[13px]"
        >
          Simular alerta de vaga urgente
        </button>
      </div>
    </Screen>
  );
}

function NotificationsScreen({ notifications }) {
  return (
    <Screen>
      <TopBar title="Notificações" />
      <div className="flex-1 px-5 py-4 space-y-2.5">
        {notifications.length === 0 && <p className="text-[13px] text-slate-400 text-center mt-10">Nenhuma notificação ainda.</p>}
        {notifications.map((n, i) => (
          <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center shrink-0">
              <Bell size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-slate-800">{n.title}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/*  MODULE 4 — DETALHE DA VAGA / CANDIDATURA / AGENDA                  */
/* ------------------------------------------------------------------ */

function CancelReasonModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex items-end justify-center">
      <div className="w-full max-w-sm bg-white rounded-t-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-extrabold text-slate-800 text-[15px]">Cancelar negociação</h3>
          <button type="button" onClick={onClose} className="text-slate-400"><X size={20} /></button>
        </div>
        <p className="text-[12.5px] text-slate-500 mb-4 leading-relaxed">
          Você está cancelando uma diária confirmada. Tem certeza? A vaga voltará a ficar disponível no mural.
        </p>
        <p className="text-[12.5px] font-bold text-slate-600 mb-1.5">Motivo do cancelamento (opcional)</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Ex: imprevisto pessoal, conflito de horário..."
          className="w-full p-3 rounded-xl border border-slate-200 bg-white text-[13.5px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <button type="button" onClick={onClose} className="py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-[13.5px]">
            Voltar
          </button>
          <button type="button" onClick={() => onConfirm(reason)} className="py-3 rounded-xl bg-red-500 text-white font-bold text-[13.5px]">
            Confirmar cancelamento
          </button>
        </div>
      </div>
    </div>
  );
}

function JobDetail({ job, onBack, onApply, onAccept, onReopen, onGoChat, onCheckIn, onCheckOut }) {
  const isMine = job.candidate === "Você";
  const [showCancelModal, setShowCancelModal] = useState(false);
  const whatsappMessage = encodeURIComponent(
    `Olá! Vi a vaga "${job.title}" na Conexão Free e gostaria de conversar sobre ela.`
  );
  const whatsappLink = job.contractorPhone
    ? `https://wa.me/55${job.contractorPhone.replace(/\D/g, "")}?text=${whatsappMessage}`
    : null;
  return (
    <Screen>
      <TopBar title="Detalhe da vaga" onBack={onBack} />
      <div className="flex-1 px-5 py-5 space-y-5 relative">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Pill tone="blue">{job.category}</Pill>
            <Pill tone={job.status === "Disponível" ? "green" : job.status === "Em Negociação" ? "orange" : job.status === "Concluída" ? "slate" : "blue"}>{job.status}</Pill>
            {isMine && job.applicationStatus && <ApplicationStatusPill status={job.applicationStatus} />}
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 mt-2.5">{job.title}</h2>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <p className="text-[13px] text-slate-500">
              Publicado por {job.contractor} {job.verified && <BadgeCheck size={13} className="inline text-emerald-500 -mt-0.5 ml-0.5" />}
            </p>
            {job.companyRating && (
              <span className="text-[12px] text-slate-500 flex items-center gap-1">
                · <Star size={11} className="text-teal-500" fill="currentColor" /> {job.companyRating}
                <span className="text-slate-400">({job.companyRatingCount})</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[11px] text-slate-400">Valor sugerido</p>
            <p className="text-[16px] font-extrabold text-emerald-700">R$ {job.value}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[11px] text-slate-400">Data e horário</p>
            <p className="text-[13px] font-bold text-slate-700 mt-1">{job.date}</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-100">
          <p className="text-[11px] text-slate-400 mb-1.5">Localização</p>
          {job.status === "Em Atendimento" || (job.status === "Em Negociação" && isMine) ? (
            <p className="text-[13.5px] font-semibold text-slate-700 flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-500" /> {job.address} — {job.neighborhood}
            </p>
          ) : (
            <div className="relative">
              <p className="text-[13.5px] font-semibold text-slate-400 blur-[3px] select-none">{job.address}</p>
              <p className="text-[12px] text-slate-500 mt-1">Bairro: <span className="font-semibold text-slate-700">{job.neighborhood}</span></p>
              <p className="text-[10.5px] text-slate-400 mt-1 italic">Endereço exato liberado após aprovação da candidatura</p>
            </div>
          )}
        </div>

        {(job.checkInAt || job.checkOutAt) && (
          <div className="p-3.5 rounded-xl bg-white border border-slate-100 flex gap-4">
            {job.checkInAt && (
              <div>
                <p className="text-[11px] text-slate-400">Check-in</p>
                <p className="text-[13px] font-bold text-slate-700 mt-0.5">
                  {new Date(job.checkInAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            )}
            {job.checkOutAt && (
              <div>
                <p className="text-[11px] text-slate-400">Check-out</p>
                <p className="text-[13px] font-bold text-slate-700 mt-0.5">
                  {new Date(job.checkOutAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            )}
          </div>
        )}

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[#25D366] text-[#128C4A] font-bold text-[13.5px] bg-[#25D366]/10 hover:bg-[#25D366]/20 transition"
          >
            <WhatsAppIcon size={17} /> Falar com {job.contractor} no WhatsApp
          </a>
        )}

        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[12px] text-emerald-700 leading-relaxed">
          Ao clicar em "Aceitar Candidato", a vaga passa automaticamente para <b>Em Atendimento</b> e some do mural
          público. Se a negociação for cancelada, a vaga reabre sozinha.
        </div>

        <div className="pt-2 space-y-2.5">
          {job.status === "Disponível" && job.contractor === "Você" && (
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[12.5px] text-slate-500 flex items-center gap-2">
              <AlertTriangle size={15} className="text-slate-400 shrink-0" />
              Esta vaga foi publicada por você — não é possível se candidatar à própria vaga.
            </div>
          )}
          {job.status === "Disponível" && job.contractor !== "Você" && (
            <OrangeButton onClick={() => onApply(job)}>Candidatar-se à vaga</OrangeButton>
          )}

          {job.status === "Em Negociação" && !isMine && (
            <PrimaryButton onClick={() => onAccept(job)}>Aceitar candidato</PrimaryButton>
          )}

          {job.status === "Em Negociação" && isMine && (
            <div className="p-3 rounded-xl bg-teal-50 text-teal-700 text-[12.5px] font-semibold text-center">
              Aguardando o contratante aceitar sua candidatura...
            </div>
          )}

          {job.status === "Em Atendimento" && job.applicationStatus === "Diária agendada" && (
            <>
              <PrimaryButton onClick={() => onCheckIn(job)}>
                <span className="flex items-center justify-center gap-2"><MapPin size={16} /> Fazer check-in</span>
              </PrimaryButton>
              <button onClick={() => onGoChat(job)} className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-[13.5px] flex items-center justify-center gap-2">
                <MessageCircle size={16} /> Ir para o chat
              </button>
              <button onClick={() => setShowCancelModal(true)} className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-[13.5px]">
                Desistir / Cancelar negociação
              </button>
            </>
          )}

          {job.status === "Em Atendimento" && job.applicationStatus === "Em andamento" && (
            <>
              <GreenButton onClick={() => onCheckOut(job)}>
                <span className="flex items-center justify-center gap-2"><CheckCircle2 size={16} /> Fazer check-out / Finalizar diária</span>
              </GreenButton>
              <button onClick={() => onGoChat(job)} className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-[13.5px] flex items-center justify-center gap-2">
                <MessageCircle size={16} /> Ir para o chat
              </button>
            </>
          )}

          {job.status === "Em Atendimento" && !["Diária agendada", "Em andamento"].includes(job.applicationStatus) && (
            <>
              <PrimaryButton onClick={() => onGoChat(job)}>
                <span className="flex items-center justify-center gap-2"><MessageCircle size={16} /> Ir para o chat</span>
              </PrimaryButton>
              <button onClick={() => setShowCancelModal(true)} className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 font-semibold text-[13.5px]">
                Desistir / Cancelar negociação
              </button>
            </>
          )}

          {job.status === "Concluída" && (
            <div className="p-3 rounded-xl bg-slate-100 text-slate-500 text-[12.5px] font-semibold text-center">
              Diária finalizada{job.rating?.stars ? ` · você avaliou com ${job.rating.stars} estrelas` : ""}.
            </div>
          )}
        </div>

        {showCancelModal && (
          <CancelReasonModal
            onClose={() => setShowCancelModal(false)}
            onConfirm={(reason) => {
              setShowCancelModal(false);
              onReopen(job, "profissional", reason);
            }}
          />
        )}
      </div>
    </Screen>
  );
}

function AgendaScreen({ jobs, onOpenJob }) {
  const confirmed = jobs.filter((j) => j.status === "Em Atendimento");
  const pending = jobs.filter((j) => j.status === "Em Negociação");
  return (
    <Screen>
      <TopBar title="Minha Agenda" />
      <div className="flex-1 px-5 py-5 space-y-6">
        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" /> Confirmados</p>
          <div className="space-y-2.5">
            {confirmed.length === 0 && <p className="text-[12.5px] text-slate-400">Nenhum compromisso confirmado.</p>}
            {confirmed.map((j) => <JobCard key={j.id} job={j} onOpen={onOpenJob} />)}
          </div>
        </div>
        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Clock size={14} className="text-teal-500" /> Pendentes</p>
          <div className="space-y-2.5">
            {pending.length === 0 && <p className="text-[12.5px] text-slate-400">Nenhuma negociação pendente.</p>}
            {pending.map((j) => <JobCard key={j.id} job={j} onOpen={onOpenJob} />)}
          </div>
        </div>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/*  MINHAS CANDIDATURAS / MINHAS DIÁRIAS — rastreador de candidaturas  */
/* ------------------------------------------------------------------ */

function ApplicationStatusPill({ status }) {
  const map = {
    "Em análise": "orange",
    "Candidatura oficializada": "blue",
    "Diária agendada": "green",
    "Em andamento": "blue",
    "Diária concluída": "slate",
    "Finalizada": "slate",
    "Cancelada": "red",
  };
  return <Pill tone={map[status] || "slate"}>{status || "—"}</Pill>;
}

function ApplicationCard({ job, onOpen }) {
  const [dateLabel, timeLabel] = job.date.split("·").map((s) => s.trim());
  return (
    <button type="button" onClick={() => onOpen(job)} className="w-full text-left p-3.5 rounded-xl bg-white border border-slate-100">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-bold text-slate-800 text-[13.5px] leading-snug break-words min-w-0">{job.title}</p>
        <span className="shrink-0"><ApplicationStatusPill status={job.applicationStatus} /></span>
      </div>
      <p className="text-[12px] text-slate-500 truncate">{job.contractor}</p>
      <div className="flex items-center gap-3 mt-2 text-[11.5px] text-slate-500 flex-wrap">
        <span className="flex items-center gap-1 shrink-0"><Calendar size={12} /> {dateLabel}</span>
        <span className="flex items-center gap-1 shrink-0"><Clock size={12} /> {timeLabel}</span>
        <span className="flex items-center gap-1 truncate min-w-0"><MapPin size={12} className="shrink-0" /> <span className="truncate">{job.neighborhood}</span></span>
      </div>
      <p className="text-[13px] font-extrabold text-emerald-700 mt-2">R$ {job.value}</p>
    </button>
  );
}

function FilterDropdown({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border-2 border-emerald-600 bg-emerald-50 text-emerald-700 text-[12.5px] font-bold transition"
      >
        {current?.label || "Todas"}
        <ChevronRight size={14} className={`transition-transform ${open ? "rotate-90" : "rotate-0"}`} />
      </button>

      <div
        role="listbox"
        className={`absolute left-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-900/10 py-1.5 z-30 origin-top-left transition-all duration-150 ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="option"
            aria-selected={value === o.id}
            onClick={() => {
              onChange(o.id);
              setOpen(false);
            }}
            className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-[13px] text-left transition ${
              value === o.id ? "font-bold text-emerald-700 bg-emerald-50" : "font-medium text-slate-700 hover:bg-slate-50"
            }`}
          >
            {o.label}
            {value === o.id && <Check size={14} className="text-emerald-600 shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function MyApplicationsScreen({ jobs, onBack, onOpenJob }) {
  const [tab, setTab] = useState("todas");
  const myApps = jobs.filter((j) => j.candidate === "Você" && j.applicationStatus);

  const tabs = [
    { id: "todas", label: "Todas" },
    { id: "analise", label: "Em análise" },
    { id: "confirmadas", label: "Confirmadas" },
    { id: "andamento", label: "Em andamento" },
    { id: "concluidas", label: "Concluídas" },
    { id: "recusadas", label: "Recusadas" },
  ];

  const filtered = myApps.filter((j) => {
    if (tab === "todas") return true;
    if (tab === "analise") return j.applicationStatus === "Em análise";
    if (tab === "confirmadas") return ["Candidatura oficializada", "Diária agendada"].includes(j.applicationStatus);
    if (tab === "andamento") return j.applicationStatus === "Em andamento";
    if (tab === "concluidas") return ["Diária concluída", "Finalizada"].includes(j.applicationStatus);
    if (tab === "recusadas") return j.applicationStatus === "Cancelada";
    return true;
  });

  return (
    <Screen>
      <TopBar title="Minhas Candidaturas" onBack={onBack} />
      <div className="px-5 pt-3 pb-1">
        <FilterDropdown options={tabs} value={tab} onChange={setTab} />
      </div>
      <div className="flex-1 px-5 py-4 space-y-2.5 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center mt-4">
            <Briefcase size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nenhuma candidatura aqui</h3>
            <p className="text-[12.5px] text-slate-500 mt-1">Quando você se candidatar a uma vaga, ela aparecerá aqui.</p>
          </div>
        ) : (
          filtered.map((j) => <ApplicationCard key={j.id} job={j} onOpen={onOpenJob} />)
        )}
      </div>
    </Screen>
  );
}

function MyDiariasScreen({ jobs, onBack, onOpenJob }) {
  const myDiarias = jobs.filter((j) => j.candidate === "Você" && ["Diária agendada", "Em andamento"].includes(j.applicationStatus));
  const next = myDiarias[0];
  return (
    <Screen>
      <TopBar title="Minhas Diárias" onBack={onBack} />
      <div className="flex-1 px-5 py-5 space-y-6">
        {next && (
          <div>
            <p className="text-[12.5px] font-bold text-slate-600 mb-2">Próxima diária</p>
            <div className="p-4 rounded-2xl bg-white border-2 border-emerald-200">
              <p className="font-extrabold text-slate-800 text-[15px] leading-snug break-words">{next.title} — {next.contractor}</p>
              <p className="text-[13px] text-slate-500 mt-1">{next.date}</p>
              <p className="text-[13px] font-extrabold text-emerald-700 mt-1">R$ {next.value}</p>
              <p className="text-[12px] text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12} className="shrink-0" /> {next.neighborhood} — {next.city}</p>
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className={`w-2 h-2 rounded-full ${next.applicationStatus === "Em andamento" ? "bg-blue-500" : "bg-emerald-500"}`} />
                <span className="text-[12px] font-semibold text-slate-600">
                  {next.applicationStatus === "Em andamento" ? "Em andamento" : "Confirmada"}
                </span>
              </div>
              <PrimaryButton className="mt-3.5" onClick={() => onOpenJob(next)}>Ver detalhes</PrimaryButton>
            </div>
          </div>
        )}

        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2">Todas as diárias agendadas</p>
          {myDiarias.length === 0 ? (
            <p className="text-[12.5px] text-slate-400">Nenhuma diária agendada no momento.</p>
          ) : (
            <div className="space-y-2.5">
              {myDiarias.map((j) => <ApplicationCard key={j.id} job={j} onOpen={onOpenJob} />)}
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/*  MODULE 5 — CHAT / PIX / AVALIAÇÃO                                  */
/* ------------------------------------------------------------------ */

function PostJobSummaryScreen({ jobs, onDone }) {
  const completed = jobs.filter((j) => j.candidate === "Você" && j.status === "Concluída");
  const totalReceived = completed.reduce((sum, j) => sum + (Number(j.value) || 0), 0);
  const ratedJobs = completed.filter((j) => j.rating?.stars);
  const avgRating = ratedJobs.length
    ? (ratedJobs.reduce((sum, j) => sum + j.rating.stars, 0) / ratedJobs.length).toFixed(1)
    : "—";

  return (
    <Screen>
      <TopBar title="Diária concluída" onBack={onDone} />
      <div className="flex-1 px-6 py-10 flex flex-col items-center text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-lg font-extrabold text-slate-800">Mais uma diária concluída!</h2>
        <p className="text-[13px] text-slate-500 mt-2 leading-relaxed px-2">
          Você já realizou {completed.length} {completed.length === 1 ? "diária" : "diárias"} pela Conexão Free.
          Seu perfil está ficando mais completo.
        </p>

        <div className="grid grid-cols-3 gap-2.5 w-full mt-7">
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[18px] font-extrabold text-emerald-700">{completed.length}</p>
            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">diárias realizadas</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[18px] font-extrabold text-emerald-700">R$ {totalReceived}</p>
            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">recebidos</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white border border-slate-100">
            <p className="text-[18px] font-extrabold text-emerald-700 flex items-center justify-center gap-1">
              <Star size={14} fill="currentColor" /> {avgRating}
            </p>
            <p className="text-[10.5px] text-slate-400 mt-0.5 leading-tight">média das avaliações</p>
          </div>
        </div>

        <PrimaryButton className="mt-8" onClick={onDone}>Voltar ao início</PrimaryButton>
      </div>
    </Screen>
  );
}

function OfficializedScreen({ job, onBack, onConfirm }) {
  const confirmed = job.applicationStatus === "Diária agendada";
  const [dateLabel, timeLabel] = job.date.split("·").map((s) => s.trim());

  return (
    <Screen>
      <TopBar title="Candidatura Oficializada" onBack={onBack} />
      <div className="flex-1 px-5 py-6 space-y-5">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 text-3xl">
            🎉
          </div>
          <h2 className="text-lg font-extrabold text-slate-800">Candidatura Oficializada</h2>
          <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed px-4">
            Parabéns! Você foi selecionado para esta diária.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100">
          {[
            { label: "Empresa", value: job.contractor },
            { label: "Cargo/função", value: job.title },
            { label: "Data", value: dateLabel },
            { label: "Horário", value: timeLabel },
            { label: "Local", value: `${job.neighborhood} — ${job.city}/${job.state}` },
            { label: "Valor da diária", value: `R$ ${job.value}` },
            { label: "Forma de pagamento", value: "PIX, ao final do serviço" },
            { label: "Responsável", value: job.contractor },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 gap-3">
              <span className="text-[12px] text-slate-400 shrink-0">{row.label}</span>
              <span className="text-[13px] font-semibold text-slate-700 text-right break-words">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-100 text-[12px] text-teal-700 leading-relaxed">
          <span className="font-bold">Observações da empresa:</span> chegue com 15 minutos de antecedência e traga
          documento com foto para conferência na entrada.
        </div>

        <div className="flex items-center gap-2 justify-center">
          <span className={`w-2 h-2 rounded-full ${confirmed ? "bg-emerald-500" : "bg-amber-400"}`} />
          <p className="text-[12.5px] font-semibold text-slate-500">
            {confirmed ? "Diária confirmada ✅" : "Aguardando sua confirmação"}
          </p>
        </div>

        {!confirmed && (
          <PrimaryButton onClick={() => onConfirm(job)}>
            Confirmar participação
          </PrimaryButton>
        )}
      </div>
    </Screen>
  );
}

const RATING_CRITERIA = [
  { key: "organizacao", label: "Organização" },
  { key: "comunicacao", label: "Comunicação" },
  { key: "respeito", label: "Respeito" },
  { key: "cumprimento", label: "Cumprimento do combinado" },
  { key: "ambiente", label: "Ambiente de trabalho" },
  { key: "pontualidadePagamento", label: "Pontualidade no pagamento" },
];

function CriteriaStars({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star size={16} className={n <= value ? "text-emerald-500" : "text-slate-200"} fill={n <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

function RatingScreen({ job, onBack, onSubmit }) {
  const [stars, setStars] = useState(0);
  const [criteria, setCriteria] = useState(() => Object.fromEntries(RATING_CRITERIA.map((c) => [c.key, 0])));
  const [wouldWorkAgain, setWouldWorkAgain] = useState(null);
  const [comment, setComment] = useState("");

  const setCriterion = (key, value) => setCriteria((c) => ({ ...c, [key]: value }));

  return (
    <Screen>
      <TopBar title="Avaliar empresa" onBack={onBack} />
      <div className="flex-1 px-6 py-7 overflow-y-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center text-lg mb-4">
            {job.contractor.slice(0, 2).toUpperCase()}
          </div>
          <h2 className="font-extrabold text-slate-800 text-[16px]">Diária concluída! Como foi com {job.contractor}?</h2>
          <p className="text-[12.5px] text-slate-500 mt-1">Sua avaliação ajuda outros profissionais da comunidade.</p>
          <div className="flex gap-1.5 my-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setStars(n)}>
                <Star size={32} className={n <= stars ? "text-emerald-500" : "text-slate-200"} fill={n <= stars ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 mb-5">
          {RATING_CRITERIA.map((c) => (
            <div key={c.key} className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] text-slate-600">{c.label}</span>
              <CriteriaStars value={criteria[c.key]} onChange={(v) => setCriterion(c.key, v)} />
            </div>
          ))}
        </div>

        <p className="text-[13px] font-bold text-slate-700 mb-2">Você trabalharia novamente com esta empresa?</p>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {["Sim", "Talvez", "Não"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setWouldWorkAgain(opt)}
              className={`py-2.5 rounded-xl text-[13px] font-bold border-2 transition ${
                wouldWorkAgain === opt ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <p className="text-[13px] font-bold text-slate-700 mb-2">Conte como foi sua experiência (opcional)</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Deixe um comentário sobre o serviço..."
          className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />

        <GreenButton
          className="mt-6"
          disabled={!stars || !wouldWorkAgain}
          onClick={() => onSubmit({ stars, criteria, wouldWorkAgain, comment })}
        >
          Enviar avaliação
        </GreenButton>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/*  EMOJI PICKER, GRAVADOR DE ÁUDIO E PLAYER — usados nos dois chats   */
/* ------------------------------------------------------------------ */

const COMMON_EMOJIS = [
  "😀", "😂", "😍", "👍", "🙏", "🎉", "❤️", "😢", "😮", "👏",
  "🔥", "✅", "🙌", "😅", "🤝", "💪", "📍", "⏰", "💬", "👌",
  "😎", "🥳", "😴", "🤔", "👋", "💰", "📸", "⚠️", "✨", "😊",
];

function EmojiPickerPopover({ onSelect, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-64 max-h-56 overflow-y-auto bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-900/10 p-2.5 grid grid-cols-6 gap-1 z-30"
    >
      {COMMON_EMOJIS.map((emoji, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(emoji)}
          className="text-xl leading-none py-1.5 rounded-lg hover:bg-slate-50 transition"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

function VoiceRecorderButton({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    []
  );

  const startRecording = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Este navegador não tem suporte a gravação de áudio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        onRecorded(url, duration);
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start();
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    setRecording(false);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (recording) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 shrink-0">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
        <span className="text-[12.5px] font-bold text-red-600 tabular-nums">{formatTime(seconds)}</span>
        <button type="button" onClick={stopRecording} className="p-1.5 rounded-lg bg-red-500 text-white shrink-0" aria-label="Parar e enviar áudio">
          <Square size={13} fill="currentColor" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={startRecording}
        className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
        aria-label="Gravar áudio"
      >
        <Mic size={18} />
      </button>
      {error && (
        <p className="absolute bottom-full mb-1 right-0 w-48 text-[10.5px] text-red-500 bg-white border border-red-200 rounded-lg p-1.5 shadow z-20">
          {error}
        </p>
      )}
    </div>
  );
}

function AudioMessageBubble({ src, duration, mine }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl min-w-[9.5rem] ${
        mine ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${mine ? "bg-white/20" : "bg-emerald-50 text-emerald-600"}`}
        aria-label={playing ? "Pausar áudio" : "Reproduzir áudio"}
      >
        {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`h-1 rounded-full ${mine ? "bg-white/30" : "bg-slate-200"}`}>
          <div
            className={`h-1 rounded-full transition-[width] ${mine ? "bg-white" : "bg-emerald-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className="text-[11px] font-medium tabular-nums shrink-0">{formatTime(duration || 0)}</span>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
      />
    </div>
  );
}

function ChatScreen({ job, onBack, onComplete, onCancel }) {
  const [showPix, setShowPix] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [messages, setMessages] = useState([
    { id: "seed-1", from: "them", text: `Olá! Combinado então, te espero no local no dia ${job.date.split("·")[0].trim()}.` },
    { id: "seed-2", from: "me", text: "Perfeito, estarei lá! Qualquer detalhe me chama por aqui." },
  ]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendClick = () => {
    const value = text.trim();
    if (!value) return;
    try {
      setMessages((m) => [...m, { id: `msg-${Date.now()}-${m.length}`, from: "me", text: value }]);
      setText("");
    } catch (err) {
      /* nunca deixa o envio quebrar a tela inteira do chat */
    }
  };

  const handleAudioRecorded = (audioUrl, duration) => {
    setMessages((m) => [...m, { id: `msg-${Date.now()}-${m.length}`, from: "me", type: "audio", audioUrl, duration }]);
  };

  return (
    <Screen>
      <TopBar
        title={job.contractor}
        onBack={onBack}
        right={<Pill tone="green">Em Atendimento</Pill>}
      />

      <div className="mx-4 mt-3 p-3 rounded-xl bg-white border border-slate-100">
        <p className="font-bold text-slate-800 text-[13.5px] leading-snug break-words">{job.title} — {job.contractor}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[11.5px] text-slate-500 flex-wrap">
          <span className="flex items-center gap-1 shrink-0"><Calendar size={12} /> {job.date}</span>
          <span className="flex items-center gap-1 shrink-0 font-bold text-emerald-700"><Wallet size={12} /> R$ {job.value}</span>
        </div>
        <div className="mt-1.5">
          <ApplicationStatusPill status={job.applicationStatus} />
        </div>
      </div>

      <div className="mx-4 mt-2.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 p-2.5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-teal-500 text-white flex items-center justify-center text-[9px] font-bold">AD</div>
        <p className="text-[11px] text-slate-500 flex-1">Patrocinado: Rede de Parceiros Conexão Free — descontos em todo o Brasil</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative">
        {messages.map((m, i) => (
          <div key={m.id || i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            {m.type === "audio" ? (
              <AudioMessageBubble src={m.audioUrl} duration={m.duration} mine={m.from === "me"} />
            ) : (
              <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13.5px] ${m.from === "me" ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"}`}>
                {m.text}
              </div>
            )}
          </div>
        ))}
        {showPix && (
          <div className="flex justify-end">
            <div className="max-w-[80%] bg-emerald-50 border border-emerald-200 rounded-2xl rounded-br-sm px-4 py-3">
              <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5"><CreditCard size={13} /> Chave PIX compartilhada</p>
              <p className="text-[13px] font-mono text-emerald-800 mt-1">voce.conectagig@pix.com.br</p>
            </div>
          </div>
        )}
        <div ref={endRef} />

        {showCancelModal && (
          <CancelReasonModal
            onClose={() => setShowCancelModal(false)}
            onConfirm={(reason) => {
              setShowCancelModal(false);
              onCancel(job, "profissional", reason);
            }}
          />
        )}
      </div>

      <div className="px-4 pb-2">
        <div className="grid grid-cols-2 gap-2.5 mb-2.5">
          <button onClick={() => onComplete(job)} className="py-2.5 rounded-xl bg-emerald-500 text-white text-[12.5px] font-bold flex items-center justify-center gap-1.5">
            <CheckCircle2 size={15} /> Concluir serviço
          </button>
          <button onClick={() => setShowCancelModal(true)} className="py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-[12.5px] font-bold flex items-center justify-center gap-1.5">
            <X size={15} /> Cancelar
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-2">
        <button onClick={() => setShowPix(true)} className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
          <Wallet size={18} />
        </button>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            aria-label="Inserir emoji"
          >
            <Smile size={18} />
          </button>
          {showEmoji && (
            <EmojiPickerPopover
              onSelect={(emoji) => setText((t) => t + emoji)}
              onClose={() => setShowEmoji(false)}
            />
          )}
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendClick()}
          placeholder="Escreva uma mensagem..."
          className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13.5px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <VoiceRecorderButton onRecorded={handleAudioRecorded} />
        <button onClick={() => handleSendClick()} className="p-3 rounded-xl bg-emerald-600 text-white shrink-0">
          <Send size={17} />
        </button>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/*  MÓDULO EXTRA — PERFIL DO PROFISSIONAL E CHAT DIRETO                */
/* ------------------------------------------------------------------ */

function ProfessionalProfileScreen({ professional: p, onBack, onMessage }) {
  const avgFromHistory = p.history.length
    ? (p.history.reduce((sum, h) => sum + h.rating, 0) / p.history.length).toFixed(1)
    : p.rating;
  return (
    <Screen>
      <TopBar title="Perfil do profissional" onBack={onBack} />
      <div className="flex-1 px-5 py-6 space-y-6">
        {/* Cabeçalho do perfil */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center text-2xl shadow-md">
            {p.avatar}
          </div>
          <h2 className="font-extrabold text-slate-800 text-[17px] mt-3 break-words">{p.name}</h2>
          <p className="text-[12.5px] text-slate-500 mt-0.5 flex items-center gap-1">
            <MapPin size={12} className="shrink-0" /> {p.city}, {p.state}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <Star size={16} className="text-teal-500" fill="currentColor" />
            <span className="font-bold text-slate-800 text-[15px]">{avgFromHistory}</span>
            <span className="text-[12px] text-slate-400">· {p.history.length} serviços avaliados</span>
          </div>
        </div>

        {/* Competências */}
        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2">Principais competências</p>
          <div className="flex flex-wrap gap-2">
            {p.skills.split("·").map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[12px] font-semibold">
                {s.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2">Sobre</p>
          <p className="text-[13px] text-slate-600 leading-relaxed break-words">{p.bio}</p>
        </div>

        {/* Histórico de serviços */}
        <div>
          <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5">
            <History size={14} /> Histórico de diárias realizadas
          </p>
          <div className="space-y-2.5">
            {p.history.map((h, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-white border border-slate-100">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-800 text-[13.5px] leading-snug break-words min-w-0">{h.title}</p>
                  <div className="flex items-center gap-1 shrink-0 text-teal-500 font-bold text-[13px]">
                    <Star size={13} fill="currentColor" /> {h.rating}.0
                  </div>
                </div>
                <p className="text-[11.5px] text-slate-500 mt-1 truncate">{h.contractor} · {h.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botão fixo de mensagem */}
      <div className="px-5 py-4 border-t border-slate-100 bg-white">
        <PrimaryButton onClick={() => onMessage(p)}>
          <span className="flex items-center justify-center gap-2"><MessageSquare size={16} /> Enviar mensagem</span>
        </PrimaryButton>
      </div>
    </Screen>
  );
}

function timeAgo(dateObj) {
  const diffMs = Date.now() - dateObj.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}

function ChatListScreen({ conversations, onOpenConversation }) {
  const sorted = [...conversations].sort((a, b) => b.lastTime - a.lastTime);
  return (
    <Screen>
      <TopBar title="Chat" />
      <div className="flex-1 px-3 py-3">
        {sorted.length === 0 ? (
          <div className="text-center py-16 px-6">
            <MessageSquare size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-[13px] font-semibold text-slate-500">Nenhuma conversa ainda</p>
            <p className="text-[12px] text-slate-400 mt-1">
              Visite "Profissionais Disponíveis" e clique em "Enviar mensagem" para começar.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {sorted.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenConversation(c)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition text-left"
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center">
                    {c.avatar}
                  </div>
                  {c.unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 border-2 border-white text-white text-[10px] font-bold flex items-center justify-center">
                      {c.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[14px] truncate ${c.unread > 0 ? "font-extrabold text-slate-800" : "font-semibold text-slate-700"}`}>{c.name}</p>
                    <span className="text-[11px] text-slate-400 shrink-0">{timeAgo(c.lastTime)}</span>
                  </div>
                  <p className={`text-[12.5px] truncate ${c.unread > 0 ? "text-slate-700 font-semibold" : "text-slate-500"}`}>{c.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}

function ConversationChatScreen({ conversation, onBack, onSend }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages.length]);

  const handleSendClick = () => {
    const value = text.trim();
    if (!value) return;
    try {
      onSend(conversation.id, value);
      setText("");
    } catch (err) {
      /* nunca deixa o envio quebrar a tela inteira do chat */
    }
  };

  const handleAudioRecorded = (audioUrl, duration) => {
    onSend(conversation.id, { audioUrl, duration });
  };

  return (
    <Screen>
      <TopBar
        title={conversation.name}
        onBack={onBack}
        right={
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white font-bold flex items-center justify-center text-[11px]">
            {conversation.avatar}
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {conversation.messages.length === 0 ? (
          <p className="text-center text-[12px] text-slate-400 mt-6">Envie a primeira mensagem para {conversation.name}.</p>
        ) : (
          conversation.messages.map((m, i) => (
            <div key={m.id || i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              {m.type === "audio" ? (
                <AudioMessageBubble src={m.audioUrl} duration={m.duration} mine={m.from === "me"} />
              ) : (
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13.5px] break-words ${m.from === "me" ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"}`}>
                  {m.text}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
      <div className="px-4 pb-4 pt-2 flex items-center gap-2 border-t border-slate-100">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            aria-label="Inserir emoji"
          >
            <Smile size={18} />
          </button>
          {showEmoji && (
            <EmojiPickerPopover
              onSelect={(emoji) => setText((t) => t + emoji)}
              onClose={() => setShowEmoji(false)}
            />
          )}
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendClick()}
          placeholder="Escreva uma mensagem..."
          className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-slate-200 bg-white text-[13.5px] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <VoiceRecorderButton onRecorded={handleAudioRecorded} />
        <button onClick={() => handleSendClick()} className="p-3 rounded-xl bg-emerald-600 text-white shrink-0">
          <Send size={17} />
        </button>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/*  APP ROOT                                                           */
/* ------------------------------------------------------------------ */

function App() {
  const [authStep, setAuthStep] = useState("login");
  const [socialProvider, setSocialProvider] = useState(null);
  const [screen, setScreen] = useState("feed");
  const [jobDetailReturnScreen, setJobDetailReturnScreen] = useState("feed");
  const [mode, setMode] = useState("trabalhar");
  const deriveApplicationStatus = (status) => {
    if (status === "Em Negociação") return "Em análise";
    if (status === "Em Atendimento") return "Candidatura oficializada";
    return null;
  };

  const [jobs, setJobs] = useState(() =>
    INITIAL_JOBS.map((j) => ({
      ...j,
      applicationStatus: deriveApplicationStatus(j.status),
      checkInAt: null,
      checkOutAt: null,
      cancelledBy: null,
      companyRating: 4.8,
      companyRatingCount: 24 + (j.id % 20),
    }))
  );
  const [activeJob, setActiveJob] = useState(null);
  const [notifications, setNotifications] = useState([
    { title: "Novo candidato!", body: "Alguém se candidatou para 'Pedreiro para reforma de varanda'.", read: false },
  ]);
  const [toast, setToast] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [profile, setProfile] = useState({
    name: "Você",
    email: "",
    phone: "",
    city: "Ji-Paraná, RO",
    bio: "",
    hasPhoto: false,
    competencies: [],
  });
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [conversations, setConversations] = useState([
    {
      id: "prof-1",
      professionalId: 1,
      name: "Fernanda Lima",
      avatar: "FL",
      unread: 2,
      lastMessage: "Consigo sim! Que horas seria o evento?",
      lastTime: new Date(Date.now() - 1000 * 60 * 35),
      messages: [
        { from: "them", text: "Olá! Vi que você tem uma vaga de recepção, ainda está disponível?" },
        { from: "me", text: "Oi Fernanda! Sim, ainda está aberta." },
        { from: "them", text: "Consigo sim! Que horas seria o evento?" },
      ],
    },
  ]);

  const pushToast = (t) => {
    setToast(t);
    setNotifications((n) => [{ ...t, read: false }, ...n]);
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggleSaveJob = (id) => {
    setSavedJobIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const handleOpenNotifications = () => {
    setScreen("notifs");
  };

  const updateJob = (id, patch) => setJobs((js) => js.map((j) => (j.id === id ? { ...j, ...patch } : j)));

  useEffect(() => {
    if (screen === "notifs") {
      setNotifications((n) => (n.some((item) => !item.read) ? n.map((item) => ({ ...item, read: true })) : n));
    }
  }, [screen]);

  const handleApply = (job) => {
    updateJob(job.id, { status: "Em Negociação", candidate: "Você", applicationStatus: "Em análise" });
    pushToast({ title: "Candidatura enviada!", body: `${job.contractor} foi notificado da sua candidatura.` });
    setActiveJob({ ...job, status: "Em Negociação", candidate: "Você", applicationStatus: "Em análise" });
  };

  const handleAccept = (job) => {
    const updated = { ...job, status: "Em Atendimento", applicationStatus: "Candidatura oficializada" };
    updateJob(job.id, { status: "Em Atendimento", applicationStatus: "Candidatura oficializada" });
    pushToast({ title: "Candidato aceito ✅", body: `A vaga "${job.title}" saiu do mural público.` });
    setActiveJob(updated);
    setScreen("officialized");
  };

  const handleConfirmParticipation = (job) => {
    const hasConflict = jobs.some(
      (j) =>
        j.id !== job.id &&
        j.candidate === "Você" &&
        ["Diária agendada", "Em andamento"].includes(j.applicationStatus) &&
        j.dateISO &&
        job.dateISO &&
        j.dateISO === job.dateISO
    );
    if (hasConflict) {
      pushToast({ title: "Conflito de horário", body: "Você já possui uma diária confirmada neste dia." });
      return;
    }
    updateJob(job.id, { applicationStatus: "Diária agendada" });
    pushToast({ title: "Diária confirmada! ✅", body: "A empresa foi avisada que você confirmou." });
    setActiveJob({ ...job, applicationStatus: "Diária agendada" });
    setScreen("jobDetail");
  };

  const handleCheckIn = (job) => {
    const now = new Date();
    updateJob(job.id, { applicationStatus: "Em andamento", checkInAt: now });
    pushToast({ title: "Check-in registrado", body: `Horário: ${now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` });
    setActiveJob({ ...job, applicationStatus: "Em andamento", checkInAt: now });
  };

  const handleCheckOut = (job) => {
    const now = new Date();
    updateJob(job.id, { applicationStatus: "Diária concluída", checkOutAt: now });
    pushToast({ title: "🔔 Diária concluída", body: "Avalie sua experiência com a empresa." });
    setActiveJob({ ...job, applicationStatus: "Diária concluída", checkOutAt: now });
    setScreen("rating");
  };

  const handleReopen = (job, cancelledBy = "profissional", reason = "") => {
    updateJob(job.id, { status: "Disponível", candidate: null, applicationStatus: "Cancelada", cancelledBy, cancelReason: reason });
    pushToast({
      title: "Vaga reaberta",
      body: cancelledBy === "empresa" ? `"${job.title}" foi cancelada pela empresa.` : `"${job.title}" voltou a ficar disponível no mural.`,
    });
    setScreen("feed");
    setActiveJob(null);
  };

  const handleComplete = (job) => {
    setActiveJob(job);
    setScreen("rating");
  };

  const handleRatingSubmit = (ratingData) => {
    updateJob(activeJob.id, {
      status: "Concluída",
      applicationStatus: "Finalizada",
      rating: ratingData,
    });
    pushToast({ title: "Avaliação enviada!", body: "Obrigado por avaliar a empresa." });
    setScreen("postJobSummary");
  };

  const handlePublish = (formData) => {
    const dateISO = formData.dateISO || "";
    const dateLabel = dateISO
      ? new Date(dateISO + "T00:00:00").toLocaleDateString("pt-BR")
      : "A combinar";
    const newJob = {
      id: Date.now(),
      title: formData.title || "Nova vaga publicada",
      category: formData.category || "Serviços Gerais",
      value: formData.value || "0",
      date: formData.timeLabel ? `${dateLabel} · ${formData.timeLabel}` : dateLabel,
      dateISO: dateISO || null,
      neighborhood: formData.neighborhood || "Centro",
      address: `${formData.neighborhood || "Centro"} (endereço a confirmar)`,
      city: formData.city || "Ji-Paraná",
      state: formData.state || "RO",
      verified: true,
      status: "Disponível",
      contractor: "Você",
      contractorPhone: formData.phone || null,
      candidate: null,
      urgent: false,
    };
    setJobs((js) => [newJob, ...js]);
    pushToast({ title: "Vaga publicada!", body: "Prestadores próximos serão notificados." });
  };

  const ACTIVE_APPLICATION_STATUSES = [
    "Em análise", "Candidatura oficializada", "Diária agendada", "Em andamento", "Diária concluída",
  ];

  const handleDeleteJob = (job) => {
    const id = typeof job === "object" ? job.id : job;
    const target = typeof job === "object" ? job : jobs.find((j) => j.id === id);
    const hasActiveCandidate =
      target && target.candidate && ACTIVE_APPLICATION_STATUSES.includes(target.applicationStatus);
    if (hasActiveCandidate) {
      pushToast({
        title: "Não é possível excluir",
        body: "Esta vaga tem uma candidatura em andamento. Cancele a negociação com o profissional antes de excluir.",
      });
      return;
    }
    setJobs((js) => js.filter((j) => j.id !== id));
    pushToast({ title: "Vaga excluída", body: "A vaga foi removida do seu painel e do mural." });
  };

  const handleOpenProfile = (professional) => {
    setSelectedProfessional(professional);
    setScreen("professionalProfile");
  };

  const handleOpenConversation = (conv) => {
    setConversations((cs) => cs.map((c) => (c.id === conv.id ? { ...c, unread: 0 } : c)));
    setActiveConversationId(conv.id);
    setScreen("conversationChat");
  };

  const handleStartOrOpenConversation = (professional) => {
    const existing = conversations.find((c) => c.professionalId === professional.id);
    if (existing) {
      handleOpenConversation(existing);
      return;
    }
    const newConv = {
      id: `prof-${professional.id}`,
      professionalId: professional.id,
      name: professional.name,
      avatar: professional.avatar,
      unread: 0,
      lastMessage: "Conversa iniciada",
      lastTime: new Date(),
      messages: [],
    };
    setConversations((cs) => [newConv, ...cs]);
    setActiveConversationId(newConv.id);
    setScreen("conversationChat");
  };

  const handleSendConversationMessage = (conversationId, content) => {
    const isAudio = typeof content === "object" && content !== null;
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const messagePart = isAudio
      ? { id: msgId, from: "me", type: "audio", audioUrl: content.audioUrl, duration: content.duration }
      : { id: msgId, from: "me", text: content };
    const lastMessagePreview = isAudio ? "🎤 Mensagem de voz" : content;
    setConversations((cs) =>
      cs.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, messagePart], lastMessage: lastMessagePreview, lastTime: new Date() }
          : c
      )
    );
  };

  /* ---- AUTH FLOW ---- */
  if (authStep !== "done") {
    const steps = {
      login: (
        <LoginScreen
          onLogin={() => setAuthStep("done")}
          goCadastro={() => setAuthStep("cadastro")}
          goForgot={() => setAuthStep("forgotPassword")}
          goSocial={(provider) => {
            setSocialProvider(provider);
            setAuthStep("cadastro");
          }}
        />
      ),
      forgotPassword: <ForgotPasswordScreen onBack={() => setAuthStep("login")} />,
      cadastro: (
        <CadastroScreen
          onBack={() => {
            setSocialProvider(null);
            setAuthStep("login");
          }}
          onNext={() => setAuthStep("onboarding")}
          socialProvider={socialProvider}
          socialPrefill={socialProvider ? SOCIAL_MOCK[socialProvider] : null}
        />
      ),
      onboarding: (
        <OnboardingProfile
          onSelect={(m) => {
            setMode(m);
            setAuthStep("document");
          }}
        />
      ),
      document: <DocumentSelection onBack={() => setAuthStep("onboarding")} onNext={() => setAuthStep("security")} />,
      security: <SecurityVerification onBack={() => setAuthStep("document")} onNext={() => setAuthStep("resume")} />,
      resume: (
        <MiniResume
          onBack={() => setAuthStep("security")}
          onSkip={() => setAuthStep("terms")}
          onNext={() => setAuthStep("terms")}
        />
      ),
      terms: <TermsScreen onBack={() => setAuthStep("resume")} onFinish={() => setAuthStep("done")} />,
    };
    return (
      <div className="w-full max-w-sm mx-auto h-[820px] max-h-[92vh] bg-slate-50 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative font-sans">
        {steps[authStep]}
      </div>
    );
  }

  /* ---- MAIN APP ---- */
  let content;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  if (screen === "feed")
    content = (
      <FeedScreen
        mode={mode}
        jobs={jobs}
        onOpenJob={(j) => { setActiveJob(j); setJobDetailReturnScreen("feed"); setScreen("jobDetail"); }}
        onPublish={handlePublish}
        onDeleteJob={handleDeleteJob}
        onOpenProfile={handleOpenProfile}
        savedJobIds={savedJobIds}
        onToggleSave={handleToggleSaveJob}
        unreadNotifications={unreadNotifications}
        onOpenNotifications={handleOpenNotifications}
        onViewProfile={() => setScreen("account")}
        onLogout={() => { setScreen("feed"); setAuthStep("login"); }}
        profile={profile}
      />
    );
  else if (screen === "jobDetail")
    content = (
      <JobDetail
        job={jobs.find((j) => j.id === activeJob.id) || activeJob}
        onBack={() => setScreen(jobDetailReturnScreen)}
        onApply={handleApply}
        onAccept={handleAccept}
        onReopen={handleReopen}
        onGoChat={(j) => { setActiveJob(j); setScreen("chat"); }}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
      />
    );
  else if (screen === "map")
    content = (
      <MapScreen
        jobs={jobs}
        pushToast={pushToast}
        onOpenJob={(j) => { setActiveJob(j); setJobDetailReturnScreen("map"); setScreen("jobDetail"); }}
      />
    );
  else if (screen === "agenda") content = <AgendaScreen jobs={jobs} onOpenJob={(j) => { setActiveJob(j); setJobDetailReturnScreen("agenda"); setScreen("jobDetail"); }} />;
  else if (screen === "notifs") content = <NotificationsScreen notifications={notifications} />;
  else if (screen === "account")
    content = (
      <AccountScreen
        mode={mode}
        setMode={setMode}
        onBack={() => setScreen("feed")}
        onDelete={() => setAuthStep("login")}
        onLogout={() => { setScreen("feed"); setAuthStep("login"); }}
        onOpenHistory={() => setScreen("workHistory")}
        onOpenApplications={() => setScreen("myApplications")}
        onOpenDiarias={() => setScreen("myDiarias")}
        profile={profile}
        onEditProfile={() => setScreen("editProfile")}
      />
    );
  else if (screen === "editProfile")
    content = (
      <EditProfileScreen
        mode={mode}
        profile={profile}
        onSave={(updated) => setProfile(updated)}
        onBack={() => setScreen("account")}
      />
    );
  else if (screen === "workHistory")
    content = <MyWorkHistoryScreen onBack={() => setScreen("account")} />;
  else if (screen === "myApplications")
    content = (
      <MyApplicationsScreen
        jobs={jobs}
        onBack={() => setScreen("account")}
        onOpenJob={(j) => { setActiveJob(j); setJobDetailReturnScreen("myApplications"); setScreen("jobDetail"); }}
      />
    );
  else if (screen === "myDiarias")
    content = (
      <MyDiariasScreen
        jobs={jobs}
        onBack={() => setScreen("account")}
        onOpenJob={(j) => { setActiveJob(j); setJobDetailReturnScreen("myDiarias"); setScreen("jobDetail"); }}
      />
    );
  else if (screen === "chat")
    content = (
      <ChatScreen
        job={jobs.find((j) => j.id === activeJob.id) || activeJob}
        onBack={() => setScreen("jobDetail")}
        onComplete={handleComplete}
        onCancel={handleReopen}
      />
    );
  else if (screen === "rating") content = <RatingScreen job={activeJob} onBack={() => setScreen("jobDetail")} onSubmit={handleRatingSubmit} />;
  else if (screen === "officialized")
    content = <OfficializedScreen job={activeJob} onBack={() => setScreen("jobDetail")} onConfirm={handleConfirmParticipation} />;
  else if (screen === "postJobSummary")
    content = <PostJobSummaryScreen jobs={jobs} onDone={() => { setScreen("feed"); setActiveJob(null); }} />;
  else if (screen === "professionalProfile")
    content = (
      <ProfessionalProfileScreen
        professional={selectedProfessional}
        onBack={() => setScreen("feed")}
        onMessage={handleStartOrOpenConversation}
      />
    );
  else if (screen === "chatList")
    content = <ChatListScreen conversations={conversations} onOpenConversation={handleOpenConversation} />;
  else if (screen === "conversationChat") {
    const activeConversation = conversations.find((c) => c.id === activeConversationId);
    content = activeConversation ? (
      <ConversationChatScreen
        conversation={activeConversation}
        onBack={() => setScreen("chatList")}
        onSend={handleSendConversationMessage}
      />
    ) : null;
  }

  const showNav = ["feed", "map", "agenda", "notifs", "account", "chatList"].includes(screen);
  const unreadConversations = conversations.filter((c) => c.unread > 0).length;

  return (
    <div className="w-full max-w-sm mx-auto h-[820px] max-h-[92vh] bg-slate-50 rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        @keyframes fadeIn{from{opacity:0;transform:translate(-50%,-8px)}to{opacity:1;transform:translate(-50%,0)}}
      `}</style>
      <Toast toast={toast} />
      <div className="flex-1 overflow-y-auto no-scrollbar">{content}</div>
      {showNav && <BottomNav active={screen} setScreen={setScreen} mode={mode} unreadConversations={unreadConversations} />}
    </div>
  );
}

export default App;
