import { getPokeData, addPoke } from "@/lib/gist";
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
  const result = await addPoke(user);
  if (result.ok) {
    return Response.json({ success: true, data: result.data });
  }
  if (result.error === "another_user_today") {
    return Response.json(
      { success: false, error: result.error, message: result.message, data: result.data },
      { status: 409 }
    );
  }
  if (result.error === "zero") {
    return Response.json(
      { success: false, error: result.error, message: result.message, data: result.data },
      { status: 400 }
    );
  }
  return Response.json(
    { success: false, error: result.error, data: result.data },
    { status: 500 }
  );
}
