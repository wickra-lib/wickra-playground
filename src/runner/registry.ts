import { JsRunner } from './js'
import { RustRunner } from './rust'
import type { Runner } from './types'

/**
 * The active runners, in display order. This is the MVP set (Rust + JS); it
 * grows to add Go (P-PG-4) and real Python via Pyodide (P-PG-6).
 */
export const runners: Runner[] = [new RustRunner(), new JsRunner()]
