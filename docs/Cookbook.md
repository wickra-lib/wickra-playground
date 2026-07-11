# Cookbook

Short recipes for the playground. See [SPEC.md](SPEC.md) for the full
`StrategySpec` reference.

## Prove byte-identity for your own strategy

1. Pick a preset close to your idea, or start from scratch in the editor.
2. Edit the `indicators`, `entry`, and `exit` — the panels re-run on every valid
   edit.
3. Watch the **Proof** panel: `✓ byte-identical across N panels — 0 differences`
   plus a single `proof sha256`. That hash is your strategy's cross-language
   fingerprint.

## Share a run

Every edit writes the spec into the URL as `#spec=<base64>`. Copy the address
bar to share a reproducible, forkable run — the recipient loads the exact spec.
Use **Copy proof** to put the spec, the data sha256, and the report sha256 on the
clipboard as a self-contained proof block.

## Run against live Binance data

1. In the data source, choose **Binance**.
2. Enter a symbol (`BTCUSDT`), interval (`1h`), and limit (up to 1000).
3. **Fetch**. All panels receive the same fetched candles. If Binance is blocked
   or unreachable, the mirror is tried, then the last-loaded dataset is kept — so
   the panels always share one source.

## Use your own CSV

Provide a `ts,open,high,low,close,volume` CSV via the **Upload** source. `ts` is
epoch seconds; it maps to each candle's `time`. Header rows and blank lines are
tolerated.

## Add a Keltner-style breakout

```json
{
  "indicators": {
    "mid": { "type": "Sma", "params": [20] },
    "atr": { "type": "Atr", "params": [14] }
  },
  "entry": { "gt": [{ "price": "close" }, { "add": ["mid", { "mul": [2.0, "atr"] }] }] },
  "exit":  { "lt": [{ "price": "close" }, "mid"] }
}
```

## Enable the Python panel

The Python panel is opt-in (Pyodide is ~30 MB). Click **Enable Python
(Pyodide)** on that panel; it loads the runtime and the `wickra-backtest` wheel,
then computes the same report as the other panels — real CPython, byte-identical.
See [CROSS_LANGUAGE.md](CROSS_LANGUAGE.md).
