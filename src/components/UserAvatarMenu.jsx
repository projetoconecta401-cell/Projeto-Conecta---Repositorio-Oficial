import { User, LogOut, Building2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  AVATAR DO USUÁRIO — MENU SUSPENSO (Ver perfil / Sair do perfil)    */
/* ------------------------------------------------------------------ */

export function UserAvatarMenu({ onViewProfile, onLogout, mode, name }) {
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
