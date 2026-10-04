import {
  MapPin, Bell, X, Plus, ChevronRight, ChevronLeft, SlidersHorizontal, Building2, Briefcase,
  Bookmark
} from "lucide-react";
import { useState, useRef } from "react";
import { FilterModal } from "../components/jobs/FilterModal.jsx";
import { JobCard } from "../components/jobs/JobCard.jsx";
import { MyJobCard } from "../components/jobs/MyJobCard.jsx";
import { ProfessionalCard } from "../components/jobs/ProfessionalCard.jsx";
import { PublishModal } from "../components/jobs/PublishModal.jsx";
import { Screen } from "../components/ui.jsx";
import { UserAvatarMenu } from "../components/UserAvatarMenu.jsx";
import { CATEGORIES, PROFESSIONALS } from "../data/mock.js";

export function FeedScreen({ mode, jobs, onOpenJob, onPublish, onDeleteJob, onOpenProfile, savedJobIds, onToggleSave, unreadNotifications, onOpenNotifications, onViewProfile, onLogout, profile }) {
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
