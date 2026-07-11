# Contributing

Thanks for your interest in `wickra-playground`. This project values one thing
above all: **byte-identity**. Every change must preserve the guarantee that one
`StrategySpec` over one candle dataset yields a bit-identical `BacktestReport` in
every language panel — the diff view must read "0 differences".

## Workflow

1. Branch from `main` (`feat/...`, `fix/...`, `docs/...`).
2. Make one logical change per commit; keep PRs focused (~5 units max).
3. Sign your commits and add a DCO `Signed-off-by` trailer (see [DCO](DCO)).
4. Open a PR against `main`, let CI go green, then squash-merge.

No AI/co-authored attribution, no emoji, and English for all public artifacts.

## Verify before pushing

```bash
npm install
npm run lint      # eslint + prettier --check
npm run build     # vue-tsc -b (typecheck) + vite build (bundle)
npm run test      # vitest — the determinism + diff unit tests
```

## Determinism rules (non-negotiable)

- Every runner returns the core's `run_json` / `command_json` response string
  **verbatim** — no per-language `JSON.parse`/`JSON.stringify` round-trip, no
  float reformatting, no key reordering.
- All language panels are fed the **same** spec bytes and the **same** candle
  bytes; the "same-candles guarantee" is a tested invariant.
- The diff view compares raw response bytes (and their hash). A non-zero diff is
  a bug, not a display quirk — fix the drift, do not paper over it.
- No randomness, no time-of-day, no network-order dependence in anything that
  reaches a report.
