import { canonicalTeamName } from "@/lib/nba-dashboard-data";

export type CoreMarket = "h2h" | "spreads" | "totals";

export type OddsOutcome = {
  name: string;
  price: number;
  point?: number;
  description?: string;
};

export type OddsMarket = {
  key: string;
  outcomes?: OddsOutcome[];
};

export type Bookmaker = {
  key: string;
  title: string;
  last_update?: string;
  markets?: OddsMarket[];
};

export type OddsEvent = {
  id: string;
  sport_key?: string;
  sport_title?: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: Bookmaker[];
};

export type BestOddsLine = {
  outcome: string;
  price: number;
  point?: number;
  book: string;
  bookKey: string;
};

export type OutcomeRange = {
  outcome: string;
  best: BestOddsLine | null;
  worst: BestOddsLine | null;
  books: number;
  cents: number;
};

export const coreMarketOptions: { key: CoreMarket; label: string; shortLabel: string }[] = [
  { key: "h2h", label: "Moneyline", shortLabel: "ML" },
  { key: "spreads", label: "Spread", shortLabel: "Spread" },
  { key: "totals", label: "Total", shortLabel: "O/U" },
];

export function normalizeTeamKey(teamName: string) {
  return canonicalTeamName(teamName).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function outcomeKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function formatOdds(price: number | null | undefined) {
  if (price === null || price === undefined) return "N/A";
  return price > 0 ? `+${price}` : `${price}`;
}

export function formatPoint(point: number | null | undefined) {
  if (point === null || point === undefined) return "";
  if (point > 0) return `+${point}`;
  return `${point}`;
}

export function compactGameTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function impliedProbability(price: number) {
  if (price > 0) return 100 / (price + 100);
  return Math.abs(price) / (Math.abs(price) + 100);
}

export function formatProbability(value: number | null | undefined) {
  if (value === null || value === undefined) return "N/A";
  return `${Math.round(value * 100)}%`;
}

export function getMarket(bookmaker: Bookmaker, marketKey: CoreMarket) {
  return bookmaker.markets?.find((market) => market.key === marketKey);
}

export function findOutcome(market: OddsMarket | undefined, outcomeName: string) {
  const normalizedOutcome = outcomeKey(outcomeName);
  const normalizedTeam = normalizeTeamKey(outcomeName);

  return market?.outcomes?.find((outcome) => {
    const nameKey = outcomeKey(outcome.name);
    return nameKey === normalizedOutcome || normalizeTeamKey(outcome.name) === normalizedTeam;
  });
}

export function getBestOutcome(
  event: OddsEvent | undefined,
  marketKey: CoreMarket,
  outcomeName: string
) {
  if (!event) return null;

  let best: BestOddsLine | null = null;

  for (const bookmaker of event.bookmakers ?? []) {
    const outcome = findOutcome(getMarket(bookmaker, marketKey), outcomeName);
    if (!outcome) continue;

    if (!best || outcome.price > best.price) {
      best = {
        outcome: outcome.name,
        price: outcome.price,
        point: outcome.point,
        book: bookmaker.title,
        bookKey: bookmaker.key,
      };
    }
  }

  return best;
}

export function getWorstOutcome(
  event: OddsEvent | undefined,
  marketKey: CoreMarket,
  outcomeName: string
) {
  if (!event) return null;

  let worst: BestOddsLine | null = null;

  for (const bookmaker of event.bookmakers ?? []) {
    const outcome = findOutcome(getMarket(bookmaker, marketKey), outcomeName);
    if (!outcome) continue;

    if (!worst || outcome.price < worst.price) {
      worst = {
        outcome: outcome.name,
        price: outcome.price,
        point: outcome.point,
        book: bookmaker.title,
        bookKey: bookmaker.key,
      };
    }
  }

  return worst;
}

export function countBooksForMarket(event: OddsEvent | undefined, marketKey: CoreMarket) {
  return (event?.bookmakers ?? []).filter((bookmaker) => getMarket(bookmaker, marketKey)).length;
}

export function getOutcomeRange(
  event: OddsEvent | undefined,
  marketKey: CoreMarket,
  outcomeName: string
): OutcomeRange {
  const best = getBestOutcome(event, marketKey, outcomeName);
  const worst = getWorstOutcome(event, marketKey, outcomeName);

  return {
    outcome: outcomeName,
    best,
    worst,
    books: countOutcomeBooks(event, marketKey, outcomeName),
    cents: best && worst ? Math.max(0, best.price - worst.price) : 0,
  };
}

export function countOutcomeBooks(
  event: OddsEvent | undefined,
  marketKey: CoreMarket,
  outcomeName: string
) {
  if (!event) return 0;

  return (event.bookmakers ?? []).filter((bookmaker) =>
    Boolean(findOutcome(getMarket(bookmaker, marketKey), outcomeName))
  ).length;
}

export function getMarketOutcomes(event: OddsEvent, marketKey: CoreMarket) {
  if (marketKey === "totals") return ["Over", "Under"];
  return [event.away_team, event.home_team];
}

export function getOutcomeRanges(event: OddsEvent | undefined, marketKey: CoreMarket) {
  if (!event) return [];
  return getMarketOutcomes(event, marketKey).map((outcome) =>
    getOutcomeRange(event, marketKey, outcome)
  );
}

export function getFavorite(event: OddsEvent | undefined) {
  if (!event) return null;

  const away = getBestOutcome(event, "h2h", event.away_team);
  const home = getBestOutcome(event, "h2h", event.home_team);
  if (!away || !home) return null;

  const awayProbability = impliedProbability(away.price);
  const homeProbability = impliedProbability(home.price);
  const team = homeProbability >= awayProbability ? event.home_team : event.away_team;
  const line = homeProbability >= awayProbability ? home : away;
  const probability = Math.max(homeProbability, awayProbability);

  return { team, line, probability };
}

export function getLargestLineGap(event: OddsEvent | undefined, marketKey: CoreMarket) {
  return Math.max(0, ...getOutcomeRanges(event, marketKey).map((range) => range.cents));
}

export function matchOddsEvent(odds: OddsEvent[], homeTeam: string, awayTeam: string) {
  const home = normalizeTeamKey(homeTeam);
  const away = normalizeTeamKey(awayTeam);

  return odds.find(
    (event) =>
      normalizeTeamKey(event.home_team) === home &&
      normalizeTeamKey(event.away_team) === away
  );
}

export function marketSummary(event: OddsEvent | undefined, marketKey: CoreMarket) {
  if (!event) return "No live line";

  if (marketKey === "totals") {
    const over = getBestOutcome(event, marketKey, "Over");
    const under = getBestOutcome(event, marketKey, "Under");
    const total = over?.point ?? under?.point;

    if (!over && !under) return "No total";
    return `${total ? formatPoint(total) : "Total"} | O ${formatOdds(over?.price)} / U ${formatOdds(under?.price)}`;
  }

  const away = getBestOutcome(event, marketKey, event.away_team);
  const home = getBestOutcome(event, marketKey, event.home_team);

  if (marketKey === "spreads") {
    return `${event.away_team}: ${formatPoint(away?.point)} ${formatOdds(away?.price)} | ${event.home_team}: ${formatPoint(home?.point)} ${formatOdds(home?.price)}`;
  }

  return `${event.away_team}: ${formatOdds(away?.price)} | ${event.home_team}: ${formatOdds(home?.price)}`;
}

export function bookRowsForMarket(event: OddsEvent, marketKey: CoreMarket) {
  const outcomes = getMarketOutcomes(event, marketKey);

  return (event.bookmakers ?? [])
    .map((bookmaker) => {
      const market = getMarket(bookmaker, marketKey);
      if (!market) return null;

      return {
        key: bookmaker.key,
        title: bookmaker.title,
        outcomes: outcomes.map((outcomeName) => ({
          name: outcomeName,
          outcome: findOutcome(market, outcomeName),
        })),
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
}
