import { readFileSync } from 'node:fs'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { candlesToJson, parseCandlesCsv } from './lib/candles'
import { sha256 } from './lib/hash'
import { runners } from './runner/registry'
import smaCross from './presets/sma_cross.json'

/**
 * The determinism core: the `sma_cross` preset over its fixed dataset must
 * produce a byte-identical report from every automatic runner, and that report's
 * sha256 must equal the pinned golden. Byte-identity across bindings is the
 * central claim of the whole playground; the pinned hash is the regression guard.
 *
 * Lazy runners (Python/Pyodide) are skipped here — they need a browser-scale
 * runtime this node harness does not host; their equivalence is proven live in
 * the DiffView. The golden hash is blessed on the first green run (write it to
 * `src/__golden__/sma_cross.sha256`) once `wickra-backtest-wasm` is published;
 * until then the WASM-backed runners cannot load and this test is expected to be
 * red — by design, not stubbed green.
 */
const GOLDEN_FILE = fileURLToPath(new URL('./__golden__/sma_cross.sha256', import.meta.url))

function loadCandlesJson(): string {
  const csv = readFileSync(
    fileURLToPath(new URL('../public/data/sma_cross.csv', import.meta.url)),
    'utf8',
  )
  return candlesToJson(parseCandlesCsv(csv))
}

describe('golden: sma_cross byte-identity', () => {
  const candlesJson = loadCandlesJson()
  const specJson = JSON.stringify(smaCross)
  const automatic = runners.filter((r) => !r.lazy)

  it('every automatic runner returns the byte-identical report', async () => {
    const outputs = await Promise.all(automatic.map((r) => r.run(candlesJson, specJson)))
    for (const output of outputs) {
      expect(output).toBe(outputs[0])
    }
  })

  it('the shared report matches the pinned golden sha256', async () => {
    const output = await automatic[0].run(candlesJson, specJson)
    const digest = await sha256(output)
    expect(
      existsSync(GOLDEN_FILE),
      'golden sha256 not blessed yet — run once green and commit src/__golden__/sma_cross.sha256',
    ).toBe(true)
    expect(digest).toBe(readFileSync(GOLDEN_FILE, 'utf8').trim())
  })
})
