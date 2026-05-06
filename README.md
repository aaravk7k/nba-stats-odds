# NBA Stats + Odds Dashboard

A Next.js dashboard for comparing top NBA players, previewing game matchups, and checking sportsbook markets.

## What It Shows

- Top-player impact leaderboard with side-by-side player comparisons
- Product-style matchup studio with team profiles, model leans, player duels, and prop watchlists
- Professional odds board with moneyline, spread, and total tabs
- Search, sort, refresh, sportsbook coverage, and strongest-favorite summaries
- Line-shopping gap detection across books
- Per-game sportsbook comparison matrix
- Best available team moneyline, spread, and total odds from The Odds API
- Player prop lean board from the local player model
- `/api/player-props?eventId=...` for live player prop markets when your Odds API plan supports them

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Create `.env.local` with:

```bash
ODDS_API_KEY=your_key_here
```

Without `ODDS_API_KEY`, the dashboard still renders the player comparison model and any available ESPN schedule data.

## Checks

```bash
npm run lint
npm run build
```
