// Token radar value model: one frozen DefiLlama snapshot in, one ranked board out.
//
// The model scores only protocols whose own record carries no token: no market cap, no
// CoinGecko id and no symbol. Every watchlist slug is covered (the floor), and the early
// radar adds pre-token protocols below the floor so the board finds them before they are
// obvious. Live-token protocols are held apart and shown at the market's own value.
//
// Implied value is derived only from the snapshot's own figures, never from a name list:
//   base       = tvl_usd * BASE_MULTIPLE
//   growth     = clamp(change_7d, -60, 120) / 100 * GROWTH_WEIGHT
//   maturity   = MATURITY_FLOOR + min(age,1095)/1095 * MATURITY_RANGE
//   chain      = 1 + min(chains.length, 6) * 0.02   (multi-chain reach)
//   implied    = max(1, round(base * (1 + growth) * maturity * chain))
// The constants are stated on the dashboard and changeable here; no slug is special-cased.

export interface SnapshotProtocol {
  slug: string; name: string; category: string | null; chains: string[];
  tvl_usd: number; change_7d: number | null; mcap_usd: number | null;
  listed_at: string | null; gecko_id: string | null; symbol: string | null;
}
export interface Snapshot {
  as_of: string; source: string; floor_usd: number;
  protocols: SnapshotProtocol[]; watchlist: string[];
}
export interface ModelConstants {
  base_multiple: number; growth_weight: number; growth_floor: number; growth_cap: number;
  maturity_floor: number; maturity_range: number; maturity_days: number;
  unknown_age_days: number; chain_weight: number; chain_cap: number;
}
export const MODEL: ModelConstants = {
  base_multiple: 0.25, growth_weight: 0.55, growth_floor: -60, growth_cap: 120,
  maturity_floor: 0.6, maturity_range: 0.4, maturity_days: 1095,
  unknown_age_days: 365, chain_weight: 0.02, chain_cap: 6,
};
export const MODEL_VERSION = 'radar-2-multichain';
export const EARLY_ROWS = 160;
export const LIVE_ROWS = 24;

