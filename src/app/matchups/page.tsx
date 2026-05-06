"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  canonicalTeamName,
  findTeamProfile,
  playerProfiles,
  playersForTeam,
  type PlayerProfile,
  type TeamProfile,
} from "@/lib/nba-dashboard-data";
import {
  compactGameTime,
  formatOdds,
  formatPoint,
  formatProbability,
  getBestOutcome,
  getFavorite,
  getLargestLineGap,
  impliedProbability,
  marketSummary,
  matchOddsEvent,
  type OddsEvent,
} from "@/lib/nba-odds";

type LoadState = "idle" | "loading" | "ready" | "error";
type SlateFilter = "all" | "priced" | "live" | "upcoming";

type EspnEvent = {
  id: string;
  date: string;
  competitions?: EspnCompetition[];
  status?: {
    type?: {
      state?: string;
      shortDetail?: string;
      detail?: string;
    };
  };
};

type EspnCompetition = {
  venue?: { fullName?: string };
  competitors?: EspnCompetitor[];
};

type EspnCompetitor = {
  homeAway?: "home" | "away";
  score?: string;
  records?: { summary?: string }[];
  team: {
    displayName: string;
    shortDisplayName?: string;
    abbreviation?: string;
  };
};

type EspnScoreboard = {
  events?: EspnEvent[];
};

type DashboardGame = {
  id: string;
  date: string;
  status?: string;
  state?: string;
  venue?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: string;
  awayScore?: string;
  homeRecord?: string;
  awayRecord?: string;
  odds?: OddsEvent;
};

const filterOptions: { value: SlateFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "priced", label: "Priced" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
];

function teamLabel(teamName: string) {
  return findTeamProfile(teamName)?.abbreviation ?? canonicalTeamName(teamName);
}

function teamStyle(teamName: string) {
  const team = findTeamProfile(teamName);
  return {
    primary: team?.color ?? "#27272a",
    secondary: team?.secondaryColor ?? "#d4d4d8",
  };
}

function parseEspnGame(game: EspnEvent, odds: OddsEvent[]): DashboardGame | null {
  const competition = game.competitions?.[0];
  const competitors = competition?.competitors ?? [];
  const home = competitors.find((competitor) => competitor.homeAway === "home");
  const away = competitors.find((competitor) => competitor.homeAway === "away");

  if (!home?.team.displayName || !away?.team.displayName) return null;

  return {
    id: game.id,
    date: game.date,
    status: game.status?.type?.shortDetail ?? game.status?.type?.detail,
    state: game.status?.type?.state,
    venue: competition?.venue?.fullName,
    homeTeam: home.team.displayName,
    awayTeam: away.team.displayName,
    homeScore: home.score,
    awayScore: away.score,
    homeRecord: home.records?.[0]?.summary,
    awayRecord: away.records?.[0]?.summary,
    odds: matchOddsEvent(odds, home.team.displayName, away.team.displayName),
  };
}

function buildOddsOnlyGame(event: OddsEvent): DashboardGame {
  return {
    id: event.id,
    date: event.commence_time,
    homeTeam: event.home_team,
    awayTeam: event.away_team,
    odds: event,
  };
}

function isUpcoming(game: DashboardGame) {
  return new Date(game.date).getTime() > Date.now() && game.state !== "in";
}

function isLive(game: DashboardGame) {
  return game.state === "in" || Boolean(game.status?.match(/quarter|q\d|halftime/i));
}

function teamProfileOrFallback(teamName: string): TeamProfile {
  return (
    findTeamProfile(teamName) ?? {
      name: canonicalTeamName(teamName),
      abbreviation: teamLabel(teamName),
      conference: "East",
      color: "#27272a",
      secondaryColor: "#d4d4d8",
      pace: 88,
      defense: 78,
      marketHeat: 70,
    }
  );
}

function matchupScore(team: TeamProfile, opponent: TeamProfile, homeCourt: boolean) {
  return (
    team.defense * 0.34 +
    team.marketHeat * 0.32 +
    team.pace * 0.18 +
    (100 - opponent.defense) * 0.1 +
    (homeCourt ? 3 : 0)
  );
}

function topPlayersForGame(game: DashboardGame) {
  return [...playersForTeam(game.awayTeam), ...playersForTeam(game.homeTeam)].sort(
    (a, b) => b.marketSignal - a.marketSignal
  );
}

function playerPairs(game: DashboardGame) {
  const awayPlayers = playersForTeam(game.awayTeam);
  const homePlayers = playersForTeam(game.homeTeam);
  const pairs: { away: PlayerProfile; home: PlayerProfile }[] = [];

  for (const index of [0, 1, 2]) {
    const away = awayPlayers[index];
    const home = homePlayers[index];
    if (away && home) pairs.push({ away, home });
  }

  return pairs;
}

