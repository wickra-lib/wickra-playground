import type { StrategySpec } from '../spec/schema'

/**
 * One OHLCV bar in the shape wickra-backtest's `run_json` expects. `time` is the
 * bar open time (epoch seconds by convention); the CSV datasets carry it in a
 * `ts` column.
 */
export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/** The starting capital every backtest runs with, fixed so runs are comparable. */
export const DEFAULT_CAPITAL = 10_000

/**
 * Parse a `ts,open,high,low,close,volume` CSV into candles. The CSV `ts` column
 * becomes the candle's `time` field. Blank lines are skipped and a header row
 * (a first cell that is not a number) is tolerated.
 */
export function parseCandlesCsv(csv: string): Candle[] {
  const candles: Candle[] = []
  for (const line of csv.split(/\r?\n/)) {
    const row = line.trim()
    if (!row) continue
    const cells = row.split(',')
    if (cells.length < 6) continue
    const time = Number(cells[0])
    if (!Number.isFinite(time)) continue // header or malformed row
    candles.push({
      time,
      open: Number(cells[1]),
      high: Number(cells[2]),
      low: Number(cells[3]),
      close: Number(cells[4]),
      volume: Number(cells[5]),
    })
  }
  return candles
}

/** Serialize candles to the JSON array a `RunRequest` carries. */
export function candlesToJson(candles: Candle[]): string {
  return JSON.stringify(candles)
}

/**
 * Build the `RunRequest` JSON (`{ spec, candles, capital }`) that
 * `wickra-backtest-wasm.run_json` consumes. Every runner is handed the same
 * request string, so the only variable is the binding path — which is the whole
 * point of the byte-identity proof.
 */
export function buildRunRequest(
  candlesJson: string,
  specJson: string,
  capital: number = DEFAULT_CAPITAL,
): string {
  const spec = JSON.parse(specJson) as StrategySpec
  const candles = JSON.parse(candlesJson) as Candle[]
  return JSON.stringify({ spec, candles, capital })
}
