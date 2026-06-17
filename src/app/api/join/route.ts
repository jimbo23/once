import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { name } = await request.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const id = nanoid(12);

  const { error } = await supabase.from("guests").insert({
    id,
    name: name.trim(),
    joined_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Failed to join" }, { status: 500 });
  }

  const { count } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ id, guestCount: count || 1 });
}
