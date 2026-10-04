import { Check, Camera, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  LIVE CAMERA CAPTURE (verificação de identidade por selfie ao vivo) */
/* ------------------------------------------------------------------ */

export function CameraCaptureModal({ title, hint, onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState(null);

  useEffect(() => {
    let active = true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Este navegador não tem suporte a acesso à câmera.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        if (active) setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
      });
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const stopStream = () => streamRef.current?.getTracks().forEach((t) => t.stop());

  const handleShoot = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    setCaptured(canvas.toDataURL("image/jpeg", 0.9));
  };

  const handleConfirm = () => {
    stopStream();
    onCapture(captured);
  };

  const handleClose = () => {
    stopStream();
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-slate-900 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <p className="text-white font-bold text-[13.5px]">{title}</p>
          <button type="button" onClick={handleClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="relative bg-black aspect-[3/4] flex items-center justify-center">
          {error ? (
            <p className="text-red-400 text-[12px] text-center px-6 leading-snug">{error}</p>
          ) : captured ? (
            <img src={captured} alt="Selfie capturada" className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <p className="text-slate-400 text-[11px] text-center px-5 py-2 leading-snug">{hint}</p>

        <div className="flex gap-2 p-4 pt-1">
          {!error && !captured && (
            <button
              type="button"
              onClick={handleShoot}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] py-3 rounded-xl flex items-center justify-center gap-2"
            >
              <Camera size={16} /> Capturar foto
            </button>
          )}
          {captured && (
            <>
              <button
                type="button"
                onClick={() => setCaptured(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[13px] py-3 rounded-xl"
              >
                Tirar novamente
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13px] py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Check size={16} /> Usar esta foto
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
