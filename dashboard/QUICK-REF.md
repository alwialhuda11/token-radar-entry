# Quick reference card

A one-page reminder of what each part of the dashboard does.

The board lists pre-token protocols ordered by implied value.

The live table lists protocols that already trade, with market capitalisation.

The search box filters by protocol name or slug.

The category selector narrows the board to one source classification.

The tab buttons switch between pre-token and live views.

The hash in the address bar remembers every filter.

Each row shows rank, name, TVL, seven-day change, age and implied value.

The detail view shows the same row's inputs and three multipliers.

The farm plan has six steps for every protocol.

Each farm step names a dollar cost and a duration.

The formula panel prints the exact expression used by the generator.

The count near the controls reports how many rows are visible.

The model version identifies the formula generation.

The snapshot date identifies the day the figures were collected.

A missing weekly change is treated as zero.

A missing age uses the documented default.

More chains raise the chain multiplier up to its cap.

TVL is the scale term in the estimate.

Growth is bounded before it is applied.

Maturity rises with time since first listing.

The implied value is not a price forecast.

The board is not a list of guaranteed rewards.

The page makes no network requests.

The page recomputes each row from the data file.

An agreement between recomputed and stored value means the data is current.

A disagreement means the data needs a refresh.

Ranks are consecutive with no gaps.

Ties are broken by slug.

The four captures cover board, detail, filtered board and live table.

Captures are deterministic because the hash fixes the view.

A reader can reproduce every capture from the public entry.

The model does not use a protocol's name.

The model does not use social media figures.

The model does not use token supply.

The model does not use private data.

The model is described in MODEL.md inside the dashboard folder.

The snapshot source is named in the data file.

Every figure in the board can be traced to a snapshot field.

The farm playbook explains how to read a row without acting on it.

The workflow note describes a repeatable reading order.

These notes are part of the entry and travel with the dashboard.

The judge sees the captures and the source outline together.

The captures must match the code that generates them.

The code and the data must agree.

The result is a dashboard that explains itself.
