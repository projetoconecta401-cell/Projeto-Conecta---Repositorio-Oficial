import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { ativarPush, desativarPush, situacaoPush } from "../lib/push.js";
import BotaoInstalar from "./BotaoInstalar.jsx";

/* Ativa/desativa neste aparelho os avisos de nova vaga com o app fechado (Web Push). */
export function CartaoPush() {
  const [sit, setSit] = useState("carregando");
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    situacaoPush().then(setSit).catch(() => setSit("sem-suporte"));
  }, []);

  const alternar = async () => {
    setOcupado(true);
    setErro("");
    try {
      if (sit === "ativo") {
        await desativarPush();
        setSit("inativo");
      } else {
        await ativarPush();
        setSit("ativo");
      }
    } catch (e) {
      setErro(e.message);
      setSit(await situacaoPush().catch(() => "sem-suporte"));
    } finally {
      setOcupado(false);
    }
  };

  const textos = {
    carregando: "Verificando…",
    ativo: "Ativado neste aparelho: você recebe um aviso quando sair vaga nas suas áreas.",
    inativo: "Receba um aviso no celular quando sair vaga nas suas áreas, mesmo com o app fechado.",
    negado: "As notificações estão bloqueadas. Libere nas configurações do navegador para este site.",
    "instalar-ios": "No iPhone, os avisos funcionam com o EiFreela instalado na Tela de Início (iOS 16.4 ou mais novo).",
    "sem-suporte": "Este navegador não suporta avisos com o app fechado. Os alertas continuam aparecendo dentro do app.",
  };

  return (
    <div className="flex gap-3 p-4 rounded-2xl bg-white border border-slate-100">
      <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
        <Bell size={19} />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-[13.5px] font-bold text-slate-800">Avisos de novas vagas</p>
        <p className="text-[12px] text-slate-500 leading-snug">{textos[sit]}</p>
        {erro && <p className="text-[12px] text-red-500 font-semibold">{erro}</p>}
        {(sit === "ativo" || sit === "inativo") && (
          <button
            onClick={alternar}
            disabled={ocupado}
            className={`px-4 py-2 rounded-lg text-[12.5px] font-bold disabled:opacity-50 ${sit === "ativo" ? "bg-slate-100 text-slate-600" : "bg-emerald-600 text-white"}`}
          >
            {ocupado ? "Aguarde…" : sit === "ativo" ? "Desativar" : "Ativar avisos"}
          </button>
        )}
        {sit === "instalar-ios" && <BotaoInstalar compacto />}
      </div>
    </div>
  );
}
