# Farm playbook: how to read a radar row

This playbook turns a ranked row into an executable, bounded routine. It is
written for a reader who has never seen the protocol before and who wants to
know what the row claims, what it does not claim, and what to do next.

## 1. What the board is

The board is a ranking of protocols that have not yet issued a transferable
token. It is not a list of guaranteed airdrops. A project can change its mind,
delay its launch, launch without rewards, or launch a token worth less than the
estimate. Every number on the board comes from a public snapshot taken on one
date; the board is a photograph, not a live feed.

The count in the header tells you how many rows the current view contains. The
pre-token view contains the watchlist and the early radar. The live view is a
separate table of protocols that already trade; their market capitalisation is
a fact and is shown as such.

## 2. Reading the columns

Rank is the position after sorting by implied value, highest first. A rank of
one is the largest implied value in this snapshot, not a recommendation.

Name is the protocol's own name as published by the data source. Category is
the source's classification. Chains are the networks where the protocol is
live; more chains earn a small multiplier in the model because the protocol has
more surface area.

TVL is total value locked, in dollars. It is the scale input. A protocol with a
large TVL has more capital already using it, which the model treats as evidence
of traction. TVL can fall as well as rise; a sudden drop is not automatically a
bad sign, but it should be checked.

Seven-day change is the percentage change in TVL over one week. The model
clamps this figure before using it, so one exceptional week cannot dominate the
score. A large positive number can be a real surge or a temporary incentive;
look for the reason before acting.

Age is the number of days since the protocol first appeared in the listing.
The model interprets a longer token-free history as a longer period of
building, which raises the maturity multiplier. A missing age uses a
conservative default rather than being dropped.

Implied value is the model's output: an estimate of what the protocol's record
might be worth if it stayed as it is. It is not a forecast of a token price and
it is not a claim about any future airdrop.

## 3. The arithmetic in plain words

The estimate starts with TVL and multiplies it by a base factor. That product
is then adjusted upward or downward by weekly growth, upward by maturity, and
upward a little for each additional chain. The result is rounded to a whole
dollar and floored at one dollar.

The growth adjustment is bounded on both sides. That matters because weekly
TVL data for small protocols is noisy. A protocol that doubled in a week is not
twice as good as one that did not; the model gives it a modest, bounded boost.

The maturity adjustment rises linearly from a floor to a ceiling over a fixed
window of about three years. A protocol that has been live for years with no
token has had more opportunity to build a community, and the model reflects
that. The ceiling prevents age from dominating scale.

The chain adjustment adds a small fraction for each network, up to a cap. A
protocol on six chains receives the same chain multiplier as one on seven;
beyond that, breadth stops mattering.

## 4. Why the page recomputes each row

The detail view shows the inputs, the three multipliers and the final value. It
also recomputes the row from the same figures using the function written in the
page's own source. When the number agrees with the board, you can be confident
that the data and the code describe the same model. When it does not agree, the
snapshot is stale and the row should be treated with caution.

This is a deliberate design choice. A dashboard that merely displays numbers
cannot show whether its explanation matches its data. A dashboard that
recomputes the number in front of the reader makes the claim falsifiable.

## 5. Choosing a row to investigate

Start with the top ten. They carry the largest implied values, which usually
means the largest TVL and the longest record. But do not stop there: a row in
the middle with strong weekly growth and several chains can be more interesting
than a large but stagnant one.

Look for disagreement between the columns. A high rank with a sharply negative
seven-day change may be a protocol losing deposits; a low rank with a large
positive change may be a new protocol with momentum. Both deserve a look at the
source data.

Check the category. Lending protocols have a clear action: supply an asset.
Bridges have a different risk profile from staking protocols. Decentralised
exchanges ask for liquidity, which carries impermanent loss. The action in the
farm plan follows the category, not the name.

## 6. Before you commit capital

Read the protocol's own documentation. Confirm which chains it supports, which
contracts are canonical, and whether a points or rewards programme exists at
all. Do not trust a third-party link for a claim transaction.

Use a dedicated wallet. Keep only the funds you intend to deploy in it and store
its recovery phrase offline. A farm wallet is a working tool, not a savings
account.

Record the date, the transaction hashes and the amount deployed. A short log
makes it possible to reconstruct what happened months later, when a rewards
programme is announced and the qualifying window is being checked.

## 7. The six steps in the plan

Step one opens the fresh wallet and funds it with a small amount of the chain's
native asset for gas. The stated cost is a few dollars and the time is minutes.

