import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const photo = formData.get("photo") as File | null;
  const guestId = formData.get("guestId") as string;
  const guestName = formData.get("guestName") as string;

  if (!photo) {
    return NextResponse.json({ error: "No photo provided" }, { status: 400 });
  }

  const filename = `${nanoid(8)}-${Date.now()}.jpg`;
  const blob = await put(`photos/${filename}`, photo, {
    access: "public",
    contentType: "image/jpeg",
  });

  const { error } = await supabase.from("photos").insert({
    id: nanoid(12),
    url: blob.url,
    guest_id: guestId,
    guest_name: guestName,
    captured_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to save photo" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: blob.url });
}
