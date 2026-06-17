import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.searchParams.get("url");

  if (!baseUrl) {
    return NextResponse.json({ error: "URL required" }, { status: 400 });
  }

  const svg = await QRCode.toString(baseUrl, {
    type: "svg",
    color: {
      dark: "#d4a847",
      light: "#00000000",
    },
    margin: 1,
    width: 256,
  });

  return new NextResponse(svg, {
    headers: { "Content-Type": "image/svg+xml" },
  });
}
