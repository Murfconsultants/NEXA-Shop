import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function POST() {
  const res = await fetch(`${BACKEND_URL}/api/admin/uploads/signature`, {
    method: "POST",
    headers: { "x-api-key": process.env.ADMIN_API_KEY ?? "" },
  });
  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: res.status });
  }
  return NextResponse.json(await res.json());
}
