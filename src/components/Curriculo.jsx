import { Award, Briefcase, GraduationCap, Plus, Trash2, UserRound } from "lucide-react";
import { Campo } from "./ui.jsx";
import { ESCOLARIDADES, LIMITES, SITUACOES, experienciaVazia, resumoFormacao, temCurriculo, temCurso } from "../lib/curriculo.js";

const caixa =
  "w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-white text-[16px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500";

/* ------------------------------------------------------------------ */
/*  Edição (Editar perfil)                                             */
/* ------------------------------------------------------------------ */
export function CurriculoEditor({ valor, onChange, erros = {} }) {
  const set = (campo, v) => onChange({ ...valor, [campo]: v });
  const setF = (campo, v) => onChange({ ...valor, formacao: { ...valor.formacao, [campo]: v } });
  const setExp = (i, campo, v) => set("experiencias", valor.experiencias.map((e, k) => (k === i ? { ...e, [campo]: v } : e)));
  const f = valor.formacao;

  return (
    <section className="flex flex-col gap-4 pt-2">
      <div>
        <h2 className="text-[15px] font-extrabold text-slate-800">Resumo profissional</h2>
        <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">
          Opcional. Um jeito rápido de mostrar quem você é, sua formação e onde já trabalhou. Aparece no seu perfil e ajuda a ser escolhido. Não coloque CPF, telefone ou endereço aqui.
        </p>
      </div>

      {/* Sobre mim */}
      <Campo label="Sobre mim" erro={erros.sobre}>
        <textarea
          rows={4}
          maxLength={LIMITES.sobre}
          value={valor.sobre}
          onChange={(e) => set("sobre", e.target.value)}
          placeholder="Ex.: Sou pontual e tenho experiência em eventos e atendimento. Gosto de trabalhar em equipe."
          className={`${caixa} resize-none`}
        />
        <p className="text-right text-[11px] text-slate-400 mt-1">{valor.sobre.length}/{LIMITES.sobre}</p>
      </Campo>

      {/* Formação */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-slate-100">
        <p className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5"><GraduationCap size={16} className="text-emerald-600" /> Formação</p>
        <Campo label="Escolaridade">
          <select value={f.escolaridade} onChange={(e) => setF("escolaridade", e.target.value)} className={caixa}>
            <option value="">Selecione</option>
            {ESCOLARIDADES.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </Campo>
        {temCurso(f.escolaridade) && (
          <Campo label="Curso" erro={erros.curso}>
            <input value={f.curso} maxLength={80} onChange={(e) => setF("curso", e.target.value)} placeholder="Ex.: Administração" className={caixa} />
          </Campo>
        )}
        {f.escolaridade && (
          <>
            <Campo label="Instituição (opcional)">
              <input value={f.instituicao} maxLength={80} onChange={(e) => setF("instituicao", e.target.value)} placeholder="Ex.: UNIR, IFRO, Escola Estadual…" className={caixa} />
            </Campo>
            <Campo label="Situação">
              <div className="grid grid-cols-3 gap-2">
                {SITUACOES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setF("situacao", f.situacao === s ? "" : s)}
                    aria-pressed={f.situacao === s}
                    className={`py-2.5 rounded-xl border text-[13px] font-semibold ${f.situacao === s ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-200 text-slate-600"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Campo>
            {f.situacao === "Cursando" && (
              <Campo label="Período ou previsão (opcional)">
                <input value={f.periodo} maxLength={60} onChange={(e) => setF("periodo", e.target.value)} placeholder="Ex.: 5º semestre, conclusão em 2027" className={caixa} />
              </Campo>
            )}
          </>
        )}
      </div>

      {/* Experiências */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-slate-100">
        <p className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5"><Briefcase size={16} className="text-emerald-600" /> Experiências</p>
        {valor.experiencias.length === 0 && <p className="text-[12px] text-slate-400">Conte onde você já trabalhou, mesmo que tenha sido por diária.</p>}
        {valor.experiencias.map((e, i) => (
          <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-slate-500">Experiência {i + 1}</span>
              <button type="button" onClick={() => set("experiencias", valor.experiencias.filter((_, k) => k !== i))} aria-label="Remover experiência" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                <Trash2 size={16} />
              </button>
            </div>
            <input value={e.funcao} maxLength={60} onChange={(x) => setExp(i, "funcao", x.target.value)} placeholder="Função (ex.: Garçom)" className={caixa} />
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
              <input value={e.local} maxLength={60} onChange={(x) => setExp(i, "local", x.target.value)} placeholder="Onde (ex.: Buffet Sabor)" className={caixa} />
              <input value={e.periodo} maxLength={40} onChange={(x) => setExp(i, "periodo", x.target.value)} placeholder="Quando (ex.: 2023–2024)" className={caixa} />
            </div>
            <input value={e.descricao} maxLength={200} onChange={(x) => setExp(i, "descricao", x.target.value)} placeholder="O que fazia (opcional)" className={caixa} />
          </div>
        ))}
        {erros.experiencias && <p className="text-[12px] text-red-500 font-semibold">{erros.experiencias}</p>}
        {valor.experiencias.length < LIMITES.experiencias && (
          <button type="button" onClick={() => set("experiencias", [...valor.experiencias, experienciaVazia()])} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-emerald-300 text-emerald-700 text-[13px] font-bold">
            <Plus size={16} /> Adicionar experiência
          </button>
        )}
      </div>

      {/* Cursos */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-slate-100">
        <p className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5"><Award size={16} className="text-emerald-600" /> Cursos e certificados</p>
        {valor.cursos.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={c} maxLength={80} onChange={(x) => set("cursos", valor.cursos.map((v, k) => (k === i ? x.target.value : v)))} placeholder="Ex.: Boas práticas de manipulação de alimentos" className={caixa} />
            <button type="button" onClick={() => set("cursos", valor.cursos.filter((_, k) => k !== i))} aria-label="Remover curso" className="p-2 rounded-lg text-red-500 hover:bg-red-50 shrink-0">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {valor.cursos.length < LIMITES.cursos && (
          <button type="button" onClick={() => set("cursos", [...valor.cursos, ""])} className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-emerald-300 text-emerald-700 text-[13px] font-bold">
            <Plus size={16} /> Adicionar curso
          </button>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Exibição (perfil público)                                          */
/* ------------------------------------------------------------------ */
export function CurriculoView({ c }) {
  if (!temCurriculo(c)) return null;
  const formacao = resumoFormacao(c.formacao);
  return (
    <div className="flex flex-col gap-4">
      {c.sobre && (
        <Bloco icon={UserRound} titulo="Sobre">
          <p className="text-[13.5px] text-slate-600 leading-relaxed whitespace-pre-line break-words">{c.sobre}</p>
        </Bloco>
      )}
      {formacao && (
        <Bloco icon={GraduationCap} titulo="Formação">
          <p className="text-[13.5px] text-slate-700 break-words">{formacao}</p>
        </Bloco>
      )}
      {c.experiencias?.length > 0 && (
        <Bloco icon={Briefcase} titulo="Experiências">
          <ul className="flex flex-col gap-2.5">
            {c.experiencias.map((e, i) => (
              <li key={i} className="pl-3 border-l-2 border-emerald-200 min-w-0">
                <p className="text-[13.5px] font-bold text-slate-800 break-words">{e.funcao}{e.local ? ` · ${e.local}` : ""}</p>
                {e.periodo && <p className="text-[12px] text-slate-400">{e.periodo}</p>}
                {e.descricao && <p className="text-[12.5px] text-slate-600 break-words">{e.descricao}</p>}
              </li>
            ))}
          </ul>
        </Bloco>
      )}
      {c.cursos?.length > 0 && (
        <Bloco icon={Award} titulo="Cursos e certificados">
          <ul className="flex flex-col gap-1">
            {c.cursos.map((x, i) => (
              <li key={i} className="text-[13px] text-slate-600 flex items-start gap-2 break-words">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" /> {x}
              </li>
            ))}
          </ul>
        </Bloco>
      )}
    </div>
  );
}

const Bloco = ({ icon: Icon, titulo, children }) => (
  <div>
    <p className="text-[12.5px] font-bold text-slate-600 mb-2 flex items-center gap-1.5"><Icon size={14} /> {titulo}</p>
    {children}
  </div>
);
