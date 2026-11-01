import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { loadPyodide, version as pyodideVersion } from 'pyodide'
import { beforeAll, describe, expect, it } from 'vitest'
import { ensurePyodideWheel } from '../scripts/pyodide-wheel'
import { buildRunRequest, candlesToJson, parseCandlesCsv } from './lib/candles'
import { sha256 } from './lib/hash'
import { installWickraBacktest, runInPyodide, type Pyodide } from './runner/python'
import pinned from './runner/pyodide-wheel.json'
import smaCross from './presets/sma_cross.json'

/**
 * The Python panel, proven outside the browser: the pinned Pyodide runtime (the
 * npm build of the same version the page loads from jsDelivr) installs the wheel
 * the site serves from `public/wheels/`, and the real `wickra-backtest`
 * extension must return the report whose sha256 is the pinned golden -- the same
 * bytes the Rust, JS and Go runners produce in golden.test.ts. The wheel comes
 * the way `vite build` gets it: from its release, sha256-checked against the
 * manifest (scripts/pyodide-wheel.ts). A wheel that does not load, or a report
 * that differs by one byte, fails here instead of in a visitor's browser.
 */
const local = (relative: string) => fileURLToPath(new URL(relative, import.meta.url))
const read = (relative: string) => readFileSync(local(relative))

describe('golden: the Python (Pyodide) runner', () => {
  let wheel: Buffer

  beforeAll(async () => {
    wheel = readFileSync(
      await ensurePyodideWheel(local('./runner/pyodide-wheel.json'), local('../public/wheels')),
    )
  }, 120_000)

  it('serves the wheel the manifest pins', () => {
    expect(createHash('sha256').update(wheel).digest('hex')).toBe(pinned.sha256)
    expect(pyodideVersion).toBe(pinned.pyodide)
  })

  it('returns the golden report through the real extension', async () => {
    const py = (await loadPyodide()) as unknown as Pyodide & {
      FS: { writeFile(path: string, data: Uint8Array): void }
    }
    py.FS.writeFile(`/tmp/${pinned.wheel}`, new Uint8Array(wheel))
    await installWickraBacktest(py, `emfs:/tmp/${pinned.wheel}`)

    const candlesJson = candlesToJson(
      parseCandlesCsv(read('../public/data/sma_cross.csv').toString('utf8')),
    )
    const report = await runInPyodide(py, buildRunRequest(candlesJson, JSON.stringify(smaCross)))
    expect(await sha256(report)).toBe(read('./__golden__/sma_cross.sha256').toString('utf8').trim())
  }, 120_000)
})
