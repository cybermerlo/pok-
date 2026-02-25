"use client";

import { useEffect, useState, useCallback } from "react";

type PokeData = {
  remaining: number;
  history: { date: string; user: string }[];
  todayUser: string | null;
  todayDate: string | null;
};

const NICK_KEY = "poke-nick";

function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

export default function Home() {
  const [data, setData] = useState<PokeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nick, setNick] = useState("");
  const [nickInput, setNickInput] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/poke");
      const json = await res.json();
      setData(json);
    } catch {
      setData({
        remaining: 42,
        history: [],
        todayUser: null,
        todayDate: null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(NICK_KEY) : null;
    if (saved) {
      setNick(saved);
      setNickInput(saved);
    }
    fetchData();
  }, [fetchData]);

  const saveNick = () => {
    const v = nickInput.trim();
    if (!v) return;
    setNick(v);
    if (typeof window !== "undefined") localStorage.setItem(NICK_KEY, v);
  };

  const handleTakePoke = async () => {
    if (!nick.trim()) {
      setMessage({ type: "err", text: "Scrivi il tuo nickname qui sotto e salvalo!" });
      return;
    }
    setConfirmOpen(true);
  };

  const confirmTakePoke = async () => {
    if (!nick.trim()) return;
    setSending(true);
    setMessage(null);
    setModalError(null);
    try {
      const res = await fetch("/api/poke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: nick.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.success && json.data) {
        setData(json.data);
        setConfirmOpen(false);
        setMessage({ type: "ok", text: "Pokè segnata! 🍣" });
      } else {
        const errMsg =
          json.message ||
          (res.status === 503
            ? "Storage Vercel Blob non configurato. Crea uno Blob store nel progetto su Vercel."
            : res.status >= 500
              ? "Errore del server. Riprova o controlla la configurazione su Vercel."
              : "Qualcosa è andato storto. Riprova.");
        setModalError(errMsg);
        setMessage({ type: "err", text: errMsg });
      }
    } catch {
      const err = "Errore di rete. Riprova.";
      setModalError(err);
      setMessage({ type: "err", text: err });
    } finally {
      setSending(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50">
        <div className="text-2xl text-pink-400 animate-pulse">Caricamento...</div>
      </div>
    );
  }

  const total = 42;
  const received = total - data.remaining;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 font-[family-name:var(--font-nunito)]">
      <div className="max-w-md mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-center text-rose-400 drop-shadow-sm mb-2">
          Pokè in arrivo 🍣
        </h1>
        <p className="text-center text-rose-300/90 text-sm mb-8">
          Quante ne mancano ancora?
        </p>

        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-lg shadow-pink-200/50 border border-pink-200/60 p-8 mb-6">
          <div className="text-center">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400 mb-1">
              {data.remaining}
            </div>
            <p className="text-pink-400/90 text-sm font-medium">
              {data.remaining === 1 ? "ne manca 1" : `ne mancano ${data.remaining}`} su {total}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <label className="text-xs font-medium text-rose-400/90">Il tuo nickname</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickInput}
                onChange={(e) => setNickInput(e.target.value)}
                onBlur={saveNick}
                onKeyDown={(e) => e.key === "Enter" && saveNick()}
                placeholder="es. Mario"
                className="flex-1 rounded-2xl border-2 border-pink-200/80 bg-white/90 px-4 py-3 text-rose-800 placeholder-rose-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition"
              />
              <button
                type="button"
                onClick={saveNick}
                className="rounded-2xl bg-rose-200/80 text-rose-700 px-4 py-3 font-medium hover:bg-rose-300/80 transition shrink-0"
              >
                Salva
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTakePoke}
            disabled={data.remaining <= 0}
            className="mt-8 w-full rounded-2xl bg-gradient-to-r from-rose-400 to-orange-400 text-white font-bold py-4 px-6 shadow-lg shadow-rose-300/50 hover:shadow-rose-400/50 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed text-lg"
          >
            {data.remaining <= 0 ? "Tutte prese!" : "Ho preso una pokè! 🍣"}
          </button>

          {message && (
            <div
              className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
                message.type === "ok"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-rose-100 text-rose-800 border border-rose-200"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {data.history.length > 0 && (
          <div className="bg-white/80 backdrop-blur rounded-3xl shadow-lg shadow-pink-200/50 border border-pink-200/60 p-6">
            <h2 className="text-lg font-bold text-rose-400 mb-3">Quando le hai prese</h2>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {[...data.history].reverse().slice(0, 50).map((h, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center text-sm text-rose-700/90 bg-pink-50/80 rounded-xl px-3 py-2"
                >
                  <span>{formatDate(h.date)}</span>
                  <span className="font-medium text-rose-500">{h.user}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => !sending && setConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-pink-200 p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {modalError ? (
              <>
                <p className="text-center text-rose-600 font-medium mb-4">{modalError}</p>
                <button
                  type="button"
                  onClick={() => { setConfirmOpen(false); setModalError(null); }}
                  className="w-full rounded-2xl bg-rose-200 text-rose-800 py-3 font-medium"
                >
                  Ok
                </button>
              </>
            ) : (
              <>
                <p className="text-center text-rose-800 font-medium mb-2">
                  Sei sicuro di aver preso una pokè?
                </p>
                <p className="text-center text-rose-500 text-sm mb-6">
                  Così eviti di segnare per sbaglio.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => !sending && setConfirmOpen(false)}
                    disabled={sending}
                    className="flex-1 rounded-2xl border-2 border-rose-200 text-rose-600 py-3 font-medium hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    No, annulla
                  </button>
                  <button
                    type="button"
                    onClick={confirmTakePoke}
                    disabled={sending}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-rose-400 to-orange-400 text-white py-3 font-bold hover:opacity-95 transition disabled:opacity-50"
                  >
                    {sending ? "..." : "Sì! 🍣"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
