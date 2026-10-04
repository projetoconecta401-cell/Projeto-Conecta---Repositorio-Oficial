import { useEffect, useRef, useState } from "react";
import { ArrowRight, Briefcase, CheckCircle2, MapPin, Menu, Star, X } from "lucide-react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { APP_URL, AUDIENCES, CATEGORIES, FOOTER_NOTE, HERO, STEPS, TRUST } from "./content.js";

/* Revela o conteúdo ao entrar na tela (fade + leve subida).
   Sem IntersectionObserver ou com "reduzir movimento", aparece direto. */
function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!el || reduce || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition duration-500 ease-out motion-reduce:transition-none ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

function Logo({ small = false }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        className={`${small ? "w-9 h-9 rounded-xl" : "w-10 h-10 rounded-2xl"} bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20`}
      >
        <Briefcase className="text-white" size={small ? 17 : 19} aria-hidden="true" />
      </span>
      <span className="font-extrabold text-slate-800 tracking-tight text-[17px]">Conexão Free</span>
    </span>
  );
}

function AppButton({ children = "Abrir o app", variant = "primary", className = "" }) {
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-emerald-800"
      : "border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50";
  return (
    <a
      href={APP_URL}
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-[15px] transition active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 ${styles} ${className}`}
    >
      {children} <ArrowRight size={17} aria-hidden="true" />
    </a>
  );
}

const NAV = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#contratar", label: "Para contratar" },
  { href: "#trabalhar", label: "Para trabalhar" },
];

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "bg-white/90 backdrop-blur border-b border-slate-200/70" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#inicio" aria-label="Conexão Free, início da página">
          <Logo small />
        </a>
        <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-slate-600" aria-label="Seções">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hover:text-emerald-700 transition">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <AppButton className="hidden sm:inline-flex !px-4 !py-2.5 text-[14px]" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 -mr-2 rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="menu-mobile" className="md:hidden border-t border-slate-200/70 px-4 pb-4 pt-2" aria-label="Seções">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-[15px] font-medium text-slate-700 border-b border-slate-100"
            >
              {n.label}
            </a>
          ))}
          <AppButton className="w-full mt-4" />
        </nav>
      )}
    </header>
  );
}

/* Ilustração do app (decorativa): um cartão de vaga como no mural. */
function PhonePreview() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-[260px] sm:w-[290px]">
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-emerald-200/60 to-teal-100/40 blur-2xl" />
      <div className="relative rounded-[2.2rem] border border-slate-200 bg-slate-50 shadow-2xl p-4 pt-5">
        <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-200" />
        <p className="text-[11px] font-semibold text-slate-400">Mural de Vagas</p>
        <div className="mt-2 flex gap-1.5 overflow-hidden">
          {["Todas", "Eventos", "Gastronomia"].map((c, i) => (
            <span
              key={c}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10.5px] font-semibold ${
                i === 0 ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-500"
              }`}
            >
              {c}
            </span>
          ))}
        </div>
        {[
          { cat: "Eventos", title: "Recepcionista para inauguração", where: "Nova Brasília", value: 200, urgent: false },
          { cat: "Gastronomia", title: "Garçom para evento corporativo", where: "Jardim Clodoaldo", value: 180, urgent: true },
        ].map((j) => (
          <div key={j.title} className="mt-3 rounded-2xl bg-white border border-slate-100 p-3 shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[9.5px] font-bold">{j.cat}</span>
              {j.urgent && <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[9.5px] font-bold">Urgente</span>}
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9.5px] font-bold">Disponível</span>
            </div>
            <p className="mt-1.5 text-[12.5px] font-bold text-slate-800 leading-snug">{j.title}</p>
            <p className="mt-1 text-[10.5px] text-slate-500 flex items-center gap-1">
              <MapPin size={10} /> {j.where} · Ji-Paraná
            </p>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <p className="text-[8.5px] font-bold tracking-wider text-slate-400">VALOR DIÁRIA</p>
                <p className="text-[14px] font-extrabold text-emerald-700">R$ {j.value}</p>
              </div>
              <span className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">Ver oportunidade</span>
            </div>
          </div>
        ))}
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-white border border-slate-100 p-2.5">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-[10px] font-bold flex items-center justify-center">FL</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-700">Fernanda Lima</p>
            <p className="text-[10px] text-slate-400 truncate">Bartender · Recepção · Eventos</p>
          </div>
          <span className="flex items-center gap-0.5 text-[10.5px] font-bold text-slate-600">
            <Star size={10} className="text-teal-500" fill="currentColor" /> 4.9
          </span>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ kicker, title, text, center = false }) {
  return (
    <div className={center ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {kicker && <p className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-emerald-700">{kicker}</p>}
      <h2 className="mt-2 text-[28px] sm:text-[34px] font-extrabold tracking-tight text-slate-900 leading-tight">{title}</h2>
      {text && <p className="mt-3 text-[16px] text-slate-600 leading-relaxed">{text}</p>}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans antialiased">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow"
      >
        Pular para o conteúdo
      </a>
      <div id="inicio" className="bg-gradient-to-b from-emerald-50/80 via-white to-white">
        <Header />

        {/* HERO */}
        <main id="conteudo">
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16 sm:pt-16 sm:pb-24 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-8 items-center">
            <Reveal>
              <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-emerald-100 text-[12.5px] font-semibold text-emerald-700 shadow-sm">
                <CheckCircle2 size={14} aria-hidden="true" /> {HERO.eyebrow}
              </p>
              <h1 className="mt-5 text-[38px] sm:text-[52px] font-extrabold tracking-tight leading-[1.05] text-slate-900">
                {HERO.title}
              </h1>
              <p className="mt-5 text-[17px] sm:text-[18px] text-slate-600 leading-relaxed max-w-xl">{HERO.subtitle}</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                {AUDIENCES.map((a, i) => (
                  <a
                    key={a.id}
                    href={`#${a.id}`}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-[15.5px] transition active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 ${
                      i === 0
                        ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-emerald-800"
                        : "bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    <a.icon size={18} aria-hidden="true" /> {a.cta}
                  </a>
                ))}
              </div>
              <a
                href={APP_URL}
                className="mt-5 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-slate-600 hover:text-emerald-700 transition"
              >
                Já tem conta? Abrir o app <ArrowRight size={16} aria-hidden="true" />
              </a>
            </Reveal>
            <Reveal delay={120}>
              <PhonePreview />
            </Reveal>
          </section>

          {/* CATEGORIAS */}
          <section aria-labelledby="categorias-titulo" className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
            <Reveal>
              <h2 id="categorias-titulo" className="text-center text-[13px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Serviços por área
              </h2>
              <ul className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {CATEGORIES.map((c) => (
                  <li
                    key={c.label}
                    className="flex items-center gap-2.5 rounded-2xl bg-white border border-slate-100 px-3.5 py-3 shadow-sm"
                  >
                    <span className="w-9 h-9 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <c.icon size={18} aria-hidden="true" />
                    </span>
                    <span className="text-[13.5px] font-semibold text-slate-700 leading-tight">{c.label}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>
        </main>
      </div>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="scroll-mt-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <SectionTitle center kicker="Como funciona" title="Da vaga à avaliação em 3 passos" />
          </Reveal>
          <ol className="mt-12 grid md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 100} className="relative rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <s.icon size={20} aria-hidden="true" />
                  </span>
                  <span className="text-[13px] font-extrabold text-emerald-700 tracking-wider">PASSO {i + 1}</span>
                </div>
                <h3 className="mt-4 text-[18px] font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-[15px] text-slate-600 leading-relaxed">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* PARA QUEM */}
      {AUDIENCES.map((a, idx) => (
        <section key={a.id} id={a.id} className="scroll-mt-20">
          <div
            className={`max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
              idx % 2 ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <Reveal>
              <SectionTitle kicker={a.kicker} title={a.title} text={a.text} />
              <AppButton className="mt-7" variant={idx === 0 ? "primary" : "outline"}>
                {a.cta}
              </AppButton>
            </Reveal>
            <Reveal delay={120}>
              <ul className="grid sm:grid-cols-2 gap-3">
                {a.points.map((p) => (
                  <li key={p.text} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex gap-3">
                    <span className="w-9 h-9 shrink-0 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <p.icon size={18} aria-hidden="true" />
                    </span>
                    <span className="text-[14.5px] text-slate-700 leading-snug">{p.text}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          {idx === 0 && <div className="max-w-6xl mx-auto px-4 sm:px-6"><hr className="border-slate-100" /></div>}
        </section>
      ))}

      {/* CONFIANÇA */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <Reveal>
            <SectionTitle center kicker="Segurança" title="Confiança para os dois lados" />
          </Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {TRUST.map((t, i) => (
              <Reveal key={t.title} delay={i * 100} className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
                <span className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <t.icon size={20} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-[17px] font-bold text-slate-900">{t.title}</h3>
                <p className="mt-2 text-[15px] text-slate-600 leading-relaxed">{t.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <Reveal className="rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-12 sm:px-12 sm:py-16 text-center text-white shadow-xl shadow-emerald-600/20">
          <h2 className="text-[28px] sm:text-[36px] font-extrabold tracking-tight leading-tight">
            Pronto para a sua próxima diária?
          </h2>
          <p className="mt-3 text-[16px] sm:text-[17px] text-emerald-50/90 max-w-xl mx-auto">
            Use o mesmo app para contratar ou trabalhar e alterne entre os perfis quando quiser.
          </p>
          <a
            href={APP_URL}
            className="mt-8 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-emerald-700 font-bold text-[15.5px] shadow-lg hover:bg-emerald-50 transition active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
          >
            Abrir o app <ArrowRight size={17} aria-hidden="true" />
          </a>
        </Reveal>
      </section>

      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
          <Logo small />
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-slate-500" aria-label="Rodapé">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-emerald-700 transition">
                {n.label}
              </a>
            ))}
            <a href={APP_URL} className="hover:text-emerald-700 transition">Abrir o app</a>
          </nav>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 text-[12.5px] text-slate-400 leading-relaxed">
          <p>{FOOTER_NOTE}</p>
          <p className="mt-1">© {new Date().getFullYear()} Conexão Free</p>
        </div>
      </footer>
      <SpeedInsights />
    </div>
  );
}
