import { put, list, del } from "@vercel/blob";
import { NextResponse } from "next/server";

const BLOB_FILENAME = "poke-data.json";
const TOTAL_POKE = 42;

async function getData(token) {
  try {
    const { blobs } = await list({ token, prefix: BLOB_FILENAME });
    if (blobs.length === 0) {
      return { total: TOTAL_POKE, entries: [] };
    }
    const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0];
    const res = await fetch(latest.url);
    if (!res.ok) return { total: TOTAL_POKE, entries: [] };
    return await res.json();
  } catch {
    return { total: TOTAL_POKE, entries: [] };
  }
}

async function saveData(data, token) {
  // Delete old blobs first
  const { blobs } = await list({ token, prefix: BLOB_FILENAME });
  for (const blob of blobs) {
    await del(blob.url, { token });
  }
  const blob = await put(BLOB_FILENAME, JSON.stringify(data), {
    access: "public",
    token,
    addRandomSuffix: false,
  });
  return blob;
}

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured" }, { status: 500 });
  }
  const data = await getData(token);
  return NextResponse.json(data);
}

export async function POST() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN not configured" }, { status: 500 });
  }

  const data = await getData(token);
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD in UTC

  // Check for duplicate today
  const alreadyToday = data.entries.some((e) => e.date === today);
  if (alreadyToday) {
    return NextResponse.json({ alreadyToday: true, data }, { status: 200 });
  }

  if (data.entries.length >= data.total) {
    return NextResponse.json({ error: "Hai già preso tutte le pokè!" }, { status: 400 });
  }

  data.entries.push({ date: today, addedAt: new Date().toISOString() });
  await saveData(data, token);

  return NextResponse.json({ success: true, data }, { status: 200 });
}
