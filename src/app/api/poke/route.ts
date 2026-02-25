import { getPokeData, addPoke } from "@/lib/storage";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getPokeData();
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  let body: { user?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "Body non valido", message: "Invia { user: \"tuo nome\" }" },
      { status: 400 }
    );
  }
  const user = typeof body.user === "string" ? body.user.trim() : "";
  if (!user) {
    return Response.json(
      { error: "user_required", message: "Inserisci un nickname per segnare." },
      { status: 400 }
    );
  }
  let result;
  try {
    result = await addPoke(user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Errore server";
    return Response.json(
      { success: false, error: "server_error", message: msg, data: null },
      { status: 500 }
    );
  }
  if (result.ok) {
    return Response.json({ success: true, data: result.data });
  }
  if (result.error === "another_user_today") {
    return Response.json(
      {
        success: false,
        error: result.error,
        message: result.message,
        data: result.data,
      },
      { status: 409 }
    );
  }
  if (result.error === "zero") {
    return Response.json(
      {
        success: false,
        error: result.error,
        message: result.message,
        data: result.data,
      },
      { status: 400 }
    );
  }
  if (result.error === "No token") {
    return Response.json(
      {
        success: false,
        error: result.error,
        message:
          result.message ||
          "Vercel Blob non configurato. Crea uno Blob store nel progetto (Storage) e rilancia il deploy.",
        data: result.data,
      },
      { status: 503 }
    );
  }
  return Response.json(
    {
      success: false,
      error: result.error,
      message: "message" in result ? result.message : result.error,
      data: result.data,
    },
    { status: 500 }
  );
}
