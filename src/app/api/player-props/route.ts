import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing ODDS_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json(
      { error: "Missing eventId query parameter" },
      { status: 400 }
    );
  }

  const markets =
    searchParams.get("markets") ??
    "player_points,player_rebounds,player_assists,player_threes";

  const url = new URL(
    `https://api.the-odds-api.com/v4/sports/basketball_nba/events/${eventId}/odds`
  );
  url.searchParams.set("regions", searchParams.get("regions") ?? "us");
  url.searchParams.set("markets", markets);
  url.searchParams.set("oddsFormat", searchParams.get("oddsFormat") ?? "american");
  url.searchParams.set("apiKey", apiKey);

  const res = await fetch(url, { next: { revalidate: 30 } });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: "Unable to load player prop odds", detail },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
