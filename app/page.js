"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// --- Confetti helper ---
function spawnConfetti() {
  const colors = ["#ff6eb4", "#c084fc", "#fde68a", "#86efac", "#fb923c", "#60a5fa"];
  const container = document.body;
  for (let i = 0; i < 60; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = Math.random() * 100 + "vw";
    el.style.top = "-20px";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = Math.random() * 10 + 6 + "px";
    el.style.height = Math.random() * 10 + 6 + "px";
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    el.style.animationDuration = Math.random() * 2 + 1.5 + "s";
    el.style.animationDelay = Math.random() * 0.8 + "s";
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

// --- Floating sparkles in background ---
const SPARKLES = ["✨", "⭐", "🌟", "💫", "🌸", "🎀", "🍡", "🌺", "💕", "🎐"];
const BG_SPARKLES = [
  { emoji: "✨", top: "8%", left: "5%", delay: "0s", duration: "4s" },
  { emoji: "🌸", top: "15%", right: "8%", delay: "0.5s", duration: "5s" },
  { emoji: "💫", top: "75%", left: "3%", delay: "1s", duration: "3.5s" },
  { emoji: "⭐", top: "80%", right: "5%", delay: "1.5s", duration: "4.5s" },
  { emoji: "🎀", top: "40%", left: "2%", delay: "0.8s", duration: "6s" },
  { emoji: "🌟", top: "55%", right: "3%", delay: "2s", duration: "4s" },
  { emoji: "💕", top: "20%", left: "12%", delay: "1.2s", duration: "5.5s" },
  { emoji: "🍡", top: "90%", left: "15%", delay: "0.3s", duration: "4.2s" },
];

// Hold-to-confirm button
const HOLD_DURATION = 1500; // ms

function HoldButton({ onConfirm, disabled }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const confirmedRef = useRef(false);

  const startHold = useCallback(() => {
    if (disabled) return;
    confirmedRef.current = false;
    setHolding(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(p);
      if (p >= 100 && !confirmedRef.current) {
        confirmedRef.current = true;
        clearInterval(intervalRef.current);
        setHolding(false);
        setProgress(0);
        onConfirm();
      }
    }, 16);
  }, [disabled, onConfirm]);

  const cancelHold = useCallback(() => {
    clearInterval(intervalRef.current);
    setHolding(false);
    setProgress(0);
  }, []);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={(e) => { e.preventDefault(); startHold(); }}
        onTouchEnd={cancelHold}
        disabled={disabled}
        className={`
          relative overflow-hidden
          w-64 h-64 rounded-full
          font-black text-white text-xl
          shadow-2xl
          transition-all duration-200
          select-none cursor-pointer
          ${disabled
            ? "opacity-40 cursor-not-allowed bg-gray-300"
            : holding
            ? "scale-95 bg-gradient-to-br from-pink-400 via-purple-400 to-orange-300 animate-glow"
            : "bg-gradient-to-br from-pink-400 via-pink-500 to-purple-500 animate-glow hover:scale-105 active:scale-95"
          }
        `}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {/* Progress ring */}
        {holding && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="6"
            />
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
              style={{ transition: "stroke-dashoffset 0.016s linear" }}
            />
          </svg>
        )}
        <div className="relative z-10 flex flex-col items-center justify-center gap-1">
          <span className="text-5xl mb-1" role="img" aria-label="poke">🍣</span>
          <span className="text-base font-black tracking-wide text-center leading-tight px-4">
            {holding
              ? "Tieni premuto..."
              : disabled
              ? "Completo! 🎉"
              : "HO PRESO\nUNA POKÈ!"}
          </span>
          {!holding && !disabled && (
            <span className="text-xs font-semibold opacity-80 mt-1">
              (tieni premuto)
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

// --- History list ---
function HistoryList({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-4">
        Nessuna pokè ancora... 😢
      </p>
    );
  }

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
      {sorted.map((entry, i) => {
        const d = new Date(entry.date + "T12:00:00"); // noon to avoid timezone issues
        const label = d.toLocaleDateString("it-IT", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        return (
          <li
            key={entry.date}
            className="flex items-center gap-3 bg-pink-50 rounded-2xl px-4 py-3 border border-pink-100"
          >
            <span className="text-xl">🍣</span>
            <div className="flex-1">
              <p className="font-bold text-gray-700 text-sm capitalize">{label}</p>
              <p className="text-xs text-gray-400">#{entries.length - i}</p>
            </div>
            <span className="text-green-500 text-lg">✓</span>
          </li>
        );
      })}
    </ul>
  );
}

// --- Toast notification ---
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    warning: "bg-yellow-100 border-yellow-300 text-yellow-800",
    success: "bg-green-100 border-green-300 text-green-800",
    error: "bg-red-100 border-red-300 text-red-800",
  };

  const icons = {
    warning: "⚠️",
    success: "✅",
    error: "❌",
  };

  return (
    <div
      className={`
        fixed top-6 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3
        px-6 py-4 rounded-2xl border-2 shadow-lg
        font-bold text-sm
        animate-pop-in
        ${colors[type]}
      `}
      style={{ minWidth: "280px", maxWidth: "90vw" }}
    >
      <span className="text-xl">{icons[type]}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-auto opacity-60 hover:opacity-100 text-lg">✕</button>
    </div>
  );
}

