import { get, put } from "@vercel/blob";

const BLOB_PATH = "poke/data.json";

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

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  const total = chunks.reduce((acc, c) => acc + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder().decode(out);
}

export async function getPokeData(): Promise<PokeData> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return DEFAULT_DATA;
  }
  try {
    const result = await get(BLOB_PATH, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return DEFAULT_DATA;
    }
    const raw = await streamToText(result.stream);
    if (!raw?.trim() || raw === "{}") return DEFAULT_DATA;
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
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      ok: false,
      error: "No token",
      message: "Vercel Blob non configurato. Crea uno Blob store nel progetto e aggiungi BLOB_READ_WRITE_TOKEN.",
      data: DEFAULT_DATA,
    };
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
    await put(BLOB_PATH, JSON.stringify(next, null, 2), {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
    return { ok: true, data: next };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Errore di rete";
    return {
      ok: false,
      error: msg,
      message: msg,
      data,
    };
  }
}
