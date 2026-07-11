import { buildRunRequest } from '../lib/candles'
import { getBacktest, initWasm } from '../lib/wasm'
import type { Runner } from './types'

/**
 * Runs the backtest through the native Rust core compiled to WebAssembly
 * (`wickra-backtest-wasm`). The report string it returns is the canonical output
 * every other panel is measured against.
 */
export class RustRunner implements Runner {
  readonly id = 'rust'
  readonly label = 'Rust'

  ready(): Promise<void> {
    return initWasm()
  }

  async run(candlesJson: string, specJson: string): Promise<string> {
    await initWasm()
    // Return the core's response string verbatim — no parse/stringify.
    return getBacktest().runJson(buildRunRequest(candlesJson, specJson))
  }
}