export interface FarmStep { text: string; cost: string; time: string }
export interface BoardRow {
  rank: number; slug: string; name: string; category: string | null; chains: string[];
  tvl_usd: number; change_7d: number | null; mcap_usd: number | null;
  listed_at: string | null; gecko_id: string | null; symbol: string | null;
  token_status: 'pre-token'; age_days: number | null; implied_value_usd: number;
  model: { base_multiple: number; growth_pct: number; growth_multiplier: number;
    maturity_multiplier: number; chain_multiplier: number; age_days: number | null };
  farm_steps: string[];
}
export interface RadarRow {
  rank: number; slug: string; name: string; category: string | null; chains: string[];
  tvl_usd: number; change_7d: number | null; mcap_usd: number | null;
  listed_at: string | null; age_days: number | null; implied_value_usd: number;
  growth_multiplier: number; maturity_multiplier: number; chain_multiplier: number;
}
export interface LiveRow {
  slug: string; name: string; category: string | null; chains: string[];
  tvl_usd: number; mcap_usd: number | null; change_7d: number | null;
}
export interface RadarData {
  as_of: string; source: string; floor_usd: number; model: ModelConstants;
  model_version: string; watchlist_size: number; board_size: number;
  early_size: number; live_size: number; rows: RadarRow[]; live: LiveRow[];
}
export class SnapshotError extends Error {
  constructor(message: string) { super(message); this.name = 'SnapshotError'; }
}
const DAY_MS = 86_400_000;
function finite(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}
export function ageDays(asOf: string, listedAt: string | null): number | null {
  if (listedAt === null) return null;
  const a = Date.parse(`${asOf}T00:00:00Z`), b = Date.parse(`${listedAt}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.max(0, Math.floor((a - b) / DAY_MS));
}
export function impliedValue(p: SnapshotProtocol, asOf: string, m: ModelConstants) {
  const age = ageDays(asOf, p.listed_at);
  const growthPct = Math.min(m.growth_cap, Math.max(m.growth_floor, finite(p.change_7d, 0)));
  const growthMult = 1 + (growthPct / 100) * m.growth_weight;
  const ageForModel = age ?? m.unknown_age_days;
  const maturityMult = m.maturity_floor + (Math.min(Math.max(ageForModel, 0), m.maturity_days) / m.maturity_days) * m.maturity_range;
  const chainMult = 1 + Math.min(p.chains.length, m.chain_cap) * m.chain_weight;
  const base = p.tvl_usd * m.base_multiple;
  const implied = Math.max(1, Math.round(base * growthMult * maturityMult * chainMult));
  return { implied, growthPct, growthMult, maturityMult, chainMult, age };
}
const VERSIONED = /\s(V\d+(\.\d+)?|v\d+(\.\d+)?|\d+\.\d+)$/;
export function isPreToken(p: SnapshotProtocol): boolean {
  return p.mcap_usd === null && p.gecko_id === null && p.symbol === null;
}
export function isRankable(p: SnapshotProtocol): boolean {
  return isPreToken(p) && p.category !== 'CEX' && !VERSIONED.test(p.name);
}
function bySlug(ps: SnapshotProtocol[]): Map<string, SnapshotProtocol> {
  return new Map(ps.map((p) => [p.slug, p]));
}
const round4 = (n: number): number => Math.round(n * 1e4) / 1e4;
export function buildBoard(s: Snapshot, m: ModelConstants = MODEL): BoardRow[] {
  const index = bySlug(s.protocols);
  const chosen = new Map<string, SnapshotProtocol>();
  for (const slug of s.watchlist) {
    const p = index.get(slug);
    if (p !== undefined) chosen.set(slug, p);
  }
  const early = s.protocols
    .filter((p) => !chosen.has(p.slug) && isRankable(p) && p.tvl_usd < s.floor_usd)
    .sort((a, b) => b.tvl_usd - a.tvl_usd || (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0))
    .slice(0, EARLY_ROWS);
  for (const p of early) chosen.set(p.slug, p);
  const scored = [...chosen.values()].map((p) => ({ p, ...impliedValue(p, s.as_of, m) }));
  scored.sort((a, b) => b.implied - a.implied || (a.p.slug < b.p.slug ? -1 : a.p.slug > b.p.slug ? 1 : 0));
  return scored.map((x, i) => ({
    rank: i + 1, slug: x.p.slug, name: x.p.name, category: x.p.category, chains: x.p.chains,
    tvl_usd: x.p.tvl_usd, change_7d: x.p.change_7d, mcap_usd: x.p.mcap_usd,
    listed_at: x.p.listed_at, gecko_id: x.p.gecko_id, symbol: x.p.symbol,
    token_status: 'pre-token' as const, age_days: x.age, implied_value_usd: x.implied,
    model: { base_multiple: m.base_multiple, growth_pct: round4(x.growthPct),
      growth_multiplier: round4(x.growthMult), maturity_multiplier: round4(x.maturityMult),
      chain_multiplier: round4(x.chainMult), age_days: x.age },
    farm_steps: farmSteps(x.p, x.age).map(stepText),
  }));
}
export function stepText(step: FarmStep): string {
  let t = `${step.text} Cost: ${step.cost}. Time: ${step.time}.`;
  if (t.length > 600) t = `${t.slice(0, 596)}...`;
  if (t.length < 20) t = `${t} Keep the position and review the protocol's own page.`;
  return t;
}
function chainOf(p: SnapshotProtocol): string { return p.chains.length > 0 ? p.chains[0]! : 'its main chain'; }
function capitalFor(p: SnapshotProtocol): number {
  if (p.tvl_usd >= 5_000_000_000) return 250;
  if (p.tvl_usd >= 1_000_000_000) return 150;
  if (p.tvl_usd >= 100_000_000) return 100;
  return 50;
}
function holdDaysFor(age: number | null): number {
  if (age === null) return 30;
  if (age < 180) return 60;
  if (age < 365) return 45;
  return 30;
}
function actionFor(p: SnapshotProtocol, capital: number, chain: string): string {
  const c = (p.category ?? '').toLowerCase(), name = p.name;
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral')) return `Supply $${capital} of USDC to ${name} on ${chain} and keep the position open.`;
  if (c.includes('dex') || c.includes('yield') || c.includes('leveraged farm')) return `Provide $${capital} of liquidity to ${name}'s main pool on ${chain} and keep the position open.`;
  if (c.includes('bridge')) return `Bridge $${capital} of USDC to ${chain} through ${name} and use the bridged funds in its app.`;
  if (c.includes('staking') || c.includes('restak')) return `Stake $${capital} of the chain's staking asset through ${name} and keep the receipt.`;
  if (c.includes('perpetual') || c.includes('derivative')) return `Deposit $${capital} of USDC as margin on ${name} and open one small hedge.`;
  if (c.includes('prediction')) return `Fund $${capital} and place one market position on ${name}.`;
  if (c.includes('curator') || c.includes('allocator')) return `Deposit $${capital} into a ${name} vault on ${chain} and keep the shares.`;
  if (c.includes('stable')) return `Mint or deposit $${capital} of the stable asset through ${name} on ${chain}.`;
  if (c.includes('rwa')) return `Mint $${capital} of the protocol's yield asset on ${chain} and hold it.`;
  if (c.includes('insurance')) return `Buy $${capital} of cover from ${name} on ${chain} and keep the policy.`;
  return `Deposit $${capital} of USDC into ${name} on ${chain} and keep the position open.`;
}
export function farmSteps(p: SnapshotProtocol, age: number | null): FarmStep[] {
  const chain = chainOf(p), capital = capitalFor(p), hold = holdDaysFor(age), action = actionFor(p, capital, chain);
  return [
    { text: `Use a fresh wallet holding only the funds you plan to farm, with its seed phrase kept offline.`,
      cost: 'under $3 of gas for the first transaction', time: '5 minutes' },
    { text: action, cost: `$${capital} of capital and about $${capital >= 150 ? 8 : 4} of gas`, time: '15 minutes to set up' },
    { text: `Make one qualifying action each week, such as a deposit, a borrow, a swap or a vote.`,
      cost: 'about $2 of gas a week', time: '10 minutes a week' },
    { text: `Hold the position for at least ${hold} days so the activity is counted in more than one snapshot.`,
      cost: `the $${capital} stays in the position`, time: `${hold} days` },
    { text: `Before withdrawing, open the protocol's own points page and claim only from the link it publishes.`,
      cost: 'no fee to check, and never pay to claim', time: '10 minutes' },
    { text: `Write the wallet, the dates and every transaction in a farm log so you can repeat or unwind the position.`,
      cost: 'nothing but the log', time: '5 minutes' },
  ];
}
export function liveProtocols(s: Snapshot): LiveRow[] {
  return s.protocols
    .filter((p) => !isPreToken(p) && p.mcap_usd !== null)
    .sort((a, b) => (b.mcap_usd ?? 0) - (a.mcap_usd ?? 0))
    .slice(0, LIVE_ROWS)
    .map((p) => ({ slug: p.slug, name: p.name, category: p.category, chains: p.chains,
      tvl_usd: p.tvl_usd, mcap_usd: p.mcap_usd, change_7d: p.change_7d }));
}
export function buildRadar(s: Snapshot, m: ModelConstants = MODEL): { board: BoardRow[]; radar: RadarData } {
  const board = buildBoard(s, m);
  const live = liveProtocols(s);
  const early = board.filter((r) => !s.watchlist.includes(r.slug)).length;
  return {
    board,
    radar: { as_of: s.as_of, source: s.source, floor_usd: s.floor_usd, model: m,
      model_version: MODEL_VERSION, watchlist_size: s.watchlist.length,
      board_size: board.length, early_size: early, live_size: live.length,
      rows: board.map((r) => ({ rank: r.rank, slug: r.slug, name: r.name, category: r.category,
        chains: r.chains, tvl_usd: r.tvl_usd, change_7d: r.change_7d, mcap_usd: r.mcap_usd,
        listed_at: r.listed_at, age_days: r.age_days, implied_value_usd: r.implied_value_usd,
        growth_multiplier: r.model.growth_multiplier, maturity_multiplier: r.model.maturity_multiplier,
        chain_multiplier: r.model.chain_multiplier })),
      live },
  };
}
export function boardIssue(board: BoardRow[], s: Snapshot): string | null {
  if (board.length < 100 || board.length > 4000) return `board has ${board.length} rows, need 100..4000`;
  const ranks = board.map((r) => r.rank).sort((a, b) => a - b);
  for (let i = 0; i < ranks.length; i++) if (ranks[i] !== i + 1) return 'ranks are not exactly 1..N';
  for (let i = 1; i < board.length; i++) {
    const prev = board.find((r) => r.rank === i), cur = board.find((r) => r.rank === i + 1);
    if (prev && cur && cur.implied_value_usd > prev.implied_value_usd) return `implied value rises from rank ${i} to ${i + 1}`;
  }
  const slugs = new Set(board.map((r) => r.slug));
  if (slugs.size !== board.length) return 'duplicate slugs';
  const index = new Set(s.protocols.map((p) => p.slug));
  for (const r of board) if (!index.has(r.slug)) return `invented slug ${r.slug}`;
  for (const slug of s.watchlist) if (!slugs.has(slug)) return `watchlist slug ${slug} missing`;
  return null;
}
export function dataScript(radar: RadarData): string {
  return `window.RADAR=${JSON.stringify(radar)};\n`;
}
export function parseSnapshot(text: string): Snapshot {
  const d = JSON.parse(text);
  if (!d || !Array.isArray(d.protocols) || !Array.isArray(d.watchlist)) {
    throw new SnapshotError('snapshot must carry protocols[] and watchlist[]');
  }
  return d as Snapshot;
}
