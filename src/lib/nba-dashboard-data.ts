export type TeamProfile = {
  name: string;
  abbreviation: string;
  conference: "East" | "West";
  color: string;
  secondaryColor: string;
  pace: number;
  defense: number;
  marketHeat: number;
};

export type PlayerPropLean = {
  market: string;
  line: number;
  side: "Over" | "Under";
  odds: number;
  book: string;
  confidence: number;
};

export type PlayerProfile = {
  id: string;
  name: string;
  team: string;
  position: "G" | "F" | "C" | "G/F" | "F/C";
  archetype: string;
  ppg: number;
  rpg: number;
  apg: number;
  usage: number;
  efficiency: number;
  impact: number;
  clutch: number;
  marketSignal: number;
  strengths: string[];
  propLean: PlayerPropLean;
};

export const teamProfiles: TeamProfile[] = [
  { name: "Atlanta Hawks", abbreviation: "ATL", conference: "East", color: "#c8102e", secondaryColor: "#fdb927", pace: 98, defense: 72, marketHeat: 76 },
  { name: "Boston Celtics", abbreviation: "BOS", conference: "East", color: "#007a33", secondaryColor: "#ba9653", pace: 91, defense: 94, marketHeat: 94 },
  { name: "Brooklyn Nets", abbreviation: "BKN", conference: "East", color: "#111111", secondaryColor: "#767676", pace: 86, defense: 73, marketHeat: 55 },
  { name: "Charlotte Hornets", abbreviation: "CHA", conference: "East", color: "#1d1160", secondaryColor: "#00788c", pace: 93, defense: 69, marketHeat: 59 },
  { name: "Chicago Bulls", abbreviation: "CHI", conference: "East", color: "#ce1141", secondaryColor: "#111111", pace: 92, defense: 71, marketHeat: 64 },
  { name: "Cleveland Cavaliers", abbreviation: "CLE", conference: "East", color: "#860038", secondaryColor: "#fdbb30", pace: 89, defense: 95, marketHeat: 91 },
  { name: "Dallas Mavericks", abbreviation: "DAL", conference: "West", color: "#00538c", secondaryColor: "#b8c4ca", pace: 88, defense: 82, marketHeat: 84 },
  { name: "Denver Nuggets", abbreviation: "DEN", conference: "West", color: "#0e2240", secondaryColor: "#fec524", pace: 87, defense: 86, marketHeat: 90 },
  { name: "Detroit Pistons", abbreviation: "DET", conference: "East", color: "#c8102e", secondaryColor: "#1d42ba", pace: 94, defense: 78, marketHeat: 72 },
  { name: "Golden State Warriors", abbreviation: "GSW", conference: "West", color: "#1d428a", secondaryColor: "#ffc72c", pace: 96, defense: 84, marketHeat: 88 },
  { name: "Houston Rockets", abbreviation: "HOU", conference: "West", color: "#ce1141", secondaryColor: "#111111", pace: 91, defense: 89, marketHeat: 78 },
  { name: "Indiana Pacers", abbreviation: "IND", conference: "East", color: "#002d62", secondaryColor: "#fdbb30", pace: 99, defense: 80, marketHeat: 81 },
  { name: "LA Clippers", abbreviation: "LAC", conference: "West", color: "#c8102e", secondaryColor: "#1d428a", pace: 86, defense: 87, marketHeat: 82 },
  { name: "Los Angeles Lakers", abbreviation: "LAL", conference: "West", color: "#552583", secondaryColor: "#fdb927", pace: 90, defense: 79, marketHeat: 92 },
  { name: "Memphis Grizzlies", abbreviation: "MEM", conference: "West", color: "#5d76a9", secondaryColor: "#12173f", pace: 97, defense: 85, marketHeat: 79 },
  { name: "Miami Heat", abbreviation: "MIA", conference: "East", color: "#98002e", secondaryColor: "#f9a01b", pace: 84, defense: 88, marketHeat: 75 },
  { name: "Milwaukee Bucks", abbreviation: "MIL", conference: "East", color: "#00471b", secondaryColor: "#eee1c6", pace: 90, defense: 83, marketHeat: 86 },
  { name: "Minnesota Timberwolves", abbreviation: "MIN", conference: "West", color: "#0c2340", secondaryColor: "#78be20", pace: 89, defense: 93, marketHeat: 87 },
  { name: "New Orleans Pelicans", abbreviation: "NOP", conference: "West", color: "#0c2340", secondaryColor: "#c8102e", pace: 92, defense: 77, marketHeat: 68 },
  { name: "New York Knicks", abbreviation: "NYK", conference: "East", color: "#006bb6", secondaryColor: "#f58426", pace: 85, defense: 90, marketHeat: 89 },
  { name: "Oklahoma City Thunder", abbreviation: "OKC", conference: "West", color: "#007ac1", secondaryColor: "#ef3b24", pace: 95, defense: 96, marketHeat: 96 },
  { name: "Orlando Magic", abbreviation: "ORL", conference: "East", color: "#0077c0", secondaryColor: "#c4ced4", pace: 88, defense: 92, marketHeat: 80 },
  { name: "Philadelphia 76ers", abbreviation: "PHI", conference: "East", color: "#006bb6", secondaryColor: "#ed174c", pace: 89, defense: 81, marketHeat: 77 },
  { name: "Phoenix Suns", abbreviation: "PHX", conference: "West", color: "#1d1160", secondaryColor: "#e56020", pace: 88, defense: 78, marketHeat: 83 },
  { name: "Portland Trail Blazers", abbreviation: "POR", conference: "West", color: "#e03a3e", secondaryColor: "#111111", pace: 93, defense: 72, marketHeat: 57 },
  { name: "Sacramento Kings", abbreviation: "SAC", conference: "West", color: "#5a2d81", secondaryColor: "#63727a", pace: 96, defense: 76, marketHeat: 70 },
  { name: "San Antonio Spurs", abbreviation: "SAS", conference: "West", color: "#111111", secondaryColor: "#c4ced4", pace: 94, defense: 84, marketHeat: 85 },
  { name: "Toronto Raptors", abbreviation: "TOR", conference: "East", color: "#ce1141", secondaryColor: "#a1a1a4", pace: 94, defense: 74, marketHeat: 61 },
  { name: "Utah Jazz", abbreviation: "UTA", conference: "West", color: "#002b5c", secondaryColor: "#f9a01b", pace: 93, defense: 70, marketHeat: 56 },
  { name: "Washington Wizards", abbreviation: "WAS", conference: "East", color: "#002b5c", secondaryColor: "#e31837", pace: 98, defense: 66, marketHeat: 53 },
];

