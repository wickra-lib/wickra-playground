import { buildRunRequest } from '../lib/candles'
import { getBacktest, initWasm } from '../lib/wasm'
import type { Runner } from './types'

/**
 * Runs the backtest from a JavaScript call path over the same WebAssembly core.
 * This panel represents "JS calls the library": it is the same deterministic
 * Rust core (see the About panel), so its report is byte-identical to the Rust
 * panel — which is precisely the claim the playground exists to prove.
 */
export class JsRunner implements Runner {
  readonly id = 'js'
  readonly label = 'JS'

  ready(): Promise<void> {
    return initWasm()
  }

  async run(candlesJson: string, specJson: string): Promise<string> {
    await initWasm()
    return getBacktest().runJson(buildRunRequest(candlesJson, specJson))
  }
}
