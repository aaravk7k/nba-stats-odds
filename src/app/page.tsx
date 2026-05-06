"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  canonicalTeamName,
  findTeamProfile,
  playerProfiles,
  playersForTeam,
  type PlayerProfile,
} from "@/lib/nba-dashboard-data";

type EspnTeam = {
  abbreviation?: string;
  displayName?: string;
  shortDisplayName?: string;
};

type EspnCompetitor = {
  homeAway?: "home" | "away";
  score?: string;
  team?: EspnTeam;
  records?: { summary?: string }[];
};

type EspnEvent = {
  id: string;
  date: string;
  name?: string;
  shortName?: string;
  status?: {
    type?: {
      shortDetail?: string;
      state?: string;
    };
  };
  competitions?: {
    venue?: { fullName?: string };
    competitors?: EspnCompetitor[];
  }[];
};

type EspnScoreboard = {
  events?: EspnEvent[];
};

type OddsOutcome = {
  name: string;
  price: number;
  point?: number;
};

type OddsMarket = {
  key: string;
  outcomes?: OddsOutcome[];
};

type Bookmaker = {
  key: string;
  title: string;
  markets?: OddsMarket[];
};

type OddsEvent = {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: Bookmaker[];
};

type BestLine = {
  team: string;
  price: number;
  book: string;
  point?: number;
  event: string;
};

type DashboardGame = {
  id: string;
  date: string;
  status?: string;
  venue?: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: string;
  awayScore?: string;
  homeRecord?: string;
  awayRecord?: string;
  odds?: OddsEvent;
};

type LoadStatus = "loading" | "ready" | "error";

const metricRows = [
  { key: "ppg", label: "PTS", max: 36 },
  { key: "rpg", label: "REB", max: 15 },
  { key: "apg", label: "AST", max: 12 },
  { key: "usage", label: "USG", max: 38 },
  { key: "efficiency", label: "EFF", max: 70 },
  { key: "impact", label: "IMPACT", max: 100 },
] as const;