function formatScore(score?: string) {
  return score && score !== "0" ? score : "";
}

function TeamBand({ team }: { team: string }) {
  const colors = teamStyle(team);

  return (
    <span className="inline-flex h-3 w-8 overflow-hidden rounded-sm" aria-hidden="true">
      <span className="flex-1" style={{ backgroundColor: colors.primary }} />
      <span className="flex-1" style={{ backgroundColor: colors.secondary }} />
    </span>
  );
}

function Pill({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "amber" | "blue";
}) {
  const toneClass =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : tone === "blue"
          ? "border-blue-200 bg-[#eef4ff] text-[#174ea6]"
          : "border-zinc-200 bg-white text-zinc-900";

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClass}`}>
      <p className="text-[0.65rem] font-black uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black">{value}</p>
    </div>
  );
}

function TeamPanel({
  team,
  record,
  score,
  side,
}: {
  team: string;
  record?: string;
  score?: string;
  side: "away" | "home";
}) {
  const profile = teamProfileOrFallback(team);
  const players = playersForTeam(team).slice(0, 2);
  const scoreText = formatScore(score);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <TeamBand team={team} />
            <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
              {side === "home" ? "Home" : "Away"}
            </p>
          </div>
          <h3 className="mt-2 truncate text-2xl font-black text-zinc-950">
            {canonicalTeamName(team)}
          </h3>
          <p className="text-sm font-semibold text-zinc-500">
            {record ? `${record} record` : `${profile.conference} profile`}
          </p>
        </div>
        {scoreText && <p className="text-4xl font-black text-zinc-950">{scoreText}</p>}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Pill label="Pace" value={`${profile.pace}`} />
        <Pill label="Defense" value={`${profile.defense}`} tone="blue" />
        <Pill label="Market" value={`${profile.marketHeat}`} tone="amber" />
      </div>

      <div className="mt-4 grid gap-2">
        {players.length > 0 ? (
          players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between gap-3 rounded-md bg-zinc-50 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-zinc-950">{player.name}</p>
                <p className="truncate text-xs font-semibold text-zinc-500">
                  {player.archetype}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-zinc-950">{player.impact}</p>
                <p className="text-[0.65rem] font-bold uppercase text-zinc-500">Impact</p>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-md bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-500">
            Player model coming soon for this team.
          </p>
        )}
      </div>
    </section>
  );
}

function BettingSnapshot({ game }: { game: DashboardGame }) {
  const favorite = getFavorite(game.odds);
  const awayMl = getBestOutcome(game.odds, "h2h", game.awayTeam);
  const homeMl = getBestOutcome(game.odds, "h2h", game.homeTeam);
  const awaySpread = getBestOutcome(game.odds, "spreads", game.awayTeam);
  const homeSpread = getBestOutcome(game.odds, "spreads", game.homeTeam);
  const over = getBestOutcome(game.odds, "totals", "Over");
  const under = getBestOutcome(game.odds, "totals", "Under");
  const bookCount = game.odds?.bookmakers?.length ?? 0;
  const h2hGap = getLargestLineGap(game.odds, "h2h");
  const quality = bookCount >= 8 ? "Deep" : bookCount >= 4 ? "Solid" : bookCount > 0 ? "Thin" : "No feed";

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#174ea6]">
            Betting snapshot
          </p>
          <h3 className="mt-1 text-xl font-black text-zinc-950">
            {game.odds ? "Best available lines" : "Waiting for sportsbook feed"}
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Pill label="Books" value={`${bookCount}`} />
          <Pill label="Quality" value={quality} tone={bookCount >= 4 ? "green" : "amber"} />
          <Pill label="ML Gap" value={`${h2hGap}`} tone="amber" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <LineCard team={game.awayTeam} moneyline={awayMl} spread={awaySpread} />
        <LineCard team={game.homeTeam} moneyline={homeMl} spread={homeSpread} />
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Pill
          label="Favorite"
          value={favorite ? `${teamLabel(favorite.team)} ${formatProbability(favorite.probability)}` : "N/A"}
          tone={favorite ? "green" : "neutral"}
        />
        <Pill
          label="Total"
          value={`${formatPoint(over?.point ?? under?.point)} O ${formatOdds(over?.price)} / U ${formatOdds(under?.price)}`}
        />
        <Pill
          label="Spread market"
          value={game.odds ? marketSummary(game.odds, "spreads") : "No live line"}
          tone="blue"
        />
      </div>
    </section>
  );
}

function LineCard({
  team,
  moneyline,
  spread,
}: {
  team: string;
  moneyline: ReturnType<typeof getBestOutcome>;
  spread: ReturnType<typeof getBestOutcome>;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <TeamBand team={team} />
            <p className="truncate font-black text-zinc-950">{canonicalTeamName(team)}</p>
          </div>
          <p className="text-xs font-semibold text-zinc-500">{teamLabel(team)} market</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-emerald-700">{formatOdds(moneyline?.price)}</p>
          <p className="text-xs font-semibold text-zinc-500">{moneyline?.book ?? "N/A"}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-xs font-black uppercase text-zinc-500">Spread</p>
          <p className="font-black text-zinc-950">
            {formatPoint(spread?.point)} {formatOdds(spread?.price)}
          </p>
        </div>
        <div>
          <p className="text-xs font-black uppercase text-zinc-500">Implied</p>
          <p className="font-black text-zinc-950">
            {moneyline ? formatProbability(impliedProbability(moneyline.price)) : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

function PlayerMatchups({ game }: { game: DashboardGame }) {
  const pairs = playerPairs(game);
  const topProps = topPlayersForGame(game).slice(0, 3);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#c43b32]">
            Player chessboard
          </p>
          <h3 className="mt-1 text-xl font-black text-zinc-950">Key player matchups</h3>
        </div>
        {topProps[0] && (
          <div className="rounded-lg bg-amber-50 px-3 py-2 text-right">
            <p className="text-[0.65rem] font-black uppercase text-amber-700">Top prop lean</p>
            <p className="text-sm font-black text-amber-900">
              {topProps[0].name.split(" ").slice(-1)[0]} {topProps[0].propLean.side}{" "}
              {topProps[0].propLean.line}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        {pairs.length > 0 ? (
          pairs.map((pair) => <PlayerDuel key={`${pair.away.id}-${pair.home.id}`} {...pair} />)
        ) : (
          <p className="rounded-lg bg-zinc-50 p-4 text-sm font-semibold text-zinc-500">
            No modeled player pairings for this matchup yet.
          </p>
        )}
      </div>

      {topProps.length > 0 && (
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {topProps.map((player) => (
            <div key={player.id} className="rounded-lg bg-zinc-50 p-3">
              <p className="truncate text-sm font-black text-zinc-950">{player.name}</p>
              <p className="mt-1 text-xs font-semibold text-zinc-500">
                {player.propLean.side} {player.propLean.line} {player.propLean.market}
              </p>
              <p className="mt-2 text-sm font-black text-amber-700">
                {formatOdds(player.propLean.odds)} - {player.propLean.confidence}% signal
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PlayerDuel({ away, home }: { away: PlayerProfile; home: PlayerProfile }) {
  const awayEdge = away.impact - home.impact;
  const homeEdge = home.impact - away.impact;

  return (
    <div className="grid gap-3 rounded-lg bg-zinc-50 p-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
      <DuelSide player={away} edge={awayEdge} />
      <div className="text-center text-xs font-black uppercase tracking-wide text-zinc-400">vs</div>
      <DuelSide player={home} edge={homeEdge} alignRight />
    </div>
  );
}

function DuelSide({
  player,
  edge,
  alignRight,
}: {
  player: PlayerProfile;
  edge: number;
  alignRight?: boolean;
}) {
  return (
    <div className={alignRight ? "text-left md:text-right" : ""}>
      <p className="font-black text-zinc-950">{player.name}</p>
      <p className="text-xs font-semibold text-zinc-500">
        {teamLabel(player.team)} - {player.archetype}
      </p>
      <div className="mt-2 flex flex-wrap gap-2 md:justify-start">
        <span className="rounded-md bg-white px-2 py-1 text-xs font-black text-zinc-700">
          {player.ppg.toFixed(1)} PPG
        </span>
        <span
          className={`rounded-md px-2 py-1 text-xs font-black ${
            edge >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-white text-zinc-500"
          }`}
        >
          {edge >= 0 ? `+${edge.toFixed(0)} edge` : "counter spot"}
        </span>
      </div>
    </div>
  );
}

function MatchupCard({ game }: { game: DashboardGame }) {
  const awayProfile = teamProfileOrFallback(game.awayTeam);
  const homeProfile = teamProfileOrFallback(game.homeTeam);
  const awayScore = matchupScore(awayProfile, homeProfile, false);
  const homeScore = matchupScore(homeProfile, awayProfile, true);
  const modelLean = homeScore >= awayScore ? game.homeTeam : game.awayTeam;
  const modelGap = Math.abs(homeScore - awayScore);
  const totalPace = Math.round((awayProfile.pace + homeProfile.pace) / 2);

  return (
    <article className="grid gap-4 rounded-xl border border-zinc-200 bg-[#fbfaf7] p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-zinc-500">
            {compactGameTime(game.date)}
          </p>
          <h2 className="mt-1 text-3xl font-black text-zinc-950">
            {teamLabel(game.awayTeam)} at {teamLabel(game.homeTeam)}
          </h2>
          <p className="mt-1 text-sm font-semibold text-zinc-500">
            {game.status ?? game.venue ?? "Scheduled"}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Pill label="Model lean" value={teamLabel(modelLean)} tone="blue" />
          <Pill label="Edge" value={modelGap.toFixed(1)} tone={modelGap >= 5 ? "green" : "neutral"} />
          <Pill label="Pace" value={`${totalPace}`} tone="amber" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TeamPanel
          team={game.awayTeam}
          record={game.awayRecord}
          score={game.awayScore}
          side="away"
        />
        <TeamPanel
          team={game.homeTeam}
          record={game.homeRecord}
          score={game.homeScore}
          side="home"
        />
      </div>

      <BettingSnapshot game={game} />
      <PlayerMatchups game={game} />
    </article>
  );
}

function InsightRail({ games }: { games: DashboardGame[] }) {
  const pricedGames = games.filter((game) => game.odds);
  const strongestFavorite = pricedGames
    .map((game) => ({ game, favorite: getFavorite(game.odds) }))
    .filter((row): row is { game: DashboardGame; favorite: NonNullable<ReturnType<typeof getFavorite>> } =>
      Boolean(row.favorite)
    )
    .sort((a, b) => b.favorite.probability - a.favorite.probability)[0];

  const biggestGap = pricedGames
    .map((game) => ({ game, gap: getLargestLineGap(game.odds, "h2h") }))
    .sort((a, b) => b.gap - a.gap)[0];

  const propLeaders = [...playerProfiles]
    .sort((a, b) => b.marketSignal - a.marketSignal)
    .slice(0, 5);

  return (
    <aside className="grid gap-4 lg:sticky lg:top-4 lg:self-start">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-black text-zinc-950">Slate Intelligence</h2>
        <div className="mt-4 grid gap-3">
          <Pill
            label="Strong favorite"
            value={
              strongestFavorite
                ? `${teamLabel(strongestFavorite.favorite.team)} ${formatProbability(
                    strongestFavorite.favorite.probability
                  )}`
                : "N/A"
            }
            tone="green"
          />
          <Pill
            label="Shop this game"
            value={
              biggestGap
                ? `${teamLabel(biggestGap.game.awayTeam)} at ${teamLabel(biggestGap.game.homeTeam)} - ${biggestGap.gap}`
                : "N/A"
            }
            tone="amber"
          />
          <Pill label="Priced matchups" value={`${pricedGames.length} of ${games.length}`} />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-black text-zinc-950">Player Prop Watch</h2>
        <div className="mt-4 grid gap-3">
          {propLeaders.map((player) => (
            <div
              key={player.id}
              className="grid grid-cols-[1fr_auto] gap-3 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-zinc-950">{player.name}</p>
                <p className="truncate text-xs font-semibold text-zinc-500">
                  {teamLabel(player.team)} - {player.propLean.side} {player.propLean.line}{" "}
                  {player.propLean.market}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-amber-700">
                  {formatOdds(player.propLean.odds)}
                </p>
                <p className="text-[0.65rem] font-bold uppercase text-zinc-500">
                  {player.propLean.confidence}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
      <h2 className="text-xl font-black text-zinc-950">No matchups found</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-zinc-500">{message}</p>
    </div>
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof body === "object" && body !== null && "error" in body
        ? String((body as { error: unknown }).error)
        : "Request failed";
    throw new Error(message);
  }

  return body as T;
}

export default function MatchupsPage() {
  const [games, setGames] = useState<EspnEvent[]>([]);
  const [odds, setOdds] = useState<OddsEvent[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SlateFilter>("all");

  const loadSlate = useCallback(async () => {
    await Promise.resolve();
    setLoadState("loading");
    setError("");

    try {
      const [scoreboardResult, oddsResult] = await Promise.allSettled([
        fetchJson<EspnScoreboard>("/api/games"),
        fetchJson<OddsEvent[]>("/api/odds?markets=h2h,spreads,totals"),
      ]);

      if (scoreboardResult.status === "fulfilled") {
        setGames(scoreboardResult.value.events ?? []);
      } else {
        setGames([]);
      }

      if (oddsResult.status === "fulfilled" && Array.isArray(oddsResult.value)) {
        setOdds(oddsResult.value);
      } else {
        setOdds([]);
      }

      const issues = [
        scoreboardResult.status === "rejected" ? "scoreboard" : "",
        oddsResult.status === "rejected" ? "odds" : "",
      ].filter(Boolean);

      setError(
        issues.length > 0
          ? `Live ${issues.join(" and ")} data unavailable. Showing any remaining slate data.`
          : ""
      );
      setLoadState("ready");
    } catch (caught) {
      setGames([]);
      setOdds([]);
      setError(caught instanceof Error ? caught.message : "Unable to load slate.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSlate();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSlate]);

  const allMatchups = useMemo(() => {
    const parsed = games
      .map((game) => parseEspnGame(game, odds))
      .filter((game): game is DashboardGame => Boolean(game));

    if (parsed.length > 0) return parsed;

    return odds
      .slice()
      .sort(
        (a, b) =>
          new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()
      )
      .map(buildOddsOnlyGame);
  }, [games, odds]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allMatchups
      .filter((game) => {
        if (filter === "priced" && !game.odds) return false;
        if (filter === "live" && !isLive(game)) return false;
        if (filter === "upcoming" && !isUpcoming(game)) return false;
        if (!normalizedQuery) return true;

        return `${game.awayTeam} ${game.homeTeam}`
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allMatchups, filter, query]);

  const nextGame = filtered[0];

  return (
    <main className="min-h-screen bg-[#f6f4ee] text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center justify-between gap-3">
            <Link className="text-sm font-black uppercase tracking-wide text-zinc-950" href="/">
              NBA Stats + Odds
            </Link>
            <div className="flex items-center gap-3 text-sm font-bold">
              <Link className="text-[#174ea6]" href="/matchups">
                Matchups
              </Link>
              <Link className="text-zinc-600 hover:text-zinc-950" href="/odds">
                Odds
              </Link>
            </div>
          </nav>

          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#174ea6]">
                Matchup studio
              </p>
              <h1 className="mt-2 max-w-4xl text-4xl font-black leading-tight text-zinc-950 sm:text-5xl">
                Every game broken into team profiles, player duels, and betting context.
              </h1>
            </div>
            <button
              type="button"
              onClick={loadSlate}
              className="h-11 rounded-md bg-zinc-950 px-4 text-sm font-black text-white hover:bg-zinc-800"
            >
              {loadState === "loading" ? "Refreshing" : "Refresh Slate"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {error}
          </div>
        )}

        <section className="grid gap-3 md:grid-cols-4">
          <Pill label="Slate games" value={`${allMatchups.length}`} />
          <Pill
            label="Priced games"
            value={`${allMatchups.filter((game) => game.odds).length}`}
            tone="green"
          />
          <Pill
            label="Next tip"
            value={nextGame ? `${teamLabel(nextGame.awayTeam)} at ${teamLabel(nextGame.homeTeam)}` : "N/A"}
            tone="blue"
          />
          <Pill
            label="Live now"
            value={`${allMatchups.filter(isLive).length}`}
            tone="amber"
          />
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-end">
            <div className="inline-grid grid-cols-4 rounded-lg border border-zinc-200 bg-zinc-100 p-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={`rounded-md px-3 py-2 text-sm font-black transition ${
                    filter === option.value
                      ? "bg-white text-zinc-950 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-950"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <label className="grid gap-1 text-xs font-black uppercase tracking-wide text-zinc-500">
              Search matchups
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search teams..."
                className="h-10 rounded-md border border-zinc-300 px-3 text-sm font-semibold normal-case tracking-normal text-zinc-950 outline-none focus:border-[#174ea6]"
              />
            </label>
          </div>
        </section>

        {loadState === "loading" && allMatchups.length === 0 ? (
          <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm font-semibold text-zinc-500">
            Loading NBA slate...
          </div>
        ) : loadState === "error" || filtered.length === 0 ? (
          <EmptyState message="Try another filter, search query, or check whether the ESPN and sportsbook feeds are returning games." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <section className="grid gap-5">
              {filtered.map((game) => (
                <MatchupCard key={game.id} game={game} />
              ))}
            </section>
            <InsightRail games={allMatchups} />
          </div>
        )}

        <p className="pb-4 text-xs font-semibold text-zinc-500">
          Not betting advice. Model scores are product signals built from team profile, player profile,
          and live market availability.
        </p>
      </div>
    </main>
  );
}
