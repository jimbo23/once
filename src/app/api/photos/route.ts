import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getFilmState } from "@/lib/film";

export async function GET() {
  const state = getFilmState();

  if (state !== "revealed") {
    return NextResponse.json(
      { error: "Film not yet revealed" },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("photos")
    .select("id, url, guest_name, captured_at")
    .order("captured_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }

  const photos = (data || []).map((p) => ({
    id: p.id,
    url: p.url,
    guestName: p.guest_name,
    capturedAt: p.captured_at,
  }));

  return NextResponse.json({ photos });
}
