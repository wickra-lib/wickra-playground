/**
 * A single language / binding path that runs a backtest. Every runner is handed
 * the same candle JSON and spec JSON and returns the core's raw report string
 * **unchanged** — that verbatim pass-through is exactly what makes the outputs
 * comparable byte for byte across panels.
 */
export interface Runner {
  /** Stable id, used as a key (e.g. `"rust"`, `"js"`). */
  id: string
  /** Human label shown on the panel (e.g. `"Rust"`, `"JS"`). */
  label: string
  /**
   * When true, the panel is opt-in: it waits for the user to enable it before
   * loading a heavy runtime (e.g. Pyodide ~30 MB), so it never blocks the other
   * panels. Omitted/false runners run automatically.
   */
  lazy?: boolean
  /** Resolves once the runner's backing engine is loaded and ready. */
  ready(): Promise<void>
  /**
   * Run the backtest and return the raw report JSON string, unmodified. No
   * `JSON.parse`/`JSON.stringify` round-trip on the result — the bytes must be
   * exactly what the core produced.
   */
  run(candlesJson: string, specJson: string): Promise<string>
}
