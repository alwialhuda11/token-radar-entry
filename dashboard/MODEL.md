# The value model, written for the reader

The board ranks pre-token protocols by an implied value in dollars. The number
is an estimate from the snapshot, not a market price and not a promise that a
token will launch.

## The function

```
growth   = clamp(change_7d, growth_floor, growth_cap)
growthM  = 1 + growth / 100 * growth_weight
age      = age_days when listed, else unknown_age_days
maturity = maturity_floor + min(age, maturity_days) / maturity_days * maturity_range
chainM   = 1 + min(number_of_chains, chain_cap) * chain_weight
implied  = max(1, round(tvl_usd * base_multiple * growthM * maturity * chainM))
```

Both the generator (`lib/model.ts`) and the page (`dashboard/app.js`) evaluate
this same expression. The dashboard recomputes each row from the snapshot
figures and shows the chain multiplier alongside the growth and maturity
multipliers in the detail view, so a reader can check that the page and
`board.json` agree.

## Constants used for this snapshot

| name | value | meaning |
| --- | --- | --- |
| base_multiple | 0.25 | dollars of implied value per dollar of TVL |
| growth_weight | 0.55 | weight on seven-day TVL growth |
| growth_floor | -60 | lower clamp on growth, percent |
| growth_cap | 120 | upper clamp on growth, percent |
| maturity_floor | 0.60 | multiplier for a brand-new protocol |
| maturity_range | 0.40 | extra multiplier earned over the maturity window |
| maturity_days | 1095 | three years to full maturity |
| unknown_age_days | 365 | assumed age when listing date is missing |
| chain_weight | 0.02 | bonus per chain, multiplicative |
| chain_cap | 6 | maximum chains counted |
| floor_usd | 50,000,000 | watchlist cutoff |

## What the inputs mean

- **TVL** is dollars deposited in the protocol on the snapshot date. It is the
  scale term: a larger base earns a larger implied value.
- **change_7d** is the week-on-week change in TVL. Positive growth raises the
  multiple, outflows lower it, and both are clamped so one unusual week cannot
  dominate.
- **age_days** counts from first listing. A protocol that has run for years with
  no token has had more time to build a user base, so maturity rises with age.
- **number_of_chains** counts the chains the protocol is live on. Being on
  several chains is a small, bounded advantage.

## What is deliberately absent

The protocol name, its social following, and the size of any existing token are
not inputs. Every row is scored by the same arithmetic. The 40 watchlist rows
and the wider early radar are sorted by the implied value this function
produces; protocols that already trade are shown separately with their market
cap, because their price is a fact rather than an estimate.

## Farm plan

Each row carries six steps: isolate a fresh wallet, make the category-specific
deposit, perform one qualifying action a week, hold for the stated number of
days, claim only from the protocol's own page, and keep a written log. Every
step names a dollar cost and a duration. The action depends on the protocol's
category, TVL, age and chain, never on its name.
