import { useEffect, useRef, useState } from "react";
import { Camera, Check, ImagePlus, CircleAlert } from "lucide-react";
import { CATEGORIES } from "../data/catalogo.js";
import { REGRAS_SENHA, reduzirImagem } from "../lib/validacao.js";
import { CameraCaptureModal } from "./CameraCaptureModal.jsx";
import { Avatar } from "./ui.jsx";

/* Foto de perfil: escolher da galeria ou tirar na hora. Devolve um Blob JPEG ≤ 512 px. */
export function FotoPerfil({ blob, urlAtual, nome, onChange, erro }) {
  const input = useRef(null);
  const [preview, setPreview] = useState(null);
  const [camera, setCamera] = useState(false);
  const [falha, setFalha] = useState("");

  useEffect(() => {
    if (!blob) return setPreview(null);
    const u = URL.createObjectURL(blob);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);

  const usarArquivo = async (arquivo) => {
    setFalha("");
    try {
      onChange(await reduzirImagem(arquivo));
    } catch (e) {
      setFalha(e.message);
    }
  };

  const daCamera = async (dataUrl) => {
    setCamera(false);
    const arquivo = await (await fetch(dataUrl)).blob();
    usarArquivo(new File([arquivo], "selfie.jpg", { type: "image/jpeg" }));
  };

  const temFoto = !!(preview || urlAtual);
  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => input.current?.click()} aria-label="Escolher foto de perfil" className="relative shrink-0">
        {temFoto ? (
          <Avatar url={preview || urlAtual} nome={nome} size={84} />
        ) : (
          <span className="w-[84px] h-[84px] rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-400">
            <ImagePlus size={22} />
            <span className="text-[10px] font-medium">Foto</span>
          </span>
        )}
        <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white">
          {temFoto ? <Check size={13} /> : <Camera size={13} />}
        </span>
      </button>
      <div className="min-w-0 space-y-1.5">
        <p className="text-[13.5px] font-bold text-slate-700">Foto de perfil</p>
        <p className={`text-[11.5px] leading-snug ${erro || falha ? "text-red-500 font-semibold" : "text-slate-400"}`}>
          {erro || falha || "Rosto visível passa mais confiança."}
        </p>
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={() => input.current?.click()} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[12px] font-bold">
            Galeria
          </button>
          <button type="button" onClick={() => setCamera(true)} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[12px] font-bold">
            Tirar foto
          </button>
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) usarArquivo(f);
        }}
      />
      {camera && (
        <CameraCaptureModal
          title="Foto de perfil"
          hint="Centralize o rosto e toque em Capturar."
          onCapture={daCamera}
          onClose={() => setCamera(false)}
        />
      )}
    </div>
  );
}

/* Áreas/categorias de atuação (avisos de novas vagas usam esta escolha). */
export function SeletorAreas({ valor, onChange, erro }) {
  const alternar = (a) => onChange(valor.includes(a) ? valor.filter((x) => x !== a) : [...valor, a]);
  return (
    <fieldset>
      <legend className="text-[12.5px] font-bold text-slate-600 mb-2">Áreas em que você atua</legend>
      <div className="grid grid-cols-2 gap-2">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const ativo = valor.includes(c.label);
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={ativo}
              onClick={() => alternar(c.label)}
              className={`flex items-center gap-2 min-w-0 px-3 py-2.5 rounded-xl border-2 text-left text-[12.5px] font-semibold transition ${
                ativo ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="truncate">{c.label}</span>
              {ativo && <Check size={14} className="ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>
      <p className={`text-[11.5px] mt-1.5 ${erro ? "text-red-500 font-semibold" : "text-slate-400"}`}>
        {erro || "Você recebe aviso quando sair vaga nessas áreas."}
      </p>
    </fieldset>
  );
}

export function RequisitosSenha({ senha }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2" aria-label="Requisitos da senha">
      {REGRAS_SENHA.map((r) => {
        const ok = r.ok(senha);
        return (
          <li key={r.id} className={`flex items-center gap-1.5 text-[11.5px] ${ok ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
            {ok ? <Check size={12} className="shrink-0" /> : <CircleAlert size={12} className="shrink-0" />}
            <span>{r.texto}</span>
          </li>
        );
      })}
    </ul>
  );
}
