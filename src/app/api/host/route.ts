import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const HOST_SECRET = process.env.HOST_SECRET || "change-me";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== HOST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count: guestCount } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true });

  const { count: photoCount } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true });

  const { data: photos } = await supabase
    .from("photos")
    .select("id, url, guest_name, captured_at")
    .order("captured_at", { ascending: false })
    .limit(100);

  return NextResponse.json({
    guestCount: guestCount || 0,
    photoCount: photoCount || 0,
    photos: photos || [],
  });
}

export async function DELETE(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== HOST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
  }

  const { error } = await supabase.from("photos").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
