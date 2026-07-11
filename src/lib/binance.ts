import type { Candle } from './candles'

// Binance public market-data client. This is the direct REST path — enough to
// pull a recent window of candles for a symbol. The full P-PG-7 version adds a
// CORS-proxy fallback (for browsers/origins Binance blocks) and live WebSocket
// streaming; nothing here needs an API key.

const REST_BASE = 'https://api.binance.com'

/**
 * Fetch up to `limit` recent klines for `symbol` at `interval` (e.g. `"1h"`) and
 * map them to candles. `time` is the bar open time in seconds, matching the CSV
 * datasets. Throws on a non-OK response (the caller surfaces the error; the CORS
 * fallback lands in a later phase).
 */
export async function fetchKlines(
  symbol: string,
  interval: string,
  limit = 500,
): Promise<Candle[]> {
  const url =
    `${REST_BASE}/api/v3/klines` +
    `?symbol=${encodeURIComponent(symbol.toUpperCase())}` +
    `&interval=${encodeURIComponent(interval)}` +
    `&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Binance klines request failed: ${res.status} ${res.statusText}`)
  }
  // A kline is [openTime, open, high, low, close, volume, closeTime, ...].
  const raw = (await res.json()) as unknown[][]
  return raw.map((k) => ({
    time: Math.floor(Number(k[0]) / 1000),
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5]),
  }))
}
