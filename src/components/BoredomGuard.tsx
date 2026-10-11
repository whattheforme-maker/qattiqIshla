"use client";
import { useEffect, useRef, useState } from "react";
import MiniGame from "./MiniGame";

export default function BoredomGuard({ loading }: { loading?: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<"idle" | "waiting">("idle");
  const lastAct = useRef(Date.now());
  const loadingSince = useRef<number | null>(null);

  useEffect(() => {
    const bump = () => {
      lastAct.current = Date.now();
    };
    window.addEventListener("mousemove", bump);
    window.addEventListener("keydown", bump);
    window.addEventListener("touchstart", bump);
    window.addEventListener("click", bump);
    const t = setInterval(() => {
      const idleSec = (Date.now() - lastAct.current) / 1000;
      if (idleSec > 50 && !open) {
        setReason("idle");
        setOpen(true);
        lastAct.current = Date.now();
      }
      if (loading) {
        if (!loadingSince.current) loadingSince.current = Date.now();
        const waitSec = (Date.now() - loadingSince.current) / 1000;
        if (waitSec > 12 && !open) {
          setReason("waiting");
          setOpen(true);
        }
      } else {
        loadingSince.current = null;
      }
    }, 1000);
    return () => {
      clearInterval(t);
      window.removeEventListener("mousemove", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("touchstart", bump);
      window.removeEventListener("click", bump);
    };
  }, [loading, open]);

  if (!open) return null;
  return (
    <div className="modal-blur fixed inset-0 z-[80] grid place-items-center p-4">
      <div className="glass w-full max-w-[560px] rounded-3xl p-6 md:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-[#e8b07a]">ANTI-ZERIKISH TIZIMI 🎮</p>
            <h3 className="font-display mt-2 text-3xl">
              {reason === "idle" ? "Zerikdingizmi?" : "Kutish cho'zildimi?"}
            </h3>
            <p className="mt-2 text-sm text-white/70">
              {reason === "idle"
                ? "50 soniyadan beri harakatsizsiz. Miya sovumasligi uchun 1 daqiqalik inglizcha o'yin o'ynang — XP ham beradi!"
                : "Yuklanish cho'zildi. Vaqtni boy bermang — shu orada inglizcha mini-o'yin o'ynang!"}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="chip rounded-full px-3 py-1.5 text-sm text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="mt-5">
          <MiniGame onWin={() => {}} compact />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setOpen(false)} className="btn-gold flex-1 rounded-2xl px-4 py-3 text-sm font-bold">
            Davom etish →
          </button>
        </div>
      </div>
    </div>
  );
}