function normalizeTeamName(name: string) {
  return canonicalTeamName(name).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function formatOdds(price: number | null | undefined) {
  if (price === null || price === undefined) return "N/A";
  return price > 0 ? `+${price}` : `${price}`;
}

function impliedProbability(price: number) {
  if (price > 0) return 100 / (price + 100);
  return Math.abs(price) / (Math.abs(price) + 100);
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function metricValue(player: PlayerProfile, key: (typeof metricRows)[number]["key"]) {
  return player[key];
}

function findMarket(bookmaker: Bookmaker, marketKey: string) {
  return bookmaker.markets?.find((market) => market.key === marketKey);
}

function findOutcome(market: OddsMarket | undefined, teamName: string) {
  const normalized = normalizeTeamName(teamName);
  return market?.outcomes?.find((outcome) => normalizeTeamName(outcome.name) === normalized);
}

function bestLineForTeam(event: OddsEvent | undefined, teamName: string, marketKey = "h2h") {
  if (!event) return null;

  let best: BestLine | null = null;

  for (const bookmaker of event.bookmakers ?? []) {
    const outcome = findOutcome(findMarket(bookmaker, marketKey), teamName);
    if (!outcome) continue;

    if (!best || outcome.price > best.price) {
      best = {
        team: teamName,
        price: outcome.price,
        point: outcome.point,
        book: bookmaker.title,
        event: `${event.away_team} @ ${event.home_team}`,
      };
    }
  }

  return best;
}

function firstLineForTeam(event: OddsEvent | undefined, teamName: string) {
  for (const bookmaker of event?.bookmakers ?? []) {
    const outcome = findOutcome(findMarket(bookmaker, "h2h"), teamName);
    if (outcome) return outcome;
  }

  return null;
}

function findOddsForGame(odds: OddsEvent[], homeTeam: string, awayTeam: string) {
  const home = normalizeTeamName(homeTeam);
  const away = normalizeTeamName(awayTeam);

  return odds.find(
    (event) =>
      normalizeTeamName(event.home_team) === home &&
      normalizeTeamName(event.away_team) === away
  );
}

function parseEspnGame(game: EspnEvent, odds: OddsEvent[]): DashboardGame | null {
  const competition = game.competitions?.[0];
  const competitors = competition?.competitors ?? [];
  const home = competitors.find((competitor) => competitor.homeAway === "home");
  const away = competitors.find((competitor) => competitor.homeAway === "away");

  const homeTeam = home?.team?.displayName;
  const awayTeam = away?.team?.displayName;

  if (!homeTeam || !awayTeam) return null;

  return {
    id: game.id,
    date: game.date,
    status: game.status?.type?.shortDetail,
    venue: competition?.venue?.fullName,
    homeTeam,
    awayTeam,
    homeScore: home?.score,
    awayScore: away?.score,
    homeRecord: home?.records?.[0]?.summary,
    awayRecord: away?.records?.[0]?.summary,
    odds: findOddsForGame(odds, homeTeam, awayTeam),
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

function getTeamLabel(teamName: string) {
  return findTeamProfile(teamName)?.abbreviation ?? teamName;
}

function getTeamStyle(teamName: string) {
  const profile = findTeamProfile(teamName);
  return {
    color: profile?.color ?? "#1f2937",
    secondaryColor: profile?.secondaryColor ?? "#d1d5db",
  };
}

function topPropForTeams(homeTeam: string, awayTeam: string) {
  const players = [...playersForTeam(homeTeam), ...playersForTeam(awayTeam)];
  return players.sort((a, b) => b.marketSignal - a.marketSignal)[0] ?? null;
}

function topPlayerPair(homeTeam: string, awayTeam: string) {
  const homePlayers = playersForTeam(homeTeam);
  const awayPlayers = playersForTeam(awayTeam);
  const pairs: { away: PlayerProfile; home: PlayerProfile }[] = [];

  for (const index of [0, 1]) {
    const away = awayPlayers[index];
    const home = homePlayers[index];
    if (away && home) pairs.push({ away, home });
  }

  return pairs;
}

function compactDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function MarketPill({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  const toneClass =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-zinc-200 bg-white text-zinc-800";

  return (
    <div className={`rounded-lg border px-3 py-2 ${toneClass}`}>
      <div className="text-[0.65rem] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-bold">{value}</div>
    </div>
  );
}

function TeamSwatch({ team }: { team: string }) {
  const { color, secondaryColor } = getTeamStyle(team);

  return (
    <span
      className="inline-flex h-3 w-8 overflow-hidden rounded-sm align-middle"
      aria-hidden="true"
    >
      <span className="h-full flex-1" style={{ backgroundColor: color }} />
      <span className="h-full flex-1" style={{ backgroundColor: secondaryColor }} />
    </span>
  );
}

function PlayerScore({ player, active, onSelect }: { player: PlayerProfile; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid w-full grid-cols-[2.25rem_1fr_auto] items-center gap-3 rounded-lg border px-3 py-2 text-left transition ${
        active
          ? "border-[#174ea6] bg-[#eef4ff]"
          : "border-zinc-200 bg-white hover:border-zinc-400"
      }`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-950 text-xs font-bold text-white">
        {Math.round(player.impact)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-zinc-950">{player.name}</span>
        <span className="flex items-center gap-2 truncate text-xs text-zinc-500">
          <TeamSwatch team={player.team} />
          {getTeamLabel(player.team)} - {player.position}
        </span>
      </span>
      <span className="text-right text-xs font-semibold text-zinc-600">
        {player.ppg.toFixed(1)} PPG
      </span>
    </button>
  );
}

function PlayerSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold normal-case tracking-normal text-zinc-950 outline-none focus:border-[#174ea6]"
      >
        {playerProfiles.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name} - {getTeamLabel(player.team)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ComparisonBar({
  left,
  right,
  label,
  max,
}: {
  left: number;
  right: number;
  label: string;
  max: number;
}) {
  const leftWidth = Math.max(4, Math.min(100, (left / max) * 100));
  const rightWidth = Math.max(4, Math.min(100, (right / max) * 100));

  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-[4rem_1fr_4rem] items-center gap-3 text-xs font-semibold text-zinc-600">
        <span>{left.toFixed(left % 1 === 0 ? 0 : 1)}</span>
        <span className="text-center">{label}</span>
        <span className="text-right">{right.toFixed(right % 1 === 0 ? 0 : 1)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex justify-end rounded-sm bg-zinc-200">
          <div
            className="h-2 rounded-sm bg-[#174ea6]"
            style={{ width: `${leftWidth}%` }}
          />
        </div>
        <div className="rounded-sm bg-zinc-200">
          <div
            className="h-2 rounded-sm bg-[#c43b32]"
            style={{ width: `${rightWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function PlayerComparison({
  left,
  right,
  leftId,
  rightId,
  onLeftChange,
  onRightChange,
}: {
  left: PlayerProfile;
  right: PlayerProfile;
  leftId: string;
  rightId: string;
  onLeftChange: (value: string) => void;
  onRightChange: (value: string) => void;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <PlayerSelect label="Player A" value={leftId} onChange={onLeftChange} />
        <PlayerSelect label="Player B" value={rightId} onChange={onRightChange} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <PlayerBio player={left} align="left" />
        <div className="hidden h-full w-px bg-zinc-200 lg:block" />
        <PlayerBio player={right} align="right" />
      </div>

      <div className="mt-5 grid gap-4">
        {metricRows.map((metric) => (
          <ComparisonBar
            key={metric.key}
            label={metric.label}
            left={metricValue(left, metric.key)}
            right={metricValue(right, metric.key)}
            max={metric.max}
          />
        ))}
      </div>
    </section>
  );
}

function PlayerBio({ player, align }: { player: PlayerProfile; align: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-left lg:text-right" : "text-left"}>
      <div className="flex items-center gap-2 lg:justify-start">
        {align === "left" && <TeamSwatch team={player.team} />}
        <h3 className="text-lg font-black text-zinc-950">{player.name}</h3>
        {align === "right" && <TeamSwatch team={player.team} />}
      </div>
      <p className="text-sm font-semibold text-zinc-600">
        {getTeamLabel(player.team)} - {player.position} - {player.archetype}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 lg:justify-start">
        {player.strengths.map((strength) => (
          <span
            key={strength}
            className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-semibold text-zinc-700"
          >
            {strength}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MarketPill label="Usage" value={`${player.usage}%`} />
        <MarketPill label="Clutch" value={`${player.clutch}`} />
        <MarketPill
          label={player.propLean.market}
          value={`${player.propLean.side} ${player.propLean.line}`}
          tone="good"
        />
      </div>
    </div>
  );
}

function GameCard({ game }: { game: DashboardGame }) {
  const homeMl = bestLineForTeam(game.odds, game.homeTeam);
  const awayMl = bestLineForTeam(game.odds, game.awayTeam);
  const homeOpen = firstLineForTeam(game.odds, game.homeTeam);
  const awayOpen = firstLineForTeam(game.odds, game.awayTeam);
  const topProp = topPropForTeams(game.homeTeam, game.awayTeam);
  const pairs = topPlayerPair(game.homeTeam, game.awayTeam);

  const homeProbability = homeOpen ? impliedProbability(homeOpen.price) : null;
  const awayProbability = awayOpen ? impliedProbability(awayOpen.price) : null;
  const favorite =
    homeProbability !== null && awayProbability !== null
      ? homeProbability >= awayProbability
        ? game.homeTeam
        : game.awayTeam
      : null;

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {compactDate(game.date)}
          </p>
          <h3 className="mt-1 text-xl font-black text-zinc-950">
            {getTeamLabel(game.awayTeam)} at {getTeamLabel(game.homeTeam)}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {game.status ?? game.venue ?? "Scheduled"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right">
          <MarketPill
            label="Favorite"
            value={favorite ? getTeamLabel(favorite) : "N/A"}
            tone={favorite ? "good" : "neutral"}
          />
          <MarketPill
            label="Prop Signal"
            value={topProp ? `${topProp.name.split(" ").slice(-1)[0]} ${topProp.marketSignal}` : "N/A"}
            tone={topProp ? "warn" : "neutral"}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-y border-zinc-200 py-4 sm:grid-cols-2">
        <TeamLine
          team={game.awayTeam}
          record={game.awayRecord}
          score={game.awayScore}
          line={awayMl}
          probability={awayProbability}
        />
        <TeamLine
          team={game.homeTeam}
          record={game.homeRecord}
          score={game.homeScore}
          line={homeMl}
          probability={homeProbability}
        />
      </div>

      <div className="mt-4 grid gap-3">
        <h4 className="text-xs font-black uppercase tracking-wide text-zinc-500">
          Player Matchups
        </h4>
        {pairs.length > 0 ? (
          pairs.map((pair) => (
            <PlayerDuel
              key={`${pair.away.id}-${pair.home.id}`}
              away={pair.away}
              home={pair.home}
            />
          ))
        ) : (
          <p className="text-sm font-medium text-zinc-500">No player model for this matchup yet.</p>
        )}
      </div>

      {topProp && (
        <div className="mt-4 rounded-lg bg-[#fff7e6] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-amber-800">
                Best Player Odds
              </p>
              <p className="font-bold text-zinc-950">
                {topProp.name}: {topProp.propLean.side} {topProp.propLean.line}{" "}
                {topProp.propLean.market}
              </p>
            </div>
            <div className="text-right text-sm font-bold text-amber-900">
              {formatOdds(topProp.propLean.odds)} - {topProp.propLean.book}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function TeamLine({
  team,
  record,
  score,
  line,
  probability,
}: {
  team: string;
  record?: string;
  score?: string;
  line: BestLine | null;
  probability: number | null;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <TeamSwatch team={team} />
            <span className="truncate font-black text-zinc-950">{canonicalTeamName(team)}</span>
          </div>
          <p className="text-xs font-semibold text-zinc-500">
            {record ? `${record} record` : "Team market"}
          </p>
        </div>
        {score && <span className="text-2xl font-black text-zinc-950">{score}</span>}
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <div className="text-xs font-semibold uppercase text-zinc-500">Best ML</div>
          <div className="font-black text-zinc-950">{formatOdds(line?.price)}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-zinc-500">Book</div>
          <div className="truncate font-bold text-zinc-700">{line?.book ?? "N/A"}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase text-zinc-500">Implied</div>
          <div className="font-black text-zinc-950">
            {probability !== null ? percent(probability) : "N/A"}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerDuel({ away, home }: { away: PlayerProfile; home: PlayerProfile }) {
  const awayEdge = away.impact - home.impact;
  const homeEdge = home.impact - away.impact;

  return (
    <div className="grid gap-3 rounded-lg bg-zinc-50 p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <DuelPlayer player={away} edge={awayEdge} />
      <div className="text-center text-xs font-black uppercase tracking-wide text-zinc-400">vs</div>
      <DuelPlayer player={home} edge={homeEdge} alignRight />
    </div>
  );
}

function DuelPlayer({
  player,
  edge,
  alignRight,
}: {
  player: PlayerProfile;
  edge: number;
  alignRight?: boolean;
}) {
  return (
    <div className={alignRight ? "text-left sm:text-right" : ""}>
      <p className="font-bold text-zinc-950">{player.name}</p>
      <p className="text-xs font-semibold text-zinc-500">
        {player.archetype} - Impact {player.impact}
      </p>
      <p className={`mt-1 text-xs font-black ${edge >= 0 ? "text-emerald-700" : "text-zinc-500"}`}>
        {edge >= 0 ? `+${edge.toFixed(0)} model edge` : "chase spot"}
      </p>
    </div>
  );
}

function MarketBoard({
  teamLeaders,
  playerLeaders,
}: {
  teamLeaders: BestLine[];
  playerLeaders: PlayerProfile[];
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-zinc-950">Best Team Odds</h2>
          <Link className="text-sm font-bold text-[#174ea6]" href="/odds">
            Odds Board
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {teamLeaders.length > 0 ? (
            teamLeaders.map((line) => (
              <div
                key={`${line.event}-${line.team}`}
                className="grid grid-cols-[1fr_auto] gap-3 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-zinc-950">
                    <TeamSwatch team={line.team} /> {canonicalTeamName(line.team)}
                  </p>
                  <p className="truncate text-xs font-semibold text-zinc-500">{line.event}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-700">{formatOdds(line.price)}</p>
                  <p className="text-xs font-semibold text-zinc-500">{line.book}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm font-semibold text-zinc-500">
              Add ODDS_API_KEY to populate live sportsbook lines.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-black text-zinc-950">Best Player Odds</h2>
        <div className="mt-4 grid gap-3">
          {playerLeaders.map((player) => (
            <div
              key={player.id}
              className="grid grid-cols-[1fr_auto] gap-3 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-zinc-950">
                  <TeamSwatch team={player.team} /> {player.name}
                </p>
                <p className="truncate text-xs font-semibold text-zinc-500">
                  {player.propLean.side} {player.propLean.line} {player.propLean.market}
                </p>
              </div>
              <div className="text-right">
                <p className="font-black text-amber-700">{formatOdds(player.propLean.odds)}</p>
                <p className="text-xs font-semibold text-zinc-500">
                  {player.propLean.confidence}% signal
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [games, setGames] = useState<EspnEvent[]>([]);
  const [odds, setOdds] = useState<OddsEvent[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [notice, setNotice] = useState("");
  const [leftId, setLeftId] = useState(playerProfiles[0].id);
  const [rightId, setRightId] = useState(playerProfiles[1].id);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setStatus("loading");
      setNotice("");

      const [scoreboardResult, oddsResult] = await Promise.allSettled([
        fetchJson<EspnScoreboard>("/api/games"),
        fetchJson<OddsEvent[]>("/api/odds"),
      ]);

      if (cancelled) return;

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

      setNotice(
        issues.length > 0
          ? `Live ${issues.join(" and ")} data unavailable. Showing the player model with any returned schedule data.`
          : ""
      );
      setStatus("ready");
    }

    loadDashboard().catch(() => {
      if (!cancelled) {
        setStatus("error");
        setNotice("Live data unavailable. Showing the player model.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const leftPlayer = playerProfiles.find((player) => player.id === leftId) ?? playerProfiles[0];
  const rightPlayer = playerProfiles.find((player) => player.id === rightId) ?? playerProfiles[1];

  const topPlayers = useMemo(
    () => [...playerProfiles].sort((a, b) => b.impact - a.impact).slice(0, 10),
    []
  );

  const dashboardGames = useMemo(() => {
    const parsedGames = games
      .map((game) => parseEspnGame(game, odds))
      .filter((game): game is DashboardGame => Boolean(game));

    if (parsedGames.length > 0) return parsedGames.slice(0, 8);

    return odds
      .slice()
      .sort(
        (a, b) =>
          new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()
      )
      .slice(0, 8)
      .map(buildOddsOnlyGame);
  }, [games, odds]);

  const teamLeaders = useMemo(() => {
    return odds
      .flatMap((event) =>
        [event.away_team, event.home_team]
          .map((team) => bestLineForTeam(event, team))
          .filter((line): line is BestLine => Boolean(line))
      )
      .sort((a, b) => impliedProbability(b.price) - impliedProbability(a.price))
      .slice(0, 5);
  }, [odds]);

  const playerLeaders = useMemo(
    () =>
      [...playerProfiles]
        .sort((a, b) => b.marketSignal - a.marketSignal)
        .slice(0, 5),
    []
  );

  const topFavorite = teamLeaders[0];
  const nextGame = dashboardGames[0];

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
              <Link className="text-zinc-600 hover:text-zinc-950" href="/odds">
                Odds
              </Link>
            </div>
          </nav>

          <div className="grid gap-4 lg:grid-cols-[1fr_24rem] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c43b32]">
                League command board
              </p>
              <h1 className="mt-2 max-w-4xl text-4xl font-black leading-tight text-zinc-950 sm:text-5xl">
                NBA player rankings, head-to-head matchups, and betting markets.
              </h1>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <MarketPill label="Top Model" value={topPlayers[0].name.split(" ").slice(-1)[0]} />
              <MarketPill
                label="Best Team"
                value={topFavorite ? getTeamLabel(topFavorite.team) : "N/A"}
                tone={topFavorite ? "good" : "neutral"}
              />
              <MarketPill
                label="Next Game"
                value={nextGame ? `${getTeamLabel(nextGame.awayTeam)} at ${getTeamLabel(nextGame.homeTeam)}` : "N/A"}
                tone="warn"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {notice && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {notice}
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-[24rem_1fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-zinc-950">Best Players</h2>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-black text-zinc-600">
                Impact
              </span>
            </div>
            <div className="mt-4 grid gap-2">
              {topPlayers.map((player) => (
                <PlayerScore
                  key={player.id}
                  player={player}
                  active={player.id === leftId || player.id === rightId}
                  onSelect={() => {
                    if (player.id === leftId) return;
                    setRightId(leftId);
                    setLeftId(player.id);
                  }}
                />
              ))}
            </div>
          </div>

          <PlayerComparison
            left={leftPlayer}
            right={rightPlayer}
            leftId={leftId}
            rightId={rightId}
            onLeftChange={setLeftId}
            onRightChange={setRightId}
          />
        </section>

        <section className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#174ea6]">
                Game slate
              </p>
              <h2 className="text-2xl font-black text-zinc-950">Team vs Team, Player vs Player</h2>
            </div>
            <span className="text-sm font-semibold text-zinc-500">
              {status === "loading" ? "Loading live slate" : `${dashboardGames.length} matchups`}
            </span>
          </div>

          {status === "loading" ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm font-semibold text-zinc-500">
              Loading live NBA data...
            </div>
          ) : status === "error" || dashboardGames.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm font-semibold text-zinc-500">
              No games returned for the current slate.
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {dashboardGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </section>

        <MarketBoard teamLeaders={teamLeaders} playerLeaders={playerLeaders} />

        <p className="pb-4 text-xs font-semibold text-zinc-500">
          Not betting advice. Sportsbook lines move quickly and player props use the local model unless live prop markets are connected.
        </p>
      </div>
    </main>
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
