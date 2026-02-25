const GIST_ID = process.env.GITHUB_GIST_ID || "a5d66a7703274cb6789773b3936a8c7d";
const GIST_TOKEN = process.env.GITHUB_GIST_TOKEN;

export type PokeData = {
  remaining: number;
  history: { date: string; user: string }[];
  todayUser: string | null;
  todayDate: string | null;
};

const DEFAULT_DATA: PokeData = {
  remaining: 42,
  history: [],
  todayUser: null,
  todayDate: null,
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getPokeData(): Promise<PokeData> {
  if (!GIST_TOKEN) {
    return DEFAULT_DATA;
  }
  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: { Authorization: `Bearer ${GIST_TOKEN}` },
      next: { revalidate: 0 },
    });
    if (!res.ok) return DEFAULT_DATA;
    const gist = (await res.json()) as { files?: { "poke.json"?: { content?: string } } };
    const raw = gist.files?.["poke.json"]?.content;
    if (!raw || raw.trim() === "" || raw === "{}") return DEFAULT_DATA;
    const data = JSON.parse(raw) as Partial<PokeData>;
    const today = todayISO();
    return {
      remaining: typeof data.remaining === "number" ? data.remaining : 42,
      history: Array.isArray(data.history) ? data.history : [],
      todayUser: data.todayDate === today ? data.todayUser ?? null : null,
      todayDate: data.todayDate === today ? data.todayDate : null,
    };
  } catch {
    return DEFAULT_DATA;
  }
}

export type UpdateResult =
  | { ok: true; data: PokeData }
  | { ok: false; error: "another_user_today"; message: string; data: PokeData }
  | { ok: false; error: "zero"; message: string; data: PokeData }
  | { ok: false; error: string; message?: string; data: PokeData };

export async function addPoke(user: string): Promise<UpdateResult> {
  if (!GIST_TOKEN) {
    return { ok: false, error: "No token", data: DEFAULT_DATA };
  }
  const data = await getPokeData();
  const today = todayISO();

  if (data.remaining <= 0) {
    return { ok: false, error: "zero", message: "Non ci sono più pokè da segnare!", data };
  }

  if (data.todayDate === today && data.todayUser !== null && data.todayUser !== user) {
    return {
      ok: false,
      error: "another_user_today",
      message: "Un altro utente ha già segnato la/le pokè oggi.",
      data,
    };
  }

  const next: PokeData = {
    remaining: data.remaining - 1,
    history: [...data.history, { date: today, user }],
    todayUser: user,
    todayDate: today,
  };

  try {
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${GIST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: { "poke.json": { content: JSON.stringify(next, null, 2) } },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: err || res.statusText, data };
    }
    return { ok: true, data: next };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error",
      data,
    };
  }
}
