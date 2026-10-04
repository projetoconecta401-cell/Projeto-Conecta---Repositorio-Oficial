import { Square, Mic } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function VoiceRecorderButton({ onRecorded }) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    []
  );

  const startRecording = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Este navegador não tem suporte a gravação de áudio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
        onRecorded(url, duration);
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      startTimeRef.current = Date.now();
      recorder.start();
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Não foi possível acessar o microfone. Verifique as permissões do navegador.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    setRecording(false);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (recording) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 shrink-0">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
        <span className="text-[12.5px] font-bold text-red-600 tabular-nums">{formatTime(seconds)}</span>
        <button type="button" onClick={stopRecording} className="p-1.5 rounded-lg bg-red-500 text-white shrink-0" aria-label="Parar e enviar áudio">
          <Square size={13} fill="currentColor" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={startRecording}
        className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
        aria-label="Gravar áudio"
      >
        <Mic size={18} />
      </button>
      {error && (
        <p className="absolute bottom-full mb-1 right-0 w-48 text-[10.5px] text-red-500 bg-white border border-red-200 rounded-lg p-1.5 shadow z-20">
          {error}
        </p>
      )}
    </div>
  );
}