// --- Main page ---
export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(null);
  const [numberKey, setNumberKey] = useState(0); // to retrigger animation
  const [showHistory, setShowHistory] = useState(false);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/poke");
      if (!res.ok) throw new Error("Errore nel caricare i dati");
      const d = await res.json();
      setData(d);
    } catch {
      showToast("Errore nel caricare i dati 😰", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddPoke = useCallback(async () => {
    if (adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/poke", { method: "POST" });
      const json = await res.json();

      if (json.alreadyToday) {
        showToast("Hai già registrato una pokè oggi! 🍣 Domani!", "warning");
        return;
      }
      if (!res.ok || !json.success) {
        showToast(json.error || "Qualcosa è andato storto 😬", "error");
        return;
      }

      setData(json.data);
      setNumberKey((k) => k + 1);
      spawnConfetti();
      const remaining = json.data.total - json.data.entries.length;
      if (remaining === 0) {
        showToast("HAI FINITO TUTTE LE POKÈ! 🎊🍣🎊 Sono tue!", "success");
      } else {
        showToast(`Pokè registrata! Ne mancano ancora ${remaining} 🍣`, "success");
      }
    } catch {
      showToast("Errore di rete 😰 Riprova!", "error");
    } finally {
      setAdding(false);
    }
  }, [adding, showToast]);

  const remaining = data ? data.total - data.entries.length : 42;
  const received = data ? data.entries.length : 0;
  const percent = data ? (received / data.total) * 100 : 0;
  const isComplete = remaining === 0;

  // Face based on progress
  const getFace = () => {
    if (isComplete) return "🥳";
    if (percent >= 75) return "😁";
    if (percent >= 50) return "😊";
    if (percent >= 25) return "🙂";
    return "😢";
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-start py-8 px-4 relative overflow-hidden">
      {/* Background floating sparkles */}
      {BG_SPARKLES.map((s, i) => (
        <span
          key={i}
          className="sparkle text-2xl select-none"
          style={{
            top: s.top,
            left: s.left,
            right: s.right,
            animationDelay: s.delay,
            animationDuration: s.duration,
          }}
        >
          {s.emoji}
        </span>
      ))}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col items-center mb-6 mt-2">
        <h1 className="text-4xl font-black gradient-text tracking-tight text-center">
          🍣 Pokè Tracker 🍣
        </h1>
        <p className="text-gray-500 font-semibold mt-1 text-sm">
          Le pokè che mi devi, amico mio~
        </p>
      </div>

      {/* Main card */}
      <div className="card-kawaii w-full max-w-sm p-8 flex flex-col items-center gap-6 mb-6">

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <span className="text-5xl animate-spin-slow">🌸</span>
            <p className="text-pink-400 font-bold">Caricamento...</p>
          </div>
        ) : (
          <>
            {/* Big countdown number */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
                Pokè rimanenti
              </p>
              <div
                key={numberKey}
                className="animate-number-pop"
              >
                <span
                  className="text-9xl font-black gradient-text leading-none"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  {remaining}
                </span>
              </div>
              <p className="text-gray-400 font-semibold text-sm">
                su {data?.total ?? 42} totali
              </p>
              <span className="text-4xl mt-1">{getFace()}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                <span>Prese: {received}</span>
                <span>{Math.round(percent)}%</span>
              </div>
              <div className="w-full h-5 bg-pink-100 rounded-full overflow-hidden border border-pink-200">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${percent}%`,
                    background: "linear-gradient(90deg, #ff6eb4, #c084fc, #fb923c)",
                  }}
                />
              </div>
            </div>

            {/* Hold button */}
            <HoldButton onConfirm={handleAddPoke} disabled={isComplete || adding} />

            {isComplete && (
              <div className="text-center animate-heartbeat">
                <p className="text-2xl font-black gradient-text">TUTTE PRESE! 🎊</p>
                <p className="text-gray-500 text-sm">Hai mangiato tutte le 42 pokè!</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* History toggle */}
      {!loading && data && (
        <div className="card-kawaii w-full max-w-sm p-6">
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="w-full flex items-center justify-between font-black text-gray-600 hover:text-pink-500 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              Storico pokè ({received})
            </span>
            <span
              className="text-xl transition-transform duration-300"
              style={{ transform: showHistory ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              ▾
            </span>
          </button>
          {showHistory && (
            <div className="mt-4 animate-pop-in">
              <HistoryList entries={data.entries} />
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="mt-8 text-gray-300 text-xs font-semibold">
        made with 💕 & pokè
      </p>
    </main>
  );
}
