import type { Candle } from './candles'

// Binance public market-data client. Both endpoints send permissive CORS headers
// and need no API key: `api.binance.com` is the primary, `data-api.binance.vision`
// is the official keyless market-data mirror used as a CORS/availability fallback.
// If both fail, `fetchKlines` throws and the caller keeps the last-loaded preset
// dataset — so the "100% static, zero backend" story always holds.

const REST_BASES = ['https://api.binance.com', 'https://data-api.binance.vision']

/** A raw Binance kline is `[openTime, open, high, low, close, volume, closeTime, ...]`. */
function klineToCandle(k: unknown[]): Candle {
  return {
    time: Math.floor(Number(k[0]) / 1000),
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5]),
  }
}

/**
 * Fetch up to `limit` recent klines for `symbol` at `interval` (e.g. `"1h"`) and
 * map them to candles. `time` is the bar open time in seconds, matching the CSV
 * datasets. Tries each REST base in turn; throws only if every endpoint fails.
 */
export async function fetchKlines(
  symbol: string,
  interval: string,
  limit = 500,
): Promise<Candle[]> {
  const query =
    `?symbol=${encodeURIComponent(symbol.toUpperCase())}` +
    `&interval=${encodeURIComponent(interval)}` +
    `&limit=${limit}`

  let lastError: unknown
  for (const base of REST_BASES) {
    try {
      const res = await fetch(`${base}/api/v3/klines${query}`)
      if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText}`)
      }
      const raw = (await res.json()) as unknown[][]
      return raw.map(klineToCandle)
    } catch (e) {
      lastError = e
    }
  }
  const detail = lastError instanceof Error ? lastError.message : String(lastError)
  throw new Error(`Binance klines request failed on all endpoints: ${detail}`)
}
