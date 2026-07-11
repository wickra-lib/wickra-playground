# StrategySpec

A `StrategySpec` is a single JSON object describing a complete strategy:
indicators, entry/exit logic, sizing, costs, risk, and execution. The playground
edits it as JSON and hands it to the core's `run_json` verbatim. The canonical,
type-checked mirror lives in [`src/spec/schema.ts`](../src/spec/schema.ts); this
page is the human reference. Field names and enum spellings match the
wickra-backtest serde representation exactly (snake_case tags).

## Top-level fields

| Field | Required | Type | Meaning |
|-------|----------|------|---------|
| `symbol` | yes | string | Traded symbol. |
| `timeframe` | yes | string | Bar timeframe (e.g. `"1h"`). |
| `indicators` | yes | map<string, IndicatorSpec> | Named indicator instances. |
| `entry` | yes | Condition | Long-entry boolean. |
| `exit` | yes | Condition | Long-exit boolean. |
| `sizing` | yes | Sizing | Position sizing model. |
| `spec_version` | no | number | Spec schema version. |
| `ref_symbol` | no | string | Reference symbol (pairwise indicators). |
| `short_entry` / `short_exit` | no | Condition | Short-side logic. |
| `costs` | no | Costs | Fees + slippage + funding. |
| `risk` | no | Risk | Stops, leverage, position caps. |
| `execution` | no | Execution | Order type, fill timing, latency. |
| `warmup` | no | number | Explicit warmup bars. |

## IndicatorSpec

```json
{ "type": "Sma", "params": [10], "feed": "kline" }
```

- `type` — the wickra-core indicator type name, PascalCase (`Sma`, `Ema`, `Rsi`,
  `Atr`, `Macd`, …).
- `params` — the indicator's numeric parameters, in order.
- `feed` — optional data feed: `kline` | `trade` | `orderbook`.

Reference an indicator in a condition by its map key; for a multi-output
indicator use `"name.field"`.

## Operands

An operand is untagged — a string (indicator ref), a number (literal), or a
compound expression:

```json
{ "price": "close" }
{ "prev": ["fast", 1] }
{ "add": ["mid", { "mul": [2.0, "atr"] }] }
```

Expressions: `price`, `prev`, `add`, `sub`, `mul`, `div`.

## Conditions

Externally tagged booleans:

- Comparisons: `gt`, `lt`, `ge`, `le`, `eq`, `ne` — each `[Operand, Operand]`.
- Crosses: `cross_above`, `cross_below` — `[Operand, Operand]`.
- Ranges/trends: `between` `[a, lo, hi]`, `rising` `[op, n]`, `falling` `[op, n]`.
- Combinators: `all` `[...]`, `any` `[...]`, `not` `{...}`.
- State: `in_position` `bool`, `bars_since_entry` `{ gt: n }`.

```json
{ "all": [
  { "cross_above": ["fast", "slow"] },
  { "gt": [{ "price": "close" }, 100] }
] }
```

## Sizing, Costs, Risk, Execution

- **Sizing** (internally tagged on `type`): `fixed_fraction`, `fixed_qty`,
  `fixed_cash`, `vol_target`, `risk_per_trade`.
- **Costs**: `maker_bps`, `taker_bps`, `slippage` (`fixed_bps` | `spread` |
  `volume_impact`), `funding`.
- **Risk**: `stop_loss_pct`, `take_profit_pct`, `trailing_stop_pct`,
  `max_leverage`, `max_position_pct`, `liquidation`.
- **Execution**: `order_type` (`market`|`limit`|`stop`|`stop_limit`),
  `fill_timing` (`next_open`|`close`), offsets, `latency_bars`, `partial_fills`,
  `max_participation`.

See the bundled presets in [`src/presets/`](../src/presets/) for complete,
runnable examples.
