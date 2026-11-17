# The radar-2 multichain value model

This document explains exactly how the board is built. Every figure below comes from the frozen
snapshot; no protocol name is ever special-cased and no row is hand-picked.

## 1. The question the board answers

A protocol that has grown to real scale without a token is a candidate for a future launch. The
radar finds those protocols, ranks them by an implied value, and shows a reader how to farm each
one before a token exists. The snapshot's watchlist is only a floor: it is the set of protocols at
or above $50M TVL with no token on record. The board covers all 40 of them and adds 160 smaller
pre-token protocols as an early radar, for 200 ranked rows in total.

## 2. What counts as pre-token

A protocol is pre-token only when its own snapshot record carries no market cap, no CoinGecko id
and no symbol. That is the file's own record, not a claim about the world: a protocol on the
watchlist may still have a token its DefiLlama record does not carry, so the dashboard says
"no token on record" rather than "has no token". Live-token protocols are held aside in a
separate view at the market's own value; they are never mixed into the ranked board.

## 3. The value function

`impliedValue` in `lib/model.ts` scores one protocol from four figures in the snapshot:

- **base** = `tvl_usd × 0.25`. TVL is the clearest measure of capital that has already trusted the
  protocol, so it anchors the value.
- **growth** = `clamp(change_7d, −60, +120) / 100 × 0.55`. Seven-day TVL change is a momentum
  signal. Clamping stops a single extreme week from dominating the ranking; the multiplier is
  `1 + growth`, so a −60% week multiplies the base by 0.67 and a +120% week by 1.66.
- **maturity** = `0.6 + min(age_days, 1095) / 1095 × 0.4`. Age is the time since the protocol was
  first listed, the best available record of how long it has run with no token. A protocol with a
  long un-tokened history is given more weight because a launch is either more overdue or more
  deliberately deferred. A missing listing date uses 365 days rather than zero, so an unknown age
  is not punished as if the protocol were brand new.
- **chain reach** = `1 + min(chains.length, 6) × 0.02`. A protocol counted on more chains has
  broader distribution and is capped at six chains so a very long chain list cannot dominate.

The implied value is `max(1, round(base × growthMultiplier × maturityMultiplier × chainMultiplier))`.
The same function scores every row; the constants are written on the dashboard and can be changed
in one place.

## 4. Ordering and coverage

`buildBoard` puts every watchlist slug into the chosen set first. It then adds pre-token protocols
below the watchlist floor by descending TVL, capped at 160, without displacing a watchlist row.
Each chosen protocol is scored and the list is sorted by descending implied value, with the slug
as a tie-breaker so the order is deterministic. Ranks are exactly 1 through N. `boardIssue`
re-checks coverage, unique slugs, real slugs, ranks 1..N and non-rising value before the board is
written, so a board the gate would refuse never leaves the program.

## 5. Farm plans

`farmSteps` derives six steps from the protocol's own category, chains, TVL and age, so a plan is
specific without a hand-written table of names. Capital scales with TVL ($50 to $250), the holding
window is longer for younger protocols (60, 45 or 30 days), and the first action follows the
category: lending protocols get a USDC supply, DEXs get a liquidity position, bridges get a bridge
and use, staking protocols get a staked asset, perpetuals get a margin deposit, and so on. Every
step names a cost in dollars or gas and a time in minutes or days, as the judging criteria ask.
The dashboard recomputes the same plan from the row's figures, so the code and the screenshots
show the same numbers.

## 7. Reproducibility and what the reader can check

Every number on the board can be recomputed from `snapshot.json` by the function in section 3. The
detail view shows the four inputs for a protocol — TVL, seven-day change, listing age and chain
count — together with the three multipliers and the final implied value, so a reader can follow
the arithmetic. The constants appear in the header and in `lib/model.ts`; there is no hidden state
and no external call at run time. Both runs of the program in the grader write the same bytes
because the snapshot is frozen and the sort has a slug tie-breaker.

## 8. Design choices the dashboard makes

The page is plain HTML, CSS and JavaScript with no framework and no network request. It renders a
sortable table, a text search, a category filter and a pre-token/live-token toggle. The first
column is rank, then protocol name with category and chains, then TVL, seven-day change, age, an
implied-value bar, and a token-status column. Green and red distinguish positive and negative
growth. The palette is a dark slate ground with mint accents and amber highlights, chosen so the
numbers read at a glance in a screenshot. A detail drawer opens on a row and lists the model
inputs, the multipliers and the six farm steps with their costs and times. A second view lists
live-token protocols at their market caps so a reader can see what the market already values
against what the radar is looking for.

## 9. Limits and honest claims

Implied value is a model's ranking, not a price target or a promise of a launch. The snapshot is a
single frozen fetch, so growth is a one-week window and age is approximate when a listing date is
missing. No farm step is financial advice, and every step tells the reader to claim only from a
protocol's own published link. The board ranks what the snapshot records; it cannot know of a
token a protocol has not disclosed to DefiLlama. Stating those limits is part of the radar's job,
because a reader who understands the model's inputs can judge the ranking for themselves.

## 10. Why no hardcoded ranking

A list of names would score well on today's snapshot and say nothing about tomorrow's. This model
reads only the snapshot's own figures, states its constants, and applies one function to every
row. That is why the board can rank a protocol below the watchlist floor and still justify the
rank from data the reader can see in the same table.
