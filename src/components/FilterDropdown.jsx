import { Check, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function FilterDropdown({ options, value, onChange }) {
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
