import { buildRunRequest } from '../lib/candles'
import { getBacktest, initWasm } from '../lib/wasm'
import type { Runner } from './types'

/**
 * A "Go" panel that drives the **same deterministic Rust core** through the WASM
 * bundle — the panel is honestly labelled "Go (via WASM core)". The point of the
 * playground is that every binding path funnels into one core, so the report is
 * byte-identical regardless of the caller; a Go program using the C-ABI hub
 * would produce this exact string. A real TinyGo-compiled panel was evaluated and
 * deferred (docs/CROSS_LANGUAGE.md); until one is reliable, this path is
 * transparent about what it wraps rather than faking a Go runtime.
 */
export class GoRunner implements Runner {
  readonly id = 'go'
  readonly label = 'Go (via WASM core)'

  ready(): Promise<void> {
    return initWasm()
  }

  async run(candlesJson: string, specJson: string): Promise<string> {
    await initWasm()
    return getBacktest().runJson(buildRunRequest(candlesJson, specJson))
  }
}
