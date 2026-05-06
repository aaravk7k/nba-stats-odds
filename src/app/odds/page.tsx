"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { canonicalTeamName, findTeamProfile } from "@/lib/nba-dashboard-data";
import {
  bookRowsForMarket,
  compactGameTime,
  coreMarketOptions,
  formatOdds,
  formatPoint,
  formatProbability,
  getBestOutcome,
  getFavorite,
  getLargestLineGap,
  getMarketOutcomes,
  getOutcomeRanges,
  marketSummary,
  type CoreMarket,
  type OddsEvent,
  type OutcomeRange,
} from "@/lib/nba-odds";

type LoadState = "idle" | "loading" | "ready" | "error";
type SortMode = "time" | "coverage" | "lineGap" | "favorite";

const sortOptions: { value: SortMode; label: string }[] = [
  { value: "time", label: "Start time" },
  { value: "coverage", label: "Most books" },
  { value: "lineGap", label: "Biggest line gap" },
  { value: "favorite", label: "Strongest favorite" },
];

function teamLabel(teamName: string) {
  return findTeamProfile(teamName)?.abbreviation ?? canonicalTeamName(teamName);
}

function teamColors(teamName: string) {
  const team = findTeamProfile(teamName);
  return {
    primary: team?.color ?? "#27272a",
    secondary: team?.secondaryColor ?? "#d4d4d8",
  };
}

