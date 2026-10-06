import { buildRunRequest } from '../lib/candles'
import pinned from './pyodide-wheel.json'
import type { Runner } from './types'

/**
 * Real Python execution via [Pyodide](https://pyodide.org/): the CPython runtime
 * compiled to WebAssembly, running the actual `wickra-backtest` extension in the
 * browser. Its `run_json(request)` delegates to the same `core_run_json` the Rust
 * and WASM panels use, so the report is byte-identical — this is the panel that
 * upgrades the proof from "same core, different bindings" to "genuinely a
 * different language runtime".
 *
 * Pinned artifacts live in `pyodide-wheel.json` (also documented in
 * docs/CROSS_LANGUAGE.md):
 *  - Pyodide runtime: from jsDelivr, at the pinned version.
 *  - wickra-backtest wheel: the Pyodide (`pyemscripten`) wheel built from the
 *    released sdist by `.github/workflows/pyodide-wheel.yml` and served from
 *    this site's own `/wheels/` — same origin, so no CORS and no third-party
 *    host in the Content-Security-Policy.
 */
export const PYODIDE_VERSION = pinned.pyodide
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`
export const WICKRA_BACKTEST_WHEEL = pinned.wheel

/** The slice of the Pyodide API the runner uses (browser and Node alike). */
export interface Pyodide {
  loadPackage(names: string | string[]): Promise<unknown>
  runPythonAsync(code: string): Promise<unknown>
  globals: { get(name: string): unknown; set(name: string, value: unknown): void }
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<Pyodide>
  }
}

/** Install the pinned wheel from `url` (an http(s) or `emfs:` URL) with micropip. */
export async function installWickraBacktest(py: Pyodide, url: string): Promise<void> {
  await py.loadPackage('micropip')
  await py.runPythonAsync(`import micropip\nawait micropip.install(${JSON.stringify(url)})`)
}

/**
 * Run one request through the extension. The compiled `_wickra_backtest.run_json`
 * returns the report JSON string verbatim (same `core_run_json` as the Rust/WASM
 * panels). The package's public `wickra_backtest.run_json` wraps it in
 * `json.loads` for Python callers, and serializing that dict again would not
 * reproduce the core's bytes — so the panel calls the extension directly.
 */
export async function runInPyodide(py: Pyodide, request: string): Promise<string> {
  py.globals.set('_wickra_request', request)
  const result = await py.runPythonAsync(
    'from wickra_backtest import _wickra_backtest\n_wickra_backtest.run_json(_wickra_request)',
  )
  return String(result)
}

/** Inject the Pyodide loader script once and resolve when `loadPyodide` is available. */
function loadPyodideScript(): Promise<void> {
  if (window.loadPyodide) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${PYODIDE_INDEX_URL}pyodide.js`
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load the Pyodide runtime script'))
    document.head.appendChild(script)
  })
}

export class PythonRunner implements Runner {
  readonly id = 'python'
  readonly label = 'Python (Pyodide)'
  readonly lazy = true

  private pyodide: Pyodide | null = null
  private booting: Promise<Pyodide> | null = null

  ready(): Promise<void> {
    return this.boot().then(() => undefined)
  }

  private boot(): Promise<Pyodide> {
    if (this.pyodide) return Promise.resolve(this.pyodide)
    if (!this.booting) {
      this.booting = (async () => {
        await loadPyodideScript()
        if (!window.loadPyodide) {
          throw new Error('Pyodide loader is unavailable after script load')
        }
        const py = await window.loadPyodide({ indexURL: PYODIDE_INDEX_URL })
        await installWickraBacktest(
          py,
          new URL(`/wheels/${WICKRA_BACKTEST_WHEEL}`, window.location.origin).href,
        )
        this.pyodide = py
        return py
      })()
    }
    return this.booting
  }

  async run(candlesJson: string, specJson: string): Promise<string> {
    const py = await this.boot()
    return runInPyodide(py, buildRunRequest(candlesJson, specJson))
  }
}
