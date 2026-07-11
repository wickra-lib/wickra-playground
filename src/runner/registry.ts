import { GoRunner } from './go'
import { JsRunner } from './js'
import { PythonRunner } from './python'
import { RustRunner } from './rust'
import type { Runner } from './types'

/**
 * The active runners, in display order: Rust and JS drive the core directly, Go
 * drives the same core through the WASM bundle (honestly labelled), and Python
 * runs the real extension in Pyodide (lazy/opt-in so its ~30 MB load never
 * blocks the other panels).
 */
export const runners: Runner[] = [
  new RustRunner(),
  new JsRunner(),
  new GoRunner(),
  new PythonRunner(),
]