function TeamChip({ team }: { team: string }) {
  const colors = teamColors(team);

  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-black text-zinc-900">
      <span className="flex h-3 w-6 overflow-hidden rounded-sm" aria-hidden="true">
        <span className="flex-1" style={{ backgroundColor: colors.primary }} />
        <span className="flex-1" style={{ backgroundColor: colors.secondary }} />
      </span>
      {teamLabel(team)}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "green" | "amber";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50"
        : "border-zinc-200 bg-white";

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${toneClass}`}>
      <p className="text-xs font-black uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 truncate text-2xl font-black text-zinc-950">{value}</p>
      <p className="mt-1 truncate text-sm font-semibold text-zinc-600">{detail}</p>
    </div>
  );
}

function MarketTabs({
  active,
  onChange,
}: {
  active: CoreMarket;
  onChange: (market: CoreMarket) => void;
}) {
  return (
    <div className="inline-grid grid-cols-3 rounded-lg border border-zinc-200 bg-zinc-100 p-1">
      {coreMarketOptions.map((market) => (
        <button
          key={market.key}
          type="button"
          onClick={() => onChange(market.key)}
          className={`rounded-md px-3 py-2 text-sm font-black transition ${
            active === market.key
              ? "bg-white text-zinc-950 shadow-sm"
              : "text-zinc-500 hover:text-zinc-950"
          }`}
        >
          {market.label}
        </button>
      ))}
    </div>
  );
}

function RangeTile({ range, compact }: { range: OutcomeRange; compact?: boolean }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-zinc-950">
            {canonicalTeamName(range.outcome)}
          </p>
          <p className="text-xs font-semibold text-zinc-500">
            {range.books} books {range.cents > 0 ? `- ${range.cents} cents gap` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-emerald-700">
            {formatPoint(range.best?.point)} {formatOdds(range.best?.price)}
          </p>
          <p className="text-xs font-semibold text-zinc-500">{range.best?.book ?? "N/A"}</p>
        </div>
      </div>
      {!compact && range.worst && range.best && range.worst.book !== range.best.book && (
        <p className="mt-3 rounded-md bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-600">
          Avoid {range.worst.book} at {formatPoint(range.worst.point)}{" "}
          {formatOdds(range.worst.price)}
        </p>
      )}
    </div>
  );
}

function BookMatrix({ event, market }: { event: OddsEvent; market: CoreMarket }) {
  const outcomes = getMarketOutcomes(event, market);
  const rows = bookRowsForMarket(event, market);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm font-semibold text-zinc-500">
        No sportsbook is currently returning this market.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200">
      <div className="grid min-w-[34rem] grid-cols-[10rem_repeat(2,minmax(0,1fr))] bg-zinc-100 text-xs font-black uppercase tracking-wide text-zinc-500">
        <div className="px-3 py-2">Book</div>
        {outcomes.map((outcome) => (
          <div key={outcome} className="px-3 py-2 text-right">
            {market === "totals" ? outcome : teamLabel(outcome)}
          </div>
        ))}
      </div>
      <div className="max-h-72 overflow-auto">
        {rows.map((row) => (
          <div
            key={row.key}
            className="grid min-w-[34rem] grid-cols-[10rem_repeat(2,minmax(0,1fr))] border-t border-zinc-100 text-sm"
          >
            <div className="truncate px-3 py-2 font-bold text-zinc-900">{row.title}</div>
            {row.outcomes.map(({ name, outcome }) => (
              <div key={name} className="px-3 py-2 text-right font-black text-zinc-950">
                {formatPoint(outcome?.point)} {formatOdds(outcome?.price)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function OddsEventCard({
  event,
  market,
  expanded,
  onToggle,
}: {
  event: OddsEvent;
  market: CoreMarket;
  expanded: boolean;
  onToggle: () => void;
}) {
  const favorite = getFavorite(event);
  const ranges = getOutcomeRanges(event, market);
  const coverage = event.bookmakers?.length ?? 0;
  const lineGap = getLargestLineGap(event, market);
  const awayMl = getBestOutcome(event, "h2h", event.away_team);
  const homeMl = getBestOutcome(event, "h2h", event.home_team);

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TeamChip team={event.away_team} />
            <span className="text-xs font-black uppercase tracking-wide text-zinc-400">at</span>
            <TeamChip team={event.home_team} />
          </div>
          <h2 className="mt-3 text-2xl font-black text-zinc-950">
            {canonicalTeamName(event.away_team)} at {canonicalTeamName(event.home_team)}
          </h2>
          <p className="mt-1 text-sm font-semibold text-zinc-500">
            {compactGameTime(event.commence_time)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-right">
          <div className="rounded-lg bg-zinc-50 px-3 py-2">
            <p className="text-[0.65rem] font-black uppercase text-zinc-500">Books</p>
            <p className="text-lg font-black text-zinc-950">{coverage}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2">
            <p className="text-[0.65rem] font-black uppercase text-emerald-700">Favorite</p>
            <p className="text-lg font-black text-emerald-900">
              {favorite ? teamLabel(favorite.team) : "N/A"}
            </p>
          </div>
          <div className="rounded-lg bg-amber-50 px-3 py-2">
            <p className="text-[0.65rem] font-black uppercase text-amber-700">Gap</p>
            <p className="text-lg font-black text-amber-900">{lineGap}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <RangeTile range={{ outcome: event.away_team, best: awayMl, worst: null, books: 0, cents: 0 }} compact />
        <RangeTile range={{ outcome: event.home_team, best: homeMl, worst: null, books: 0, cents: 0 }} compact />
      </div>

      <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
              Selected Market
            </p>
            <p className="mt-1 text-sm font-bold text-zinc-950">{marketSummary(event, market)}</p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-black text-zinc-900 hover:border-zinc-500"
          >
            {expanded ? "Hide Books" : "Compare Books"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {ranges.map((range) => (
          <RangeTile key={range.outcome} range={range} />
        ))}
      </div>

      {favorite && (
        <div className="mt-4 rounded-lg bg-[#eef4ff] px-3 py-2 text-sm font-semibold text-[#174ea6]">
          Market read: {canonicalTeamName(favorite.team)} is priced around{" "}
          {formatProbability(favorite.probability)} implied on the best available moneyline.
        </div>
      )}

      {expanded && (
        <div className="mt-4 overflow-x-auto">
          <BookMatrix event={event} market={market} />
        </div>
      )}
    </article>
  );
}

function EmptyState({ error }: { error?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
      <h2 className="text-xl font-black text-zinc-950">No odds available</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-zinc-500">
        {error || "The sportsbook feed did not return NBA markets. Check ODDS_API_KEY, plan access, quota, and whether NBA markets are currently open."}
      </p>
    </div>
  );
}

export default function OddsPage() {
  const [events, setEvents] = useState<OddsEvent[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState<CoreMarket>("h2h");
  const [sortMode, setSortMode] = useState<SortMode>("time");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadOdds = useCallback(async () => {
    await Promise.resolve();
    setLoadState("loading");
    setError("");

    try {
      const response = await fetch("/api/odds?markets=h2h,spreads,totals");
      const json = (await response.json()) as unknown;

      if (!response.ok) {
        const message =
          typeof json === "object" && json !== null && "error" in json
            ? String((json as { error: unknown }).error)
            : "Unable to load odds.";
        throw new Error(message);
      }

      setEvents(Array.isArray(json) ? (json as OddsEvent[]) : []);
      setLastUpdated(new Date());
      setLoadState("ready");
    } catch (caught) {
      setEvents([]);
      setLoadState("error");
      setError(caught instanceof Error ? caught.message : "Unable to load odds.");
    }
  }, []);

  useEffect(() => {
    loadOdds();
  }, [loadOdds]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events
      .filter((event) => {
        if (!normalizedQuery) return true;
        return `${event.away_team} ${event.home_team}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sortMode === "coverage") {
          return (b.bookmakers?.length ?? 0) - (a.bookmakers?.length ?? 0);
        }

        if (sortMode === "lineGap") {
          return getLargestLineGap(b, market) - getLargestLineGap(a, market);
        }

        if (sortMode === "favorite") {
          return (
            (getFavorite(b)?.probability ?? 0) - (getFavorite(a)?.probability ?? 0)
          );
        }

        return new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime();
      });
  }, [events, market, query, sortMode]);

  const lineShopping = useMemo(() => {
    return events
      .flatMap((event) =>
        getOutcomeRanges(event, market).map((range) => ({
          event,
          range,
        }))
      )
      .filter(({ range }) => range.best)
      .sort((a, b) => b.range.cents - a.range.cents)
      .slice(0, 4);
  }, [events, market]);

  const strongestFavorite = useMemo(() => {
    return events
      .map((event) => ({ event, favorite: getFavorite(event) }))
      .filter((row): row is { event: OddsEvent; favorite: NonNullable<ReturnType<typeof getFavorite>> } =>
        Boolean(row.favorite)
      )
      .sort((a, b) => b.favorite.probability - a.favorite.probability)[0];
  }, [events]);

  const broadestMarket = useMemo(() => {
    return [...events].sort((a, b) => (b.bookmakers?.length ?? 0) - (a.bookmakers?.length ?? 0))[0];
  }, [events]);

  const plusMoneyCount = useMemo(() => {
    return events.reduce((count, event) => {
      const ranges = getOutcomeRanges(event, "h2h");
      return count + ranges.filter((range) => (range.best?.price ?? -1) > 0).length;
    }, 0);
  }, [events]);

  return (
    <main className="min-h-screen bg-[#f6f4ee] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center justify-between gap-3">
            <Link className="text-sm font-black uppercase tracking-wide text-zinc-950" href="/">
              NBA Stats + Odds
            </Link>
            <div className="flex items-center gap-3 text-sm font-bold">
              <Link className="text-zinc-600 hover:text-zinc-950" href="/matchups">
                Matchups
              </Link>
              <Link className="text-[#174ea6]" href="/odds">
                Odds
              </Link>
            </div>
          </nav>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c43b32]">
                Sportsbook command center
              </p>
              <h1 className="mt-2 max-w-4xl text-4xl font-black leading-tight text-zinc-950 sm:text-5xl">
                NBA odds board built for line shopping, market movement, and quick decisions.
              </h1>
            </div>
            <button
              type="button"
              onClick={loadOdds}
              className="h-11 rounded-md bg-zinc-950 px-4 text-sm font-black text-white hover:bg-zinc-800"
            >
              {loadState === "loading" ? "Refreshing" : "Refresh Lines"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Games on board"
            value={`${events.length}`}
            detail={lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Waiting for feed"}
          />
          <MetricCard
            label="Strongest favorite"
            value={strongestFavorite ? teamLabel(strongestFavorite.favorite.team) : "N/A"}
            detail={
              strongestFavorite
                ? `${formatProbability(strongestFavorite.favorite.probability)} implied vs ${teamLabel(
                    strongestFavorite.favorite.team === strongestFavorite.event.home_team
                      ? strongestFavorite.event.away_team
                      : strongestFavorite.event.home_team
                  )}`
                : "No moneyline market"
            }
            tone="green"
          />
          <MetricCard
            label="Most covered game"
            value={broadestMarket ? `${broadestMarket.bookmakers?.length ?? 0} books` : "N/A"}
            detail={
              broadestMarket
                ? `${teamLabel(broadestMarket.away_team)} at ${teamLabel(broadestMarket.home_team)}`
                : "No sportsbook coverage"
            }
          />
          <MetricCard
            label="Plus money sides"
            value={`${plusMoneyCount}`}
            detail="Best available moneyline prices above even"
            tone="amber"
          />
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-end">
            <MarketTabs active={market} onChange={setMarket} />
            <label className="grid gap-1 text-xs font-black uppercase tracking-wide text-zinc-500">
              Search teams
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Lakers, Celtics, Knicks..."
                className="h-10 rounded-md border border-zinc-300 px-3 text-sm font-semibold normal-case tracking-normal text-zinc-950 outline-none focus:border-[#174ea6]"
              />
            </label>
            <label className="grid gap-1 text-xs font-black uppercase tracking-wide text-zinc-500">
              Sort board
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-zinc-950 outline-none focus:border-[#174ea6]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {lineShopping.length > 0 && (
          <section className="grid gap-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#174ea6]">
                  Line shopping
                </p>
                <h2 className="text-2xl font-black text-zinc-950">Best price gaps right now</h2>
              </div>
              <p className="text-sm font-semibold text-zinc-500">
                Higher cents gap means a bigger difference between books.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {lineShopping.map(({ event, range }) => (
                <div
                  key={`${event.id}-${range.outcome}`}
                  className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
                    {teamLabel(event.away_team)} at {teamLabel(event.home_team)}
                  </p>
                  <p className="mt-2 truncate text-lg font-black text-zinc-950">
                    {market === "totals" ? range.outcome : canonicalTeamName(range.outcome)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-500">
                    {range.cents} cents across {range.books} books
                  </p>
                  <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800">
                    {formatPoint(range.best?.point)} {formatOdds(range.best?.price)} at{" "}
                    {range.best?.book ?? "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {loadState === "loading" && events.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm font-semibold text-zinc-500">
            Loading sportsbook markets...
          </div>
        ) : loadState === "error" || filtered.length === 0 ? (
          <EmptyState error={error} />
        ) : (
          <section className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#c43b32]">
                  Board
                </p>
                <h2 className="text-2xl font-black text-zinc-950">
                  {coreMarketOptions.find((option) => option.key === market)?.label} markets
                </h2>
              </div>
              <p className="text-sm font-semibold text-zinc-500">
                Showing {filtered.length} of {events.length} games
              </p>
            </div>

            <div className="grid gap-4">
              {filtered.map((event) => (
                <OddsEventCard
                  key={event.id}
                  event={event}
                  market={market}
                  expanded={expandedId === event.id}
                  onToggle={() =>
                    setExpandedId((current) => (current === event.id ? null : event.id))
                  }
                />
              ))}
            </div>
          </section>
        )}

        <p className="pb-4 text-xs font-semibold text-zinc-500">
          Not betting advice. Use this board for product exploration, education, and line comparison.
          Prices can move between refreshes.
        </p>
      </div>
    </main>
  );
}
