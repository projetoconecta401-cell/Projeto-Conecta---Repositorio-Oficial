import {
  MapPin, Bell, X, Plus, ChevronRight, ChevronLeft, SlidersHorizontal, Building2, Briefcase, Bookmark, Navigation, Users, Search,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FilterModal } from "../components/jobs/FilterModal.jsx";
import { JobCard } from "../components/jobs/JobCard.jsx";
import { MyJobCard } from "../components/jobs/MyJobCard.jsx";
import { MuralServicos } from "../components/disponibilidades/MuralServicos.jsx";
import { ProfessionalCard } from "../components/jobs/ProfessionalCard.jsx";
import { listarProfissionais } from "../lib/perfis.js";
import { MinhasOfertas } from "../components/disponibilidades/MinhasOfertas.jsx";
import { PublishModal } from "../components/jobs/PublishModal.jsx";
import { CardsEsqueleto, EmptyState, Screen } from "../components/ui.jsx";
import { UserAvatarMenu } from "../components/UserAvatarMenu.jsx";
import BotaoInstalar from "../components/BotaoInstalar.jsx";
import { useBloqueados } from "../components/Seguranca.jsx";
import { CATEGORIES } from "../data/catalogo.js";
import { adiarConvite, deveConvidar } from "../lib/avaliacaoApp.js";
import { distanciaDaVaga } from "../lib/geo.js";
import { hojeISO } from "../lib/vagas.js";

const GRADE = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4";

/* Convite discreto para avaliar o app (some ao avaliar ou ao tocar "Agora não" por 7 dias). */
function ConviteAvaliarApp({ profile, onAbrir }) {
  const [mostrar, setMostrar] = useState(() => !!onAbrir && deveConvidar(profile));
  if (!mostrar) return null;
  return (
    <div className="px-5 mt-4">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
        <p className="text-[13.5px] font-bold text-slate-800">O que está achando do EiFreela?</p>
        <p className="text-[12.5px] text-slate-600 mt-0.5">Dê uma nota e conte o que podemos melhorar. Leva 1 minuto.</p>
        <div className="flex gap-2 mt-3">
          <button onClick={onAbrir} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[12.5px] font-bold">Avaliar agora</button>
          <button onClick={() => { adiarConvite(); setMostrar(false); }} className="px-3 py-2 rounded-xl text-slate-500 text-[12.5px] font-semibold">Agora não</button>
        </div>
      </div>
    </div>
  );
}