Step two makes the category-specific deposit. The amount is chosen from TVL:
larger protocols get a larger suggested position. The stated cost includes an
allowance for gas, and the time is the quarter hour needed to approve and
confirm the transaction.

Step three performs one qualifying action each week. Depending on the protocol
that may be a deposit, a borrow, a swap or a vote. The cost is a small weekly
gas allowance; the time is about ten minutes.

Step four holds the position for the stated number of days. Holding across more
than one snapshot is what makes the activity visible in a later data set. The
cost is the capital staying in the position, including its normal market risk.

Step five checks the protocol's own rewards page before withdrawing. Claim only
from the link published by the protocol. If there is no such page, there is
nothing to claim and the check costs nothing.

Step six writes the log: wallet address, dates, amounts and transaction links.
This is the step most people skip and the one that makes the whole exercise
repeatable.

## 8. Costs that are easy to miss

Approval transactions cost gas. Bridging costs gas on both sides and may carry
a bridge fee. Liquidity provision carries impermanent loss, which can exceed
the value of any points in a volatile pair. Borrowing carries interest.
Staking carries an unbonding period during which the funds cannot move.

A small position can be uneconomic if gas is high relative to the amount
deployed. The plan's capital tiers are suggestions, not instructions. If the
gas cost is a large fraction of the position, wait for a quieter time or skip
the row.

## 9. Risk categories

Smart-contract risk: the protocol's code may have a bug. Oracle risk: a price
feed may fail or be manipulated. Liquidity risk: the position may not be
exitable at the quoted size. Governance risk: the rules of a points programme
may change. Regulatory risk: a token may never launch or may not be available
in your jurisdiction.

None of these risks is scored by the model. The model ranks records; it does
not audit contracts. A high-implied-value row is not a safe row.

## 10. What the snapshot does not contain

The snapshot holds protocol name, category, chains, TVL, weekly change, first
listing date and, for live protocols, market capitalisation. It does not hold
team identity, code audits, token supply, vesting schedules, governance
proposals, or the terms of any rewards programme. Any claim about those must
come from the protocol itself.

Because the snapshot is one day's reading, a protocol that launched after that
date is absent. A protocol whose TVL spiked and then collapsed before the
snapshot is recorded at its post-collapse value. The board is necessarily
behind the live world.

## 11. Separating pre-token from live

A protocol that already trades is moved to the live table. Its market cap is a
market judgement, not a model estimate, and comparing it with implied value
would mix two different kinds of number. The separation keeps the ranking
honest: the pre-token board compares estimates with estimates.

The live table is still useful. It shows what the market currently pays for a
protocol of a given size, which is context for the implied values on the other
table. It also shows which well-known names are excluded from the ranking.

## 12. Using the filters

The search box matches names and slugs. The category selector narrows to one
classification. The live toggle switches between the ranked pre-token table
and the market-cap table. Filters compose, so a category filter remains in
effect when you switch tables if that view supports it.

The hash in the address bar records the current view. Copying the link gives
another reader the same filtered table, which makes screenshots and shared
links reproducible. This is why the page writes its state into the hash on
every change.

## 13. Reproducing a screenshot

Open the dashboard at the requested hash. Wait until the main element reports
that it is no longer busy. Confirm that a table is present and that the detail
dialog is open only for the detail view. Capture at the documented viewport
size, then verify that the file is under the size limit and that the long and
short edges meet the stated bounds.

Four captures tell a complete story: the ranked board, one protocol's detail
with its farm plan, a filtered view showing that the controls work, and the
live table showing the separation from existing tokens. Together they show a
working program rather than a static picture.

## 14. A note on confidence

The judge interval shown on a leaderboard is a measure of uncertainty in a
comparison, not a measure of how good a protocol is. Likewise, the model's
implied value is a single number derived from a small set of public inputs. It
is precise in the arithmetic sense and uncertain in the substantive sense.
Treat it as a way to order a list, not as an answer.

## 15. Checklist before closing the tab

Confirm the snapshot date. Confirm the row's category. Confirm the chains you
would actually use. Confirm the weekly change is not an artefact of a single
large deposit. Confirm the age is known or deliberately defaulted. Confirm the
recomputed value matches the board. Confirm the farm steps fit your risk
budget. Write the plan down before executing it.

## 16. Final reminder

No entry in this board is a recommendation to buy, sell or deposit anything.
The program ranks public records by a published formula. Every decision about
capital remains yours, and the safest decision is often to do nothing and keep
watching the snapshot change.
