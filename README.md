<p align="center">
  <a href="https://wickra.org"><img src="https://raw.githubusercontent.com/wickra-lib/.github/main/profile/wickra-banner.webp?v=514" alt="Wickra Playground — one strategy spec, run byte-identical in Rust, JS, Go and Python, live in your browser" width="100%"></a>
</p>

[![Built on Wickra](https://img.shields.io/badge/built%20on-wickra-3b82f6)](https://github.com/wickra-lib/wickra)
[![CI](https://raw.githubusercontent.com/wickra-lib/.github/main/profile/badges/wickra-playground/ci.svg)](https://github.com/wickra-lib/wickra-playground/actions/workflows/ci.yml)
[![CodeQL](https://raw.githubusercontent.com/wickra-lib/.github/main/profile/badges/wickra-playground/codeql.svg)](https://github.com/wickra-lib/wickra-playground/actions/workflows/codeql.yml)
[![Built with Vue 3 + Vite](https://img.shields.io/badge/built%20with-Vue%203%20%2B%20Vite-42b883?logo=vue.js&logoColor=white)](https://vite.dev)
[![Zero backend](https://img.shields.io/badge/backend-zero-22c55e)](#how-it-works)
[![Byte-identical across 4 languages](https://img.shields.io/badge/byte--identical-4%20languages-8b5cf6)](#determinism-is-the-product)
[![License: MIT OR Apache-2.0](https://raw.githubusercontent.com/wickra-lib/.github/main/profile/badges/wickra-playground/license.svg)](#license)
[![Docs](https://raw.githubusercontent.com/wickra-lib/.github/main/profile/badges/wickra-playground/docs.svg)](https://wickra.org)

---

# Wickra Playground

**Run one strategy spec live, side by side, byte-identical in Rust · JS · Go ·
Python — 100% in your browser, zero backend.**

> **Part of the [Wickra ecosystem](https://github.com/wickra-lib).** A web app
> built on the same deterministic backtest engine
> ([wickra-backtest](https://github.com/wickra-lib/wickra-backtest)) that powers
> the rest of the stack.

Every other TA/backtest library *claims* cross-language consistency. The
playground **proves it, live**: you write one `StrategySpec`, and the app runs it
through the same Rust core compiled along four independent paths — Rust→WASM,
JS-over-WASM, Go-over-WASM, and Python-over-Pyodide — then shows the four
`BacktestReport`s in a diff view. When they are byte-identical, the diff reads
**0 differences**. Any drift in any panel is a bug you can see.

It is a static site: no server, no API key, nothing to host but files. The market
data is fetched client-side (a Binance public stream or a bundled CSV), and every
computation happens in your browser.

## How it works

1. You edit a `StrategySpec` (indicators, entry/exit rules, sizing, costs) and
   pick a candle dataset.
2. The app hands the **same** spec and the **same** candles to each language
   panel.
3. Each panel runs the core's `run_json(candles, spec)` over its own binding path
   and returns the canonical report JSON **verbatim**.
4. The diff view hashes and compares the reports. Identical bytes → "0
   differences"; the cross-language claim, proven in front of you.

## Determinism is the product

The whole point is byte-identity. The core is deterministic (no RNG, no
per-language float reformatting), every binding forwards the core's `run_json`
string unchanged, and the diff view compares the raw bytes — so a green run is a
live proof, not a marketing line.

## Quickstart

```bash
npm install
npm run dev      # local dev server
npm run build    # static build into dist/
npm run test     # the determinism + diff unit tests
```

> **Note:** the app depends on `wickra-backtest-wasm`, which is not yet on npm
> (its release is gated). Until it publishes, `npm install` cannot resolve the
> lockfile.

## Project layout

```
src/
  main.ts              app entry
  App.vue              the shell: spec editor + data source + panel grid + diff
  spec/schema.ts       the StrategySpec type + presets
  runner/              one runner per language path (rust, js, go, python) + registry
  lib/                 wasm loader, candle loader, Binance client, hash, diff
  components/          SpecEditor, DataSource, LangPanel, PanelGrid, DiffView, AboutCore
public/data/           bundled deterministic candle CSVs
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Report vulnerabilities per [SECURITY.md](SECURITY.md).

## License

Dual-licensed under either [MIT](LICENSE-MIT) or [Apache-2.0](LICENSE-APACHE), at
your option.

## Disclaimer

`wickra-playground` is research and engineering tooling, not financial advice. A
byte-identical report attests only that the four language paths compute the same
deterministic result from the same spec and data — it makes no claim about the
quality, profitability or future performance of any strategy. Trading carries
risk; you are responsible for your own decisions. Everything runs in your own
browser: no hosted service, no data collection, no warranty.
