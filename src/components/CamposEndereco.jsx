import { useEffect, useRef, useState } from "react";
import { Building2, Loader2, MapPin } from "lucide-react";
import { Campo, Field } from "./ui.jsx";
import { UFS, buscarCep, mascaraCEP, mascaraCNPJ } from "../lib/endereco.js";

const caixa =
  "w-full px-3.5 py-3 rounded-xl border bg-white text-[16px] text-slate-800 focus:outline-none focus:ring-2 transition";
const okBorda = "border-slate-200 focus:ring-emerald-500/40 focus:border-emerald-500";
const erroBorda = "border-red-300 focus:ring-red-500/30";

/*
 * Endereço com busca pelo CEP. Ao digitar os 8 números, rua, bairro, cidade e UF são
 * preenchidos (a pessoa pode corrigir). Se a busca falhar, preenche à mão.
 * Os campos com erro recebem data-erro="1" para a tela rolar até eles.
 */
export function CamposEndereco({ valor, onChange, erros = {}, titulo = "Endereço", ajuda }) {
  const [status, setStatus] = useState(""); // "" | buscando | ok | nao | falhou
  const ultimo = useRef("");
  const set = (campo, v) => onChange({ ...valor, [campo]: v });

  useEffect(() => {
    const d = valor.cep.replace(/\D/g, "");
    if (d.length !== 8 || d === ultimo.current) return;
    ultimo.current = d;
    let vivo = true;
    setStatus("buscando");
    buscarCep(d).then((r) => {
      if (!vivo) return;
      if (!r) return setStatus("falhou");
      if (r.naoEncontrado) return setStatus("nao");
      setStatus("ok");
      onChange({
        ...valor,
        logradouro: r.logradouro || valor.logradouro,
        bairro: r.bairro || valor.bairro,
        cidade: r.cidade || valor.cidade,
        uf: r.uf || valor.uf,
      });
    });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor.cep]);

  const marca = (c) => (erros[c] ? { "data-erro": "1" } : {});
  const aviso = {
    buscando: { cor: "text-slate-500", txt: "Buscando o endereço…" },
    ok: { cor: "text-emerald-700", txt: "Endereço encontrado. Confira e complete com o número." },
    nao: { cor: "text-amber-700", txt: "CEP não encontrado. Confira o número ou preencha o endereço à mão." },
    falhou: { cor: "text-amber-700", txt: "Não foi possível consultar o CEP agora. Preencha o endereço à mão." },
  }[status];

  return (
    <section className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-slate-100">
      <div>
        <p className="text-[14px] font-extrabold text-slate-800 flex items-center gap-1.5"><MapPin size={16} className="text-emerald-600" /> {titulo}</p>
        <p className="text-[11.5px] text-slate-500 mt-0.5 leading-snug">
          {ajuda ?? "Só você vê o endereço completo. Para os outros usuários aparecem apenas a cidade e o estado."}
        </p>
      </div>

      <div {...marca("cep")}>
        <Campo label="CEP" erro={erros.cep}>
          <div className="relative">
            <Field inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={valor.cep} onChange={(e) => set("cep", mascaraCEP(e.target.value))} invalid={!!erros.cep} />
            {status === "buscando" && <Loader2 size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 animate-spin" />}
          </div>
        </Campo>
        {aviso && !erros.cep && <p className={`text-[11.5px] mt-1.5 font-medium ${aviso.cor}`}>{aviso.txt}</p>}
        <a href="https://buscacepinter.correios.com.br/" target="_blank" rel="noopener" className="inline-block text-[11.5px] text-teal-600 font-semibold mt-1">
          Não sei meu CEP
        </a>
      </div>

      <div {...marca("logradouro")}>
        <Campo label="Rua ou avenida" erro={erros.logradouro}>
          <Field autoComplete="address-line1" maxLength={120} placeholder="Ex.: Av. Porto Velho" value={valor.logradouro} onChange={(e) => set("logradouro", e.target.value)} invalid={!!erros.logradouro} />
        </Campo>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-3">
        <div {...marca("numero")}>
          <Campo label="Número" erro={erros.numero}>
            <Field inputMode="text" maxLength={20} placeholder="Ex.: 123" value={valor.numero} onChange={(e) => set("numero", e.target.value)} invalid={!!erros.numero} />
          </Campo>
        </div>
        <div {...marca("complemento")}>
          <Campo label="Complemento (opcional)" erro={erros.complemento}>
            <Field autoComplete="address-line2" maxLength={60} placeholder="Apto, bloco, casa…" value={valor.complemento} onChange={(e) => set("complemento", e.target.value)} invalid={!!erros.complemento} />
          </Campo>
        </div>
      </div>

      <div {...marca("bairro")}>
        <Campo label="Bairro" erro={erros.bairro}>
          <Field maxLength={80} placeholder="Ex.: Centro" value={valor.bairro} onChange={(e) => set("bairro", e.target.value)} invalid={!!erros.bairro} />
        </Campo>
      </div>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3">
        <div {...marca("cidade")}>
          <Campo label="Cidade" erro={erros.cidade}>
            <Field autoComplete="address-level2" maxLength={80} placeholder="Ex.: Cacoal" value={valor.cidade} onChange={(e) => set("cidade", e.target.value)} invalid={!!erros.cidade} />
          </Campo>
        </div>
        <div {...marca("uf")}>
          <Campo label="Estado" erro={erros.uf}>
            <select value={valor.uf} onChange={(e) => set("uf", e.target.value)} aria-label="Estado" className={`${caixa} ${erros.uf ? erroBorda : okBorda}`}>
              <option value="">UF</option>
              {UFS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </Campo>
        </div>
      </div>
    </section>
  );
}

/*
 * Dados de contratante: empresa (CNPJ) ou pessoa física.
 * comOpcao = mostra a caixa "Também quero contratar" (cadastro); sem ela, o bloco é obrigatório.
 */
export function CamposContratante({ valor, onChange, erros = {}, comOpcao = true }) {
  const set = (campo, v) => onChange({ ...valor, [campo]: v });
  const marca = (c) => (erros[c] ? { "data-erro": "1" } : {});
  const aberto = !comOpcao || valor.quer;
  return (
    <section className="flex flex-col gap-3 p-4 rounded-2xl bg-white border border-slate-100">
      {comOpcao ? (
        <label className="flex items-start gap-2.5">
          <input type="checkbox" checked={valor.quer} onChange={(e) => set("quer", e.target.checked)} className="mt-0.5 w-5 h-5 shrink-0 accent-emerald-600" />
          <span>
            <span className="block text-[14px] font-extrabold text-slate-800">Também quero contratar</span>
            <span className="block text-[11.5px] text-slate-500 leading-snug mt-0.5">
              Contratantes podem ver e pesquisar os profissionais. Você também pode fazer isso depois, em Perfil.
            </span>
          </span>
        </label>
      ) : (
        <p className="text-[14px] font-extrabold text-slate-800 flex items-center gap-1.5"><Building2 size={16} className="text-emerald-600" /> Como você vai contratar?</p>
      )}

      {aberto && (
        <>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Tipo de contratante">
            {[
              { v: "pf", t: "Pessoa física", d: "Para sua casa ou família" },
              { v: "pj", t: "Empresa / MEI", d: "Com CNPJ" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                role="radio"
                aria-checked={valor.tipo === o.v}
                onClick={() => set("tipo", o.v)}
                className={`p-3 rounded-xl border-2 text-left ${valor.tipo === o.v ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white"}`}
              >
                <span className={`block text-[13.5px] font-bold ${valor.tipo === o.v ? "text-emerald-700" : "text-slate-700"}`}>{o.t}</span>
                <span className="block text-[11.5px] text-slate-500">{o.d}</span>
              </button>
            ))}
          </div>

          {valor.tipo === "pj" && (
            <div {...marca("cnpj")}>
              <Campo label="CNPJ" erro={erros.cnpj} ajuda="Conferimos o formato e os dígitos. O CNPJ fica visível só para você.">
                <Field inputMode="text" autoCapitalize="characters" placeholder="00.000.000/0000-00" value={valor.cnpj} onChange={(e) => set("cnpj", mascaraCNPJ(e.target.value))} invalid={!!erros.cnpj} />
              </Campo>
            </div>
          )}
          <div {...marca("empresa")}>
            <Campo label={valor.tipo === "pj" ? "Nome da empresa" : "Nome da empresa (opcional)"} erro={erros.empresa}>
              <Field maxLength={120} placeholder={valor.tipo === "pj" ? "Ex.: Buffet Sabor & Arte" : "Deixe em branco se não tiver"} value={valor.empresa} onChange={(e) => set("empresa", e.target.value)} invalid={!!erros.empresa} />
            </Campo>
          </div>
          {valor.tipo === "pf" && (
            <p className="text-[11.5px] text-slate-500 leading-snug">
              Como pessoa física, você contrata com o CPF já informado e o endereço completo.
            </p>
          )}
        </>
      )}
    </section>
  );
}
