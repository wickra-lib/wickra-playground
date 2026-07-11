import { GoRunner } from './go'
import { JsRunner } from './js'
import { RustRunner } from './rust'
import type { Runner } from './types'

/**
 * The active runners, in display order: Rust and JS drive the core directly,
 * Go drives the same core through the WASM bundle (honestly labelled). Real
 * Python via Pyodide joins in P-PG-6.
 */
export const runners: Runner[] = [new RustRunner(), new JsRunner(), new GoRunner()]
