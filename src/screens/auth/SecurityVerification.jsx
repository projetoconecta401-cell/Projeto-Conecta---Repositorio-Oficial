import { ShieldCheck, Camera, CreditCard, Wallet, CheckCircle2, FileText } from "lucide-react";
import { useState } from "react";
import { CameraCaptureModal } from "../../components/CameraCaptureModal.jsx";
import { Screen, TopBar, Field, PrimaryButton, UploadBox } from "../../components/ui.jsx";

export function SecurityVerification({ onNext, onBack }) {
  const [doc, setDoc] = useState(false);
  const [selfie, setSelfie] = useState(false);
  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const canContinue = doc && selfie;

  const handleSelfieCapture = (photoDataUrl) => {
    setSelfiePhoto(photoDataUrl);
    setSelfie(true);
    setShowCamera(false);
  };

  return (
    <Screen>
      <TopBar title="Verificação de Segurança" onBack={onBack} />
      <div className="flex-1 px-6 py-6 space-y-6 relative">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-emerald-700 leading-snug">
            Para garantir a segurança de toda a comunidade, precisamos confirmar sua identidade. Seus dados são protegidos conforme a LGPD.
          </p>
        </div>

        <div>
          <p className="text-[13px] font-bold text-slate-700 mb-2">Documento com foto (RG ou CNH)</p>
          <UploadBox label="Foto do documento" hint="Frente legível, sem cortes" icon={FileText} done={doc} onClick={() => setDoc(true)} />
        </div>

        <div>
          <p className="text-[13px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Camera size={15} /> Selfie de verificação (ao vivo)
          </p>
          <p className="text-[11.5px] text-slate-400 mb-2.5 leading-snug">
            Por segurança, a foto é tirada agora, pela câmera do dispositivo — não é possível enviar uma imagem da galeria.
          </p>

          {selfie && selfiePhoto ? (
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-emerald-300 bg-emerald-50 text-left"
            >
              <img src={selfiePhoto} alt="Selfie capturada" className="w-14 h-14 rounded-lg object-cover border border-emerald-300 shrink-0" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 size={14} className="shrink-0" /> Selfie verificada
                </p>
                <p className="text-[11.5px] text-emerald-600 truncate">Toque para tirar novamente</p>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/50 transition"
            >
              <Camera size={22} className="text-slate-400" />
              <span className="text-[13px] font-semibold text-slate-600">Abrir câmera e tirar selfie</span>
              <span className="text-[11px] text-slate-400">Rosto visível, boa iluminação</span>
            </button>
          )}
        </div>

        <div className="border-t border-slate-100 pt-5">
          <p className="text-[13px] font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Wallet size={15} /> Dados bancários para recebimento
          </p>
          <div className="space-y-2.5">
            <Field placeholder="Banco" />
            <div className="grid grid-cols-2 gap-2.5">
              <Field placeholder="Agência" />
              <Field placeholder="Conta" />
            </div>
            <Field icon={CreditCard} placeholder="Chave PIX (CPF, e-mail ou celular)" />
          </div>
        </div>

        <PrimaryButton disabled={!canContinue} onClick={onNext}>Continuar</PrimaryButton>
      </div>

      {showCamera && (
        <CameraCaptureModal
          title="Selfie de verificação"
          hint="Centralize o rosto no quadro e mantenha boa iluminação antes de capturar."
          onCapture={handleSelfieCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </Screen>
  );
}
