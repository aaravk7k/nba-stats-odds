import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
    { next: { revalidate: 30 } }
  );

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: "Unable to load NBA scoreboard", detail },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
