# Snapshot notes

The snapshot is a single read of a public protocol directory. These notes
describe how to interpret that read without adding claims the data cannot
support.

The as-of date is the day the figures were collected. Any event after that day
is absent. A launch, a hack, a migration or a large deposit that happened later
will appear only in the next snapshot.

The source lists protocols by category. Categories are useful shorthand, not
definitions. A protocol may do both lending and trading, and the source picks
one label. The farm action follows the label, so a mixed protocol may need a
different action in practice.

Chains are listed as names. A protocol may be deployed on a chain through a
canonical bridge and on another through a wrapper. The count is a breadth
signal, not an audit of deployment quality.

Total value locked is denominated in dollars at the snapshot's price feed. A
fall in TVL can mean withdrawals or a fall in the price of the deposited asset.
The two cases call for different responses, and the snapshot cannot distinguish
them.

Seven-day change is computed from two readings one week apart. A protocol with
no earlier reading has no change figure. The model treats a missing change as
zero rather than as growth or decline.

First listing is the earliest date the source shows for the protocol. It is not
the founding date, the incorporation date or the start of development. A
protocol can have existed for years before it was listed.

Market capitalisation appears only for protocols whose token already trades.
It is a market price multiplied by a circulating supply, both of which move.
It is shown for context and is never mixed with the implied value.

The watchlist floor is a TVL threshold. Protocols above it are the curated
watchlist; the wider early radar is drawn from below it. The floor is a
presentation device, not a quality judgement.

The model version names the formula in use. When the version changes, older
boards are not comparable with newer ones. Always read the version before
comparing two snapshots.

The recomputation in the detail view uses the same constants that generated
the board. If the two numbers differ, the most likely cause is a dashboard
served with stale data, not a mistake in the arithmetic.

A multiplier is not a score. Growth, maturity and chain multipliers each adjust
the same base. Reading them together explains most of the difference between
two rows.

The rank is dense: positions are consecutive with no gaps. Two rows with the
same implied value are ordered by their slug, which makes the output stable
across runs.

Filters are client-side. They never change the underlying data or the ranking;
they only decide which rows are visible. The hash preserves the filter so a
link opens the same view.

Screenshots are captures of the running page, not illustrations. Each one uses
a deterministic hash, so a reader can reproduce the exact view.

The four captures cover the board, a protocol detail with its farm plan, a
filtered board and the live-token table. They are ordered so the most
informative view appears first.

No figure on the board is financial advice. The program describes records; the
reader decides what, if anything, to do.