export function FeedScreen({
  mode, jobs, loading, userId, posicao, onPedirPosicao, onOpenJob, onPublish, onDeleteJob, onOpenProfile, savedJobIds,
  onToggleSave, unreadNotifications, onOpenNotifications, onViewProfile, onLogout, profile, onAvaliarApp, onCadastrarContratante, onNovaDisponibilidade, onEditarDisponibilidade, onAbrirDisponibilidade, onInteresseDisponibilidade, versaoOfertas, onAviso,
}) {
  // A aba aberta é lembrada ao voltar de outra tela (ex.: depois de publicar).
  const [tab, setTabEstado] = useState(() => {
    try { return sessionStorage.getItem("eifreela:aba") || "vagas"; } catch { return "vagas"; }
  });
  const setTab = (t) => {
    setTabEstado(t);
    try { sessionStorage.setItem("eifreela:aba", t); } catch { /* sem armazenamento */ }
  };
  useEffect(() => {
    if ((mode !== "contratar" && (tab === "pros" || tab === "servicos" || tab === "minhas")) || (mode !== "trabalhar" && (tab === "favoritas" || tab === "ofertas"))) setTab("vagas");
  }, [mode, tab]);
  const [showPublish, setShowPublish] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("Todas");
  const [state, setState] = useState("Todos");
  const [minValue, setMinValue] = useState("");
  const [period, setPeriod] = useState("Qualquer");
  const [maxDistance, setMaxDistance] = useState("Qualquer");
  const [date, setDate] = useState("");
  const [busca, setBusca] = useState("");
  const [pedindoLocal, setPedindoLocal] = useState(false);
  const catScrollRef = useRef(null);

  // Lista de profissionais: só para contratantes válidos (o banco também bloqueia).
  // Se o banco ainda não tiver a coluna, mantém o comportamento antigo.
  const temRegraContratante = !!profile && Object.prototype.hasOwnProperty.call(profile, "contratante_valido");
  const podeVerPros = !temRegraContratante || !!profile?.contratante_valido;

  // Lista de profissionais cadastrados (contratantes): carregada quando a aba é aberta.
  const [pros, setPros] = useState(null);
  const [erroPros, setErroPros] = useState("");
  useEffect(() => {
    if (tab !== "pros" || pros || !podeVerPros) return;
    listarProfissionais(userId).then(setPros).catch((err) => setErroPros(err.message));
  }, [tab, pros, userId, podeVerPros]);


  const hoje = hojeISO();
  const openJobs = useMemo(
    () => jobs.filter((j) => ["Disponível", "Em Negociação"].includes(j.status) && (!j.dateISO || j.dateISO >= hoje)),
    [jobs, hoje]
  );
  const cities = useMemo(() => [...new Set(openJobs.map((j) => j.city))].sort((a, b) => a.localeCompare(b, "pt-BR")), [openJobs]);
  const termo = busca.trim().toLowerCase();
  const visibleJobs = openJobs
    .filter((j) => category === "all" || category === "minhas-areas" ? true : j.category === category)
    .filter((j) => category !== "minhas-areas" || profile?.areas?.includes(j.category))
    .filter((j) => city === "Todas" || j.city === city)
    .filter((j) => state === "Todos" || j.state === state)
    .filter((j) => !minValue || j.value >= Number(minValue))
    .filter((j) => period === "Qualquer" || j.period === period)
    .filter((j) => {
      if (maxDistance === "Qualquer") return true;
      const km = distanciaDaVaga(j, posicao);
      return km != null && km <= maxDistance;
    })
    .filter((j) => !date || j.dateISO === date)
    .filter((j) => !termo || [j.title, j.category, j.neighborhood, j.city].some((t) => String(t).toLowerCase().includes(termo)));
  const myJobs = jobs.filter((j) => j.isOwner);
  const favoriteJobs = jobs.filter((j) => savedJobIds.includes(j.id));
  const bloqueados = useBloqueados();
  const prosVisiveis = (pros ?? []).filter((p) => !bloqueados.has(p.id)).filter(
    (p) => (category === "all" || category === "minhas-areas" || p.areas.includes(category)) &&
      (!termo || [p.nome, p.cidade, p.uf].some((t) => t && String(t).toLowerCase().includes(termo)))
  );

  const activeCategoryLabel = category === "all" ? null : category === "minhas-areas" ? "suas áreas" : category;
  const activeFilterCount =
    (city !== "Todas" ? 1 : 0) + (state !== "Todos" ? 1 : 0) + (minValue ? 1 : 0) + (period !== "Qualquer" ? 1 : 0) +
    (maxDistance !== "Qualquer" ? 1 : 0) + (date ? 1 : 0);
  const clearAll = () => {
    setCategory("all");
    setCity("Todas");
    setState("Todos");
    setMinValue("");
    setPeriod("Qualquer");
    setMaxDistance("Qualquer");
    setDate("");
    setBusca("");
  };

  const ativarLocal = async () => {
    setPedindoLocal(true);
    await onPedirPosicao();
    setPedindoLocal(false);
  };

  const tabs = [
    { id: "vagas", label: "Mural de Vagas" },
    ...(mode === "contratar" ? [{ id: "minhas", label: "Minhas Vagas" }] : []),
    ...(mode === "trabalhar" ? [{ id: "ofertas", label: "Minhas ofertas" }, { id: "favoritas", label: "Favoritas" }] : []),
    ...(mode === "contratar" ? [{ id: "servicos", label: "Serviços disponíveis" }, { id: "pros", label: "Profissionais" }] : []),
  ];

  const Chip = ({ ativo, onClick, children }) => (
    <span className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-[12px] font-semibold max-w-[180px]">
      <span className="truncate">{children}</span>
      {ativo && (
        <button onClick={onClick} aria-label="Remover filtro" className="shrink-0">
          <X size={12} />
        </button>
      )}
    </span>
  );

  return (
    <Screen>
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-100 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between px-5 pt-4 gap-2">
          <div className="min-w-0 flex items-center gap-2.5">
            <img src="/icons/icon-192.png" alt="" width="36" height="36" className="w-9 h-9 rounded-xl shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-extrabold text-slate-800 leading-tight">
                  Ei<span className="text-emerald-600">Freela</span>
                </h1>
                {mode === "contratar" && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold shrink-0">
                    <Building2 size={10} /> Contratante
                  </span>
                )}
              </div>
              <p className="text-[12px] text-slate-400 truncate">Olá, {profile?.nome?.split(" ")[0] ?? "você"}!</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <BotaoInstalar compacto />
            <button
              onClick={onOpenNotifications}
              aria-label={`Notificações${unreadNotifications ? `: ${unreadNotifications} novas` : ""}`}
              className="relative w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0"
            >
              <Bell size={17} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-emerald-500 border-2 border-white text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </button>
            <UserAvatarMenu onViewProfile={onViewProfile} onLogout={onLogout} name={profile?.nome} avatarUrl={profile?.avatar_url} />
          </div>
        </div>
        <div className="flex gap-1.5 px-5 mt-3 pb-3 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-3.5 py-2.5 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition ${
                tab === t.id ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "bg-slate-100 text-slate-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 pb-28">
        {(tab === "vagas" || tab === "pros" || tab === "servicos") && (
          <>
            <div className="px-5 pt-4">
              <div className="flex items-center gap-2 px-3.5 rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-emerald-500/40">
                <Search size={17} className="text-slate-400 shrink-0" />
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder={tab === "servicos" ? "Buscar serviço (ex.: faxina, babá, design)" : tab === "pros" ? "Buscar profissional por nome ou cidade" : "Buscar por função, bairro ou cidade"}
                  aria-label="Buscar"
                  className="flex-1 min-w-0 py-3 bg-transparent text-[16px] focus:outline-none"
                />
              </div>
            </div>

            {/* Serviços por área */}
            <div className="px-5 pt-4">
              <p className="text-[13px] font-bold text-slate-700">Serviços por área</p>
            </div>
            <div className="relative mt-2">
              <button
                onClick={() => catScrollRef.current?.scrollBy({ left: -160, behavior: "smooth" })}
                aria-label="Rolar categorias para a esquerda"
                className="hidden sm:flex absolute left-1 top-7 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-500"
              >
                <ChevronLeft size={16} />
              </button>
              <div ref={catScrollRef} className="flex gap-3 px-5 overflow-x-auto no-scrollbar scroll-smooth">
                {[
                  { id: "all", label: "Todas", icon: SlidersHorizontal },
                  { id: "minhas-areas", label: "Minhas áreas", icon: Bookmark },
                  ...CATEGORIES.map((c) => ({ id: c.label, label: c.label, icon: c.icon })),
                ].map((c) => {
                  const Icon = c.icon;
                  const active = category === c.id;
                  return (
                    <button key={c.id} onClick={() => setCategory(c.id)} className="flex flex-col items-center gap-1.5 shrink-0 w-[70px]">
                      <span
                        className={`w-14 h-14 rounded-2xl border shadow-sm flex items-center justify-center transition ${
                          active ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-100 text-emerald-600"
                        }`}
                      >
                        <Icon size={21} />
                      </span>
                      <span className={`block w-full text-[10.5px] text-center leading-tight font-medium break-words ${active ? "text-emerald-700" : "text-slate-600"}`}>
                        {c.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => catScrollRef.current?.scrollBy({ left: 160, behavior: "smooth" })}
                aria-label="Rolar categorias para a direita"
                className="hidden sm:flex absolute right-1 top-7 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-500"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}

        {tab === "vagas" && (
          <>
            {!posicao && (
              <div className="px-5 mt-4">
                <button
                  onClick={ativarLocal}
                  disabled={pedindoLocal}
                  className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 border-dashed border-emerald-200 text-emerald-700 text-[12.5px] font-bold text-left disabled:opacity-60"
                >
                  <Navigation size={16} className="shrink-0" />
                  <span className="flex-1">{pedindoLocal ? "Obtendo localização…" : "Ver a distância aproximada das vagas"}</span>
                  <ChevronRight size={15} className="shrink-0" />
                </button>
              </div>
            )}

            <ConviteAvaliarApp profile={profile} onAbrir={onAvaliarApp} />

            {/* Filtros */}
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
              {city !== "Todas" && <Chip ativo onClick={() => setCity("Todas")}><MapPin size={12} className="inline -mt-0.5" /> {city}</Chip>}
              {state !== "Todos" && <Chip ativo onClick={() => setState("Todos")}>{state}</Chip>}
              {minValue && <Chip ativo onClick={() => setMinValue("")}>Mín. R$ {minValue}</Chip>}
              {period !== "Qualquer" && <Chip ativo onClick={() => setPeriod("Qualquer")}>{period}</Chip>}
              {maxDistance !== "Qualquer" && <Chip ativo onClick={() => setMaxDistance("Qualquer")}>Até ~{maxDistance} km</Chip>}
              {date && <Chip ativo onClick={() => setDate("")}>{new Date(date + "T00:00:00").toLocaleDateString("pt-BR")}</Chip>}
            </div>
          </>
        )}

        {/* Listas */}
        <div className="px-5 mt-5">
          {tab === "vagas" &&
            (loading ? (
              <CardsEsqueleto n={4} />
            ) : openJobs.length === 0 ? (
              <EmptyState icon={Briefcase} title="Nenhuma vaga disponível no momento" text="Assim que alguém publicar uma vaga, ela aparece aqui na hora.">
                {mode === "contratar" && (
                  <button onClick={() => setShowPublish(true)} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold">
                    Publicar a primeira vaga
                  </button>
                )}
              </EmptyState>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <p className="text-[12.5px] font-bold text-slate-600 truncate">
                    {activeCategoryLabel ? `Vagas em ${activeCategoryLabel}` : "Todas as vagas"}
                    <span className="text-slate-400 font-medium"> · {visibleJobs.length}</span>
                  </p>
                  {(activeCategoryLabel || activeFilterCount > 0 || termo) && (
                    <button onClick={clearAll} className="shrink-0 text-[12px] font-semibold text-teal-600 flex items-center gap-1">
                      <X size={12} /> Limpar
                    </button>
                  )}
                </div>
                {visibleJobs.length ? (
                  <div className={GRADE}>
                    {visibleJobs.map((j) => (
                      <JobCard key={j.id} job={j} posicao={posicao} onOpen={onOpenJob} saved={savedJobIds.includes(j.id)} onToggleSave={j.isOwner ? null : onToggleSave} />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={SlidersHorizontal} title="Nenhuma vaga com esses filtros">
                    <button onClick={clearAll} className="text-[13px] text-emerald-600 font-bold">Limpar filtros</button>
                  </EmptyState>
                )}
              </>
            ))}

          {tab === "minhas" &&
            (myJobs.length ? (
              <>
                <p className="text-[12.5px] font-bold text-slate-600 mb-3">
                  Vagas publicadas por você <span className="text-slate-400 font-medium">· {myJobs.length}</span>
                </p>
                <div className={GRADE}>
                  {myJobs.map((j) => <MyJobCard key={j.id} job={j} onOpen={onOpenJob} onDelete={onDeleteJob} />)}
                </div>
              </>
            ) : (
              <EmptyState icon={Briefcase} title="Você ainda não publicou nenhuma vaga">
                <button onClick={() => setShowPublish(true)} className="text-[13px] text-emerald-600 font-bold">Publicar a primeira vaga</button>
              </EmptyState>
            ))}

          {tab === "pros" && !podeVerPros && (
            <div className="p-5 rounded-2xl bg-white border border-slate-100 text-center flex flex-col items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Users size={24} /></span>
              <p className="text-[15px] font-extrabold text-slate-800">Lista disponível para contratantes</p>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-sm">
                Para proteger os profissionais, só contratantes cadastrados (pessoa física ou empresa com CNPJ) podem ver e pesquisar os perfis.
              </p>
              <button onClick={onCadastrarContratante} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold">
                Cadastrar como contratante
              </button>
            </div>
          )}

          {tab === "pros" && podeVerPros &&
            (erroPros ? (
              <EmptyState icon={Users} title="Não foi possível carregar" text={erroPros} />
            ) : pros === null ? (
              <CardsEsqueleto n={3} />
            ) : prosVisiveis.length ? (
              <div className={GRADE}>
                {prosVisiveis.map((p) => <ProfessionalCard key={p.id} p={p} onOpen={onOpenProfile} />)}
              </div>
            ) : (
              <EmptyState icon={Users} title="Nenhum profissional encontrado" text="Quando alguém se cadastrar nessa área, aparece aqui." />
            ))}

          {tab === "servicos" && (
            <MuralServicos
              userId={userId}
              termo={busca}
              categoria={category}
              podeVer={podeVerPros}
              onCadastrarContratante={onCadastrarContratante}
              onOpen={onAbrirDisponibilidade}
              onInteresse={onInteresseDisponibilidade}
            />
          )}

          {tab === "ofertas" && (
            <MinhasOfertas
              userId={userId}
              versao={versaoOfertas}
              onNova={onNovaDisponibilidade}
              onEditar={onEditarDisponibilidade}
              onOpen={onAbrirDisponibilidade}
              onAviso={onAviso}
            />
          )}

          {tab === "favoritas" &&
            (favoriteJobs.length ? (
              <div className={GRADE}>
                {favoriteJobs.map((j) => <JobCard key={j.id} job={j} posicao={posicao} onOpen={onOpenJob} saved onToggleSave={onToggleSave} />)}
              </div>
            ) : (
              <EmptyState icon={Bookmark} title="Você ainda não favoritou nenhuma vaga" text="Toque no marcador de um card para salvá-lo aqui." />
            ))}
        </div>
      </div>

      {mode === "contratar" && (
        <button
          onClick={() => setShowPublish(true)}
          className="fixed z-30 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-[max(1.25rem,calc(50%-14rem+1.25rem))] md:right-[max(1.25rem,calc(50%-24rem+1.25rem))] lg:right-[max(1.25rem,calc(50%-32rem+1.25rem))] flex items-center gap-2 bg-teal-500 text-white px-5 py-3.5 rounded-full shadow-xl shadow-teal-500/30 font-bold text-[13.5px] active:scale-95 transition"
        >
          <Plus size={18} /> Publicar vaga
        </button>
      )}

      {showPublish && (
        <PublishModal onClose={() => setShowPublish(false)} onPublish={onPublish} profile={profile} posicao={posicao} onPedirPosicao={onPedirPosicao} />
      )}

      {showFilters && (
        <FilterModal
          cities={cities}
          temPosicao={!!posicao}
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
