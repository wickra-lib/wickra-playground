// TypeScript mirror of wickra-backtest's `StrategySpec` (its serde JSON form).
// The app edits this as JSON and hands it to `run_json` verbatim; the types give
// the spec editor and the presets type-checking and autocomplete. Field names
// and enum spellings match the Rust serde representation exactly — snake_case
// tags, internally-tagged sizing/slippage, untagged operands.

export type PriceField = 'open' | 'high' | 'low' | 'close' | 'volume' | 'hlc3' | 'ohlc4'

export type Feed = 'kline' | 'trade' | 'orderbook'

/**
 * A value node (untagged): an indicator reference (`"name"` or `"name.field"`
 * for a multi-output indicator), a literal number, or a compound expression.
 */
export type Operand = string | number | OperandExpr

export type OperandExpr =
  | { price: PriceField }
  | { prev: [Operand, number] }
  | { add: [Operand, Operand] }
  | { sub: [Operand, Operand] }
  | { mul: [Operand, Operand] }
  | { div: [Operand, Operand] }

/** An integer comparison predicate (externally tagged). */
export type IntPredicate =
  | { gt: number }
  | { lt: number }
  | { ge: number }
  | { le: number }
  | { eq: number }

/** A boolean node (externally tagged, snake_case). */
export type Condition =
  | { gt: [Operand, Operand] }
  | { lt: [Operand, Operand] }
  | { ge: [Operand, Operand] }
  | { le: [Operand, Operand] }
  | { eq: [Operand, Operand] }
  | { ne: [Operand, Operand] }
  | { cross_above: [Operand, Operand] }
  | { cross_below: [Operand, Operand] }
  | { between: [Operand, Operand, Operand] }
  | { rising: [Operand, number] }
  | { falling: [Operand, number] }
  | { all: Condition[] }
  | { any: Condition[] }
  | { not: Condition }
  | { in_position: boolean }
  | { bars_since_entry: IntPredicate }

/** One indicator instance: a wickra-core type name plus its parameters. */
export interface IndicatorSpec {
  /** The wickra-core indicator type name (e.g. `"Ema"`). */
  type: string
  params?: number[]
  feed?: Feed
}

/** Position sizing model (internally tagged on `type`). */
export type Sizing =
  | { type: 'fixed_fraction'; fraction: number }
  | { type: 'fixed_qty'; qty: number }
  | { type: 'fixed_cash'; cash: number }
  | { type: 'vol_target'; target_vol: number; lookback: number }
  | { type: 'risk_per_trade'; risk_pct: number }

/** Slippage model (internally tagged on `type`). */
export type Slippage =
  | { type: 'fixed_bps'; bps: number }
  | { type: 'spread' }
  | { type: 'volume_impact'; coef: number }

export interface Costs {
  maker_bps?: number
  taker_bps?: number
  slippage?: Slippage
  funding?: boolean
}

export interface Risk {
  stop_loss_pct?: number
  take_profit_pct?: number
  trailing_stop_pct?: number
  max_leverage?: number
  max_position_pct?: number
  liquidation?: boolean
}

export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit'

export type FillTiming = 'next_open' | 'close'

export interface Execution {
  order_type?: OrderType
  fill_timing?: FillTiming
  limit_offset_pct?: number
  stop_offset_pct?: number
  latency_bars?: number
  partial_fills?: boolean
  max_participation?: number
}

/** A complete strategy specification — the input the playground runs. */
export interface StrategySpec {
  spec_version?: number
  symbol: string
  ref_symbol?: string
  timeframe: string
  indicators: Record<string, IndicatorSpec>
  entry: Condition
  exit: Condition
  short_entry?: Condition
  short_exit?: Condition
  sizing: Sizing
  costs?: Costs
  risk?: Risk
  execution?: Execution
  warmup?: number
}
