import { CONTATO, DATA_TERMO, INTRO_TERMO, LINK_LEI, SECOES_TERMO, TITULO_TERMO, VERSAO_TERMO } from "../data/termoLgpd.js";

/* Texto completo do Termo de Consentimento (LGPD). */
export function TextoTermoLgpd({ comTitulo = true }) {
  return (
    <article className="text-[13.5px] text-slate-600 leading-relaxed flex flex-col gap-4">
      {comTitulo && (
        <header>
          <h2 className="text-[17px] font-extrabold text-slate-800 leading-snug">{TITULO_TERMO}</h2>
          <p className="text-[11.5px] text-slate-400 mt-1">
            Versão {VERSAO_TERMO.split("-")[0]} · {DATA_TERMO}
          </p>
        </header>
      )}
      <p>{INTRO_TERMO}</p>
      {SECOES_TERMO.map((s) => (
        <section key={s.titulo}>
          <h3 className="font-bold text-slate-800 mb-1.5">{s.titulo}</h3>
          {s.paragrafos?.map((p) => (
            <p key={p} className="mb-1.5">{p}</p>
          ))}
          {s.itens && (
            <ul className="list-disc pl-5 flex flex-col gap-1">
              {s.itens.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <p className="text-[12.5px]">
        Leia a lei completa no site do Planalto:{" "}
        <a href={LINK_LEI} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold underline">
          Lei nº 13.709/2018 (LGPD)
        </a>
        . Dúvidas: <a href={`mailto:${CONTATO}`} className="text-emerald-700 font-semibold break-all">{CONTATO}</a>.
      </p>
    </article>
  );
}
