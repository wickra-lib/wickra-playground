# Architecture

The playground is a static Vue 3 + Vite single-page app. There is no backend: it
loads a WASM build of the Wickra backtest core and runs everything in the browser.

## Data flow

```
SpecEditor ──spec-changed──▶ App.specJson ─┐
                                           ├─▶ PanelGrid ─▶ LangPanel × N ─▶ DiffView
DataSource ──candles-changed▶ App.candlesJson ┘
```

- **`App.vue`** holds the three pieces of state: `specJson`, `candlesJson`, and
  the selected `presetKey`. It is the single owner, so every child sees the same
  values.
- **`SpecEditor.vue`** edits the `StrategySpec` JSON (with presets, validation,
  localStorage persistence, and a `#spec=<base64>` permalink).
- **`DataSource.vue`** produces candles from a preset CSV, an upload, or the
  Binance API — and emits one `candlesJson` string.
- **`PanelGrid.vue`** fans the same `specJson` + `candlesJson` to one
  **`LangPanel`** per registered runner, and collects their raw report strings.
- **`DiffView.vue`** compares the raw strings byte-for-byte and shows the proof.

## Runners

A **runner** (`src/runner/*.ts`) is one language/binding path implementing:

```ts
interface Runner {
  id: string
  label: string
  lazy?: boolean               // opt-in heavy runtimes (Pyodide)
  ready(): Promise<void>
  run(candlesJson, specJson): Promise<string>  // raw report, verbatim
}
```

- `rust` / `js` / `go` all drive the same `wickra-backtest-wasm` core through
  distinct call paths (see [PANELS.md](PANELS.md)).
- `python` runs the real extension in Pyodide (see
  [CROSS_LANGUAGE.md](CROSS_LANGUAGE.md)).

The registry (`src/runner/registry.ts`) lists the active runners in display
order. Adding a language = adding one runner and one registry entry.

## Why the outputs are byte-identical

There is physically **one** serializer — the Rust core in the WASM module. Every
runner forwards the core's `run_json` response string **verbatim** (no
`JSON.parse`/`stringify` round-trip). So identical bytes are guaranteed by
construction, not by coincidence; the diff view just makes that visible. See
[the golden test](../src/golden.test.ts) for the pinned regression guard.

## Build & deploy

`npm run build` type-checks (`vue-tsc`) and emits a static `dist/`. `deploy.yml`
publishes `dist/` to Cloudflare Pages via `wrangler` when the deploy secrets are
present; otherwise it just builds (green).
