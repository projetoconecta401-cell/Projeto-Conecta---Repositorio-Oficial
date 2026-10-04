import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

export function AudioMessageBubble({ src, duration, mine }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else audio.play();
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl min-w-[9.5rem] ${
        mine ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${mine ? "bg-white/20" : "bg-emerald-50 text-emerald-600"}`}
        aria-label={playing ? "Pausar áudio" : "Reproduzir áudio"}
      >
        {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`h-1 rounded-full ${mine ? "bg-white/30" : "bg-slate-200"}`}>
          <div
            className={`h-1 rounded-full transition-[width] ${mine ? "bg-white" : "bg-emerald-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className="text-[11px] font-medium tabular-nums shrink-0">{formatTime(duration || 0)}</span>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
      />
    </div>
  );
}
