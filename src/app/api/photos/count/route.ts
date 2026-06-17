import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { count } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ total: count || 0 });
}
