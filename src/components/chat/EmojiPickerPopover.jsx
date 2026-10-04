import { useRef, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  EMOJI PICKER, GRAVADOR DE ÁUDIO E PLAYER — usados nos dois chats   */
/* ------------------------------------------------------------------ */

export const COMMON_EMOJIS = [
  "😀", "😂", "😍", "👍", "🙏", "🎉", "❤️", "😢", "😮", "👏",
  "🔥", "✅", "🙌", "😅", "🤝", "💪", "📍", "⏰", "💬", "👌",
  "😎", "🥳", "😴", "🤔", "👋", "💰", "📸", "⚠️", "✨", "😊",
];

export function EmojiPickerPopover({ onSelect, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-64 max-h-56 overflow-y-auto bg-white rounded-xl border border-slate-100 shadow-lg shadow-slate-900/10 p-2.5 grid grid-cols-6 gap-1 z-30"
    >
      {COMMON_EMOJIS.map((emoji, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(emoji)}
          className="text-xl leading-none py-1.5 rounded-lg hover:bg-slate-50 transition"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
