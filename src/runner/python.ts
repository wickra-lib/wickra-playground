import { buildRunRequest } from '../lib/candles'
import type { Runner } from './types'

/**
 * Real Python execution via [Pyodide](https://pyodide.org/): the CPython runtime
 * compiled to WebAssembly, running the actual `wickra-backtest` extension in the
 * browser. Its `run_json(request)` delegates to the same `core_run_json` the Rust
 * and WASM panels use, so the report is byte-identical — this is the panel that
 * upgrades the proof from "same core, different bindings" to "genuinely a
 * different language runtime".
 *
 * Pinned artifacts (also documented in docs/CROSS_LANGUAGE.md):
 *  - Pyodide runtime: v0.26.4 (jsDelivr CDN).
 *  - wickra-backtest wheel: the Pyodide/emscripten wheel attached to the
 *    matching wickra-backtest release. Until that emscripten wheel is published
 *    this runner errors at load time (by design — no stub, no fake).
 */
const PYODIDE_VERSION = '0.26.4'
const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

const WICKRA_BACKTEST_VERSION = '0.1.0'
const WICKRA_BACKTEST_WHEEL =
  `https://github.com/wickra-lib/wickra-backtest/releases/download/` +
  `v${WICKRA_BACKTEST_VERSION}/` +
  `wickra_backtest-${WICKRA_BACKTEST_VERSION}-cp312-cp312-pyodide_2024_0_wasm32.whl`

interface Pyodide {
  loadPackage(names: string | string[]): Promise<void>
  runPythonAsync(code: string): Promise<unknown>
  globals: { get(name: string): unknown; set(name: string, value: unknown): void }
}

declare global {
  interface Window {
    loadPyodide?: (options: { indexURL: string }) => Promise<Pyodide>
  }
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
        await py.loadPackage('micropip')
        await py.runPythonAsync(
          `import micropip\nawait micropip.install(${JSON.stringify(WICKRA_BACKTEST_WHEEL)})`,
        )
        this.pyodide = py
        return py
      })()
    }
    return this.booting
  }

  async run(candlesJson: string, specJson: string): Promise<string> {
    const py = await this.boot()
    const request = buildRunRequest(candlesJson, specJson)
    py.globals.set('_wickra_request', request)
    // run_json returns the report JSON string verbatim (same core_run_json as
    // the Rust/WASM panels) — no re-serialization, so the bytes match exactly.
    const result = await py.runPythonAsync(
      'import wickra_backtest\nwickra_backtest.run_json(_wickra_request)',
    )
    return String(result)
  }
}