export const teamAliases: Record<string, string> = {
  "Los Angeles Clippers": "LA Clippers",
  "L.A. Clippers": "LA Clippers",
  Clippers: "LA Clippers",
  Lakers: "Los Angeles Lakers",
  "Golden St. Warriors": "Golden State Warriors",
  "GS Warriors": "Golden State Warriors",
  "New York": "New York Knicks",
  "Oklahoma City": "Oklahoma City Thunder",
  "Portland Trail Blazers": "Portland Trail Blazers",
  "Portland Trailblazers": "Portland Trail Blazers",
  "Phoenix": "Phoenix Suns",
  "Philadelphia": "Philadelphia 76ers",
  "San Antonio": "San Antonio Spurs",
};

export const playerProfiles: PlayerProfile[] = [
  { id: "shai-gilgeous-alexander", name: "Shai Gilgeous-Alexander", team: "Oklahoma City Thunder", position: "G", archetype: "Rim pressure scorer", ppg: 32.7, rpg: 5.0, apg: 6.4, usage: 34, efficiency: 66, impact: 98, clutch: 96, marketSignal: 97, strengths: ["drives", "free throws", "midrange"], propLean: { market: "Points", line: 31.5, side: "Over", odds: -108, book: "FanDuel", confidence: 91 } },
  { id: "nikola-jokic", name: "Nikola Jokic", team: "Denver Nuggets", position: "C", archetype: "Offense hub", ppg: 29.6, rpg: 12.7, apg: 10.2, usage: 31, efficiency: 68, impact: 99, clutch: 94, marketSignal: 96, strengths: ["post creation", "passing", "rebounding"], propLean: { market: "Assists", line: 9.5, side: "Over", odds: +102, book: "DraftKings", confidence: 88 } },
  { id: "giannis-antetokounmpo", name: "Giannis Antetokounmpo", team: "Milwaukee Bucks", position: "F", archetype: "Transition force", ppg: 30.4, rpg: 11.9, apg: 6.5, usage: 33, efficiency: 65, impact: 96, clutch: 88, marketSignal: 93, strengths: ["paint scoring", "rim defense", "tempo"], propLean: { market: "Rebounds", line: 11.5, side: "Over", odds: -112, book: "BetMGM", confidence: 84 } },
  { id: "luka-doncic", name: "Luka Doncic", team: "Los Angeles Lakers", position: "G/F", archetype: "Pick-and-roll engine", ppg: 28.2, rpg: 8.3, apg: 8.0, usage: 35, efficiency: 62, impact: 95, clutch: 93, marketSignal: 95, strengths: ["stepbacks", "playmaking", "mismatches"], propLean: { market: "Points + Assists", line: 39.5, side: "Over", odds: -105, book: "Caesars", confidence: 87 } },
  { id: "jayson-tatum", name: "Jayson Tatum", team: "Boston Celtics", position: "F", archetype: "Two-way wing scorer", ppg: 26.8, rpg: 8.7, apg: 6.0, usage: 30, efficiency: 60, impact: 94, clutch: 90, marketSignal: 91, strengths: ["switch hunting", "defense", "pull-up threes"], propLean: { market: "Points", line: 27.5, side: "Over", odds: +100, book: "ESPN BET", confidence: 82 } },
  { id: "anthony-edwards", name: "Anthony Edwards", team: "Minnesota Timberwolves", position: "G", archetype: "Explosive shot creator", ppg: 27.6, rpg: 5.7, apg: 4.5, usage: 32, efficiency: 59, impact: 92, clutch: 91, marketSignal: 90, strengths: ["rim attacks", "pull-up threes", "point-of-attack defense"], propLean: { market: "3PT Made", line: 3.5, side: "Over", odds: +118, book: "FanDuel", confidence: 79 } },
  { id: "jalen-brunson", name: "Jalen Brunson", team: "New York Knicks", position: "G", archetype: "Half-court closer", ppg: 26.0, rpg: 3.1, apg: 7.3, usage: 32, efficiency: 61, impact: 91, clutch: 95, marketSignal: 89, strengths: ["footwork", "late clock", "floaters"], propLean: { market: "Points", line: 25.5, side: "Over", odds: -110, book: "DraftKings", confidence: 83 } },
  { id: "victor-wembanyama", name: "Victor Wembanyama", team: "San Antonio Spurs", position: "C", archetype: "Rim deterrent scorer", ppg: 24.3, rpg: 11.0, apg: 3.7, usage: 31, efficiency: 61, impact: 93, clutch: 82, marketSignal: 92, strengths: ["blocks", "lob threat", "trail threes"], propLean: { market: "Blocks", line: 3.5, side: "Over", odds: +112, book: "BetMGM", confidence: 86 } },
  { id: "donovan-mitchell", name: "Donovan Mitchell", team: "Cleveland Cavaliers", position: "G", archetype: "Pressure guard", ppg: 24.0, rpg: 4.5, apg: 5.2, usage: 31, efficiency: 60, impact: 89, clutch: 87, marketSignal: 86, strengths: ["paint touches", "transition", "pull-up threes"], propLean: { market: "Points", line: 24.5, side: "Over", odds: -102, book: "FanDuel", confidence: 80 } },
  { id: "stephen-curry", name: "Stephen Curry", team: "Golden State Warriors", position: "G", archetype: "Movement shooter", ppg: 24.5, rpg: 4.4, apg: 6.0, usage: 29, efficiency: 62, impact: 90, clutch: 92, marketSignal: 88, strengths: ["off-ball gravity", "deep threes", "pace"], propLean: { market: "3PT Made", line: 4.5, side: "Over", odds: +110, book: "Caesars", confidence: 78 } },
  { id: "kevin-durant", name: "Kevin Durant", team: "Phoenix Suns", position: "F", archetype: "Isolation scorer", ppg: 26.6, rpg: 6.0, apg: 4.2, usage: 30, efficiency: 63, impact: 88, clutch: 89, marketSignal: 85, strengths: ["midrange", "late clock", "length"], propLean: { market: "Points", line: 25.5, side: "Over", odds: -106, book: "DraftKings", confidence: 78 } },
  { id: "devin-booker", name: "Devin Booker", team: "Phoenix Suns", position: "G", archetype: "Three-level guard", ppg: 25.6, rpg: 4.0, apg: 6.9, usage: 31, efficiency: 60, impact: 86, clutch: 84, marketSignal: 83, strengths: ["pull-ups", "touch passing", "free throws"], propLean: { market: "Assists", line: 6.5, side: "Over", odds: +106, book: "ESPN BET", confidence: 75 } },
  { id: "lebron-james", name: "LeBron James", team: "Los Angeles Lakers", position: "F", archetype: "Power playmaker", ppg: 24.4, rpg: 7.8, apg: 8.2, usage: 28, efficiency: 61, impact: 88, clutch: 86, marketSignal: 86, strengths: ["rim reads", "transition", "post passing"], propLean: { market: "Assists", line: 7.5, side: "Over", odds: +104, book: "BetMGM", confidence: 76 } },
  { id: "cade-cunningham", name: "Cade Cunningham", team: "Detroit Pistons", position: "G", archetype: "Big initiator", ppg: 26.1, rpg: 6.1, apg: 9.1, usage: 32, efficiency: 58, impact: 87, clutch: 85, marketSignal: 84, strengths: ["pick-and-roll", "skip passes", "size"], propLean: { market: "Assists", line: 8.5, side: "Over", odds: +100, book: "FanDuel", confidence: 77 } },
  { id: "paolo-banchero", name: "Paolo Banchero", team: "Orlando Magic", position: "F", archetype: "Power creator", ppg: 25.9, rpg: 7.5, apg: 4.8, usage: 32, efficiency: 57, impact: 86, clutch: 83, marketSignal: 82, strengths: ["paint creation", "free throws", "matchup size"], propLean: { market: "Points", line: 24.5, side: "Over", odds: -104, book: "DraftKings", confidence: 76 } },
  { id: "tyrese-haliburton", name: "Tyrese Haliburton", team: "Indiana Pacers", position: "G", archetype: "Tempo passer", ppg: 19.2, rpg: 3.6, apg: 9.2, usage: 24, efficiency: 61, impact: 85, clutch: 81, marketSignal: 80, strengths: ["early offense", "hit-aheads", "pull-up threes"], propLean: { market: "Assists", line: 8.5, side: "Over", odds: -108, book: "Caesars", confidence: 78 } },
  { id: "joel-embiid", name: "Joel Embiid", team: "Philadelphia 76ers", position: "C", archetype: "Post scorer", ppg: 28.5, rpg: 10.2, apg: 4.4, usage: 34, efficiency: 62, impact: 89, clutch: 83, marketSignal: 79, strengths: ["free throws", "post seals", "rim protection"], propLean: { market: "Points", line: 27.5, side: "Over", odds: +102, book: "BetMGM", confidence: 74 } },
  { id: "anthony-davis", name: "Anthony Davis", team: "Dallas Mavericks", position: "F/C", archetype: "Interior anchor", ppg: 24.7, rpg: 11.6, apg: 3.4, usage: 28, efficiency: 62, impact: 89, clutch: 80, marketSignal: 81, strengths: ["rim defense", "roll gravity", "rebounding"], propLean: { market: "Rebounds", line: 10.5, side: "Over", odds: -115, book: "FanDuel", confidence: 79 } },
  { id: "kyrie-irving", name: "Kyrie Irving", team: "Dallas Mavericks", position: "G", archetype: "Shotmaking guard", ppg: 24.7, rpg: 4.8, apg: 4.6, usage: 29, efficiency: 61, impact: 84, clutch: 90, marketSignal: 77, strengths: ["isolation", "finishing", "late clock"], propLean: { market: "Points", line: 23.5, side: "Over", odds: +104, book: "DraftKings", confidence: 72 } },
  { id: "trae-young", name: "Trae Young", team: "Atlanta Hawks", position: "G", archetype: "Deep pick-and-roll creator", ppg: 24.2, rpg: 3.1, apg: 11.6, usage: 31, efficiency: 59, impact: 83, clutch: 84, marketSignal: 80, strengths: ["lobs", "deep range", "free throws"], propLean: { market: "Assists", line: 10.5, side: "Over", odds: +112, book: "ESPN BET", confidence: 76 } },
  { id: "jaylen-brown", name: "Jaylen Brown", team: "Boston Celtics", position: "G/F", archetype: "Slashing wing", ppg: 22.2, rpg: 5.8, apg: 3.6, usage: 27, efficiency: 58, impact: 82, clutch: 78, marketSignal: 76, strengths: ["rim attacks", "wing defense", "transition"], propLean: { market: "Points", line: 21.5, side: "Over", odds: -104, book: "FanDuel", confidence: 72 } },
  { id: "evan-mobley", name: "Evan Mobley", team: "Cleveland Cavaliers", position: "F/C", archetype: "Switch big", ppg: 18.5, rpg: 9.3, apg: 3.2, usage: 22, efficiency: 63, impact: 84, clutch: 76, marketSignal: 74, strengths: ["defensive range", "finishing", "offensive glass"], propLean: { market: "Rebounds", line: 8.5, side: "Over", odds: -105, book: "DraftKings", confidence: 74 } },
  { id: "jamal-murray", name: "Jamal Murray", team: "Denver Nuggets", position: "G", archetype: "Playoff shotmaker", ppg: 21.4, rpg: 4.0, apg: 6.0, usage: 27, efficiency: 58, impact: 80, clutch: 87, marketSignal: 76, strengths: ["two-man game", "pull-ups", "clutch scoring"], propLean: { market: "Points", line: 20.5, side: "Over", odds: +100, book: "BetMGM", confidence: 71 } },
  { id: "jimmy-butler", name: "Jimmy Butler", team: "Golden State Warriors", position: "F", archetype: "Contact creator", ppg: 19.8, rpg: 5.6, apg: 5.4, usage: 25, efficiency: 61, impact: 83, clutch: 86, marketSignal: 78, strengths: ["free throws", "post seals", "defensive reads"], propLean: { market: "Free Throws Made", line: 5.5, side: "Over", odds: +102, book: "FanDuel", confidence: 75 } },
  { id: "alperen-sengun", name: "Alperen Sengun", team: "Houston Rockets", position: "C", archetype: "Post passer", ppg: 19.1, rpg: 10.3, apg: 4.9, usage: 27, efficiency: 59, impact: 82, clutch: 76, marketSignal: 75, strengths: ["post passing", "rebounds", "touch"], propLean: { market: "Rebounds", line: 9.5, side: "Over", odds: -108, book: "DraftKings", confidence: 73 } },
  { id: "james-harden", name: "James Harden", team: "LA Clippers", position: "G", archetype: "Table-setter", ppg: 22.8, rpg: 5.8, apg: 8.7, usage: 28, efficiency: 59, impact: 81, clutch: 84, marketSignal: 77, strengths: ["pick-and-roll", "free throws", "stepbacks"], propLean: { market: "Assists", line: 8.5, side: "Over", odds: +104, book: "ESPN BET", confidence: 74 } },
  { id: "kawhi-leonard", name: "Kawhi Leonard", team: "LA Clippers", position: "F", archetype: "Two-way isolation", ppg: 23.7, rpg: 6.1, apg: 3.7, usage: 27, efficiency: 62, impact: 84, clutch: 85, marketSignal: 76, strengths: ["midrange", "wing defense", "post-ups"], propLean: { market: "Points", line: 22.5, side: "Over", odds: -106, book: "Caesars", confidence: 72 } },
  { id: "ja-morant", name: "Ja Morant", team: "Memphis Grizzlies", position: "G", archetype: "Paint-bending guard", ppg: 23.4, rpg: 4.1, apg: 7.5, usage: 31, efficiency: 57, impact: 81, clutch: 85, marketSignal: 78, strengths: ["drives", "transition", "rim pressure"], propLean: { market: "Points + Assists", line: 31.5, side: "Over", odds: -102, book: "FanDuel", confidence: 73 } },
  { id: "bam-adebayo", name: "Bam Adebayo", team: "Miami Heat", position: "C", archetype: "Defensive connector", ppg: 18.1, rpg: 9.6, apg: 4.3, usage: 24, efficiency: 57, impact: 80, clutch: 78, marketSignal: 72, strengths: ["switch defense", "handoffs", "rebounds"], propLean: { market: "Rebounds", line: 9.5, side: "Over", odds: +100, book: "DraftKings", confidence: 72 } },
  { id: "damian-lillard", name: "Damian Lillard", team: "Milwaukee Bucks", position: "G", archetype: "Deep range guard", ppg: 24.9, rpg: 4.4, apg: 7.1, usage: 30, efficiency: 60, impact: 82, clutch: 89, marketSignal: 79, strengths: ["deep threes", "free throws", "late clock"], propLean: { market: "3PT Made", line: 3.5, side: "Over", odds: +116, book: "BetMGM", confidence: 72 } },
  { id: "lamelo-ball", name: "LaMelo Ball", team: "Charlotte Hornets", position: "G", archetype: "High-variance creator", ppg: 25.2, rpg: 5.1, apg: 7.4, usage: 32, efficiency: 56, impact: 79, clutch: 78, marketSignal: 74, strengths: ["deep pull-ups", "tempo", "skip passes"], propLean: { market: "Assists", line: 7.5, side: "Over", odds: +108, book: "Caesars", confidence: 70 } },
  { id: "brandon-miller", name: "Brandon Miller", team: "Charlotte Hornets", position: "F", archetype: "Scoring wing", ppg: 21.0, rpg: 4.8, apg: 3.6, usage: 27, efficiency: 56, impact: 76, clutch: 75, marketSignal: 69, strengths: ["catch-and-shoot", "length", "pull-ups"], propLean: { market: "3PT Made", line: 2.5, side: "Over", odds: +104, book: "DraftKings", confidence: 68 } },
  { id: "tyler-herro", name: "Tyler Herro", team: "Miami Heat", position: "G", archetype: "Movement scorer", ppg: 23.9, rpg: 5.2, apg: 5.4, usage: 28, efficiency: 58, impact: 76, clutch: 79, marketSignal: 71, strengths: ["pull-ups", "handoff actions", "spacing"], propLean: { market: "3PT Made", line: 3.5, side: "Over", odds: +110, book: "FanDuel", confidence: 69 } },
  { id: "domantas-sabonis", name: "Domantas Sabonis", team: "Sacramento Kings", position: "C", archetype: "Elbow hub", ppg: 19.1, rpg: 13.9, apg: 6.0, usage: 24, efficiency: 63, impact: 81, clutch: 73, marketSignal: 73, strengths: ["rebounds", "handoffs", "paint passing"], propLean: { market: "Rebounds", line: 12.5, side: "Over", odds: -104, book: "ESPN BET", confidence: 73 } },
  { id: "pascal-siakam", name: "Pascal Siakam", team: "Indiana Pacers", position: "F", archetype: "Tempo forward", ppg: 20.2, rpg: 6.9, apg: 3.4, usage: 25, efficiency: 60, impact: 78, clutch: 75, marketSignal: 70, strengths: ["transition", "post spins", "rim pressure"], propLean: { market: "Points", line: 19.5, side: "Over", odds: -105, book: "FanDuel", confidence: 69 } },
  { id: "zach-lavine", name: "Zach LaVine", team: "Sacramento Kings", position: "G", archetype: "Athletic shotmaker", ppg: 23.1, rpg: 4.2, apg: 4.0, usage: 28, efficiency: 59, impact: 75, clutch: 77, marketSignal: 68, strengths: ["spot-up threes", "transition", "rim finishes"], propLean: { market: "Points", line: 22.5, side: "Over", odds: +106, book: "BetMGM", confidence: 67 } },
  { id: "zion-williamson", name: "Zion Williamson", team: "New Orleans Pelicans", position: "F", archetype: "Paint pressure forward", ppg: 24.6, rpg: 7.2, apg: 5.3, usage: 30, efficiency: 62, impact: 82, clutch: 78, marketSignal: 76, strengths: ["rim pressure", "second jumps", "drive kicks"], propLean: { market: "Points", line: 23.5, side: "Over", odds: -108, book: "DraftKings", confidence: 74 } },
  { id: "karl-anthony-towns", name: "Karl-Anthony Towns", team: "New York Knicks", position: "F/C", archetype: "Stretch big", ppg: 24.4, rpg: 12.8, apg: 3.1, usage: 27, efficiency: 64, impact: 86, clutch: 79, marketSignal: 82, strengths: ["pick-and-pop", "rebounding", "spacing"], propLean: { market: "Rebounds", line: 11.5, side: "Over", odds: +102, book: "FanDuel", confidence: 77 } },
  { id: "chet-holmgren", name: "Chet Holmgren", team: "Oklahoma City Thunder", position: "F/C", archetype: "Stretch rim protector", ppg: 16.5, rpg: 8.0, apg: 2.4, usage: 21, efficiency: 62, impact: 82, clutch: 74, marketSignal: 76, strengths: ["blocks", "spacing", "rim runs"], propLean: { market: "Blocks", line: 2.5, side: "Over", odds: +105, book: "DraftKings", confidence: 76 } },
  { id: "franz-wagner", name: "Franz Wagner", team: "Orlando Magic", position: "F", archetype: "Driving wing", ppg: 24.2, rpg: 5.7, apg: 4.7, usage: 29, efficiency: 58, impact: 80, clutch: 77, marketSignal: 73, strengths: ["drives", "secondary creation", "defense"], propLean: { market: "Points", line: 22.5, side: "Over", odds: +100, book: "BetMGM", confidence: 70 } },
  { id: "tyrese-maxey", name: "Tyrese Maxey", team: "Philadelphia 76ers", position: "G", archetype: "Speed guard", ppg: 26.3, rpg: 3.3, apg: 6.1, usage: 31, efficiency: 58, impact: 83, clutch: 82, marketSignal: 77, strengths: ["pace", "pull-up threes", "rim pressure"], propLean: { market: "Points", line: 25.5, side: "Over", odds: -104, book: "Caesars", confidence: 73 } },
  { id: "scottie-barnes", name: "Scottie Barnes", team: "Toronto Raptors", position: "F", archetype: "Connector forward", ppg: 19.3, rpg: 7.8, apg: 5.9, usage: 25, efficiency: 57, impact: 78, clutch: 73, marketSignal: 68, strengths: ["defense", "passing", "transition"], propLean: { market: "Assists", line: 5.5, side: "Over", odds: +106, book: "DraftKings", confidence: 68 } },
  { id: "lauri-markkanen", name: "Lauri Markkanen", team: "Utah Jazz", position: "F", archetype: "Stretch scorer", ppg: 19.0, rpg: 5.9, apg: 1.5, usage: 24, efficiency: 59, impact: 73, clutch: 70, marketSignal: 66, strengths: ["spot-up threes", "cuts", "size"], propLean: { market: "Points", line: 18.5, side: "Over", odds: +102, book: "FanDuel", confidence: 66 } },
  { id: "jordan-poole", name: "Jordan Poole", team: "Washington Wizards", position: "G", archetype: "Volume guard", ppg: 20.5, rpg: 3.0, apg: 4.5, usage: 29, efficiency: 55, impact: 68, clutch: 70, marketSignal: 63, strengths: ["pull-ups", "pace", "free throws"], propLean: { market: "Points", line: 19.5, side: "Over", odds: +108, book: "ESPN BET", confidence: 63 } },
  { id: "cam-thomas", name: "Cam Thomas", team: "Brooklyn Nets", position: "G", archetype: "Volume scorer", ppg: 24.0, rpg: 3.3, apg: 3.8, usage: 31, efficiency: 56, impact: 72, clutch: 76, marketSignal: 67, strengths: ["shot creation", "free throws", "floaters"], propLean: { market: "Points", line: 23.5, side: "Over", odds: +100, book: "BetMGM", confidence: 68 } },
  { id: "shaedon-sharpe", name: "Shaedon Sharpe", team: "Portland Trail Blazers", position: "G", archetype: "Explosive wing guard", ppg: 18.9, rpg: 4.5, apg: 2.8, usage: 27, efficiency: 55, impact: 70, clutch: 69, marketSignal: 64, strengths: ["rim pressure", "transition", "shotmaking"], propLean: { market: "Points", line: 18.5, side: "Over", odds: +104, book: "DraftKings", confidence: 64 } },
];

export function canonicalTeamName(name: string) {
  return teamAliases[name] ?? name;
}

export function findTeamProfile(name: string) {
  const canonical = canonicalTeamName(name);
  return teamProfiles.find((team) => team.name === canonical);
}

export function playersForTeam(teamName: string) {
  const canonical = canonicalTeamName(teamName);
  return playerProfiles
    .filter((player) => player.team === canonical)
    .sort((a, b) => b.impact - a.impact);
}
