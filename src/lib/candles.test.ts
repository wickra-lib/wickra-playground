import { describe, expect, it } from 'vitest'
import {
  buildRunRequest,
  candlesToJson,
  DEFAULT_CAPITAL,
  parseCandlesCsv,
  type Candle,
} from './candles'

describe('parseCandlesCsv', () => {
  it('parses a header row and OHLCV bars, mapping ts -> time', () => {
    const csv = 'ts,open,high,low,close,volume\n100,1,2,0.5,1.5,10\n160,1.5,2.5,1,2,20\n'
    const candles = parseCandlesCsv(csv)
    expect(candles).toEqual<Candle[]>([
      { time: 100, open: 1, high: 2, low: 0.5, close: 1.5, volume: 10 },
      { time: 160, open: 1.5, high: 2.5, low: 1, close: 2, volume: 20 },
    ])
  })

  it('skips blank lines and tolerates CRLF', () => {
    const csv = 'ts,open,high,low,close,volume\r\n100,1,2,0.5,1.5,10\r\n\r\n'
    expect(parseCandlesCsv(csv)).toHaveLength(1)
  })

  it('drops rows with too few cells', () => {
    const csv = 'ts,open,high,low,close,volume\n100,1,2,0.5\n'
    expect(parseCandlesCsv(csv)).toHaveLength(0)
  })

  it('round-trips through candlesToJson', () => {
    const csv = 'ts,open,high,low,close,volume\n100,1,2,0.5,1.5,10\n'
    const candles = parseCandlesCsv(csv)
    expect(JSON.parse(candlesToJson(candles))).toEqual(candles)
  })
})

describe('buildRunRequest', () => {
  it('bundles spec, candles, and the default capital', () => {
    const candlesJson = candlesToJson([
      { time: 100, open: 1, high: 2, low: 0.5, close: 1.5, volume: 10 },
    ])
    const specJson = '{"indicators":{},"entries":[],"exits":[]}'
    const request = JSON.parse(buildRunRequest(candlesJson, specJson))
    expect(request.capital).toBe(DEFAULT_CAPITAL)
    expect(request.candles).toHaveLength(1)
    expect(request.spec).toEqual(JSON.parse(specJson))
  })

  it('honours an explicit capital', () => {
    const request = JSON.parse(buildRunRequest('[]', '{}', 5000))
    expect(request.capital).toBe(5000)
  })
})
