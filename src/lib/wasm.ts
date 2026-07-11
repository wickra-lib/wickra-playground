// Central WebAssembly loader for the wickra-backtest core.
//
// wickra-backtest-wasm is built with wasm-pack's `bundler` target, so Vite (via
// vite-plugin-wasm + vite-plugin-top-level-await) instantiates the module on
// import — there is no explicit `init()` to call. initWasm() still gives every
// caller one shared, awaitable ready-state with error handling, and
// getBacktest() hands back the typed surface once it has loaded.

export interface WasmBacktestApi {
  /**
   * Run a backtest from a JSON `RunRequest` (`{ spec, candles, capital }`) and
   * return the canonical `BacktestReport` JSON string verbatim.
   */
  runJson(requestJson: string): string
  /** The wickra-backtest core version. */
  version(): string
}

let readyPromise: Promise<void> | null = null
let api: WasmBacktestApi | null = null

/**
 * Load and ready the wasm core exactly once. Safe to await from anywhere; every
 * call after the first returns the same promise.
 */
export function initWasm(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const wasm = await import('wickra-backtest-wasm')
      // Touch an export to force instantiation and surface any load error early.
      const version = wasm.version()
      if (!version) {
        throw new Error('wickra-backtest-wasm loaded but reported an empty version')
      }
      api = {
        runJson: (requestJson: string) => wasm.run_json(requestJson),
        version: () => wasm.version(),
      }
    })()
  }
  return readyPromise
}

/** The loaded backtest API. Throws if {@link initWasm} has not resolved yet. */
export function getBacktest(): WasmBacktestApi {
  if (!api) {
    throw new Error('wasm not initialised — await initWasm() first')
  }
  return api
}
