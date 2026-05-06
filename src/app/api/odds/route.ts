import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing ODDS_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const markets = searchParams.get("markets") ?? "h2h,spreads,totals";
  const regions = searchParams.get("regions") ?? "us";
  const oddsFormat = searchParams.get("oddsFormat") ?? "american";

  const url = new URL(
    "https://api.the-odds-api.com/v4/sports/basketball_nba/odds"
  );
  url.searchParams.set("regions", regions);
  url.searchParams.set("markets", markets);
  url.searchParams.set("oddsFormat", oddsFormat);
  url.searchParams.set("apiKey", apiKey);

  const res = await fetch(url, { next: { revalidate: 30 } });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: "Unable to load NBA odds", detail },
      { status: res.status }
    );
  }

  const data = await res.json();

  return NextResponse.json(data);
}
