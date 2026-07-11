# Cross-language execution

The playground's authenticity upgrade (P-PG-6) runs a **real, non-Rust language
runtime** in the browser so the byte-identity proof is no longer "same core,
different bindings" but "genuinely a different language runtime reaching the same
core". This document pins the exact artifacts that make that reproducible.

## Python (Pyodide)

The Python panel runs [Pyodide](https://pyodide.org/) — CPython compiled to
WebAssembly — and loads the actual `wickra-backtest` extension. Its
`run_json(request)` delegates to the same `core_run_json` the Rust and WASM
panels call (`bindings/python/src/lib.rs` returns the report string verbatim, no
re-serialization), so the report bytes match exactly.

Pinned artifacts (mirror the constants in `src/runner/python.ts`):

| Artifact | Version | Source |
|----------|---------|--------|
| Pyodide runtime | `v0.26.4` | `https://cdn.jsdelivr.net/pyodide/v0.26.4/full/` |
| `wickra-backtest` wheel | `0.1.0` | Pyodide/emscripten wheel attached to the `wickra-backtest` `v0.1.0` release: `wickra_backtest-0.1.0-cp312-cp312-pyodide_2024_0_wasm32.whl` |

The wheel is a compiled PyO3 extension, so it must be an **emscripten/Pyodide**
wheel (not a manylinux/macOS/Windows one) built for Pyodide's `pyodide_2024_0`
platform and `cp312` ABI. Pyodide can only load matching wheels. Until that
emscripten wheel is built and attached to the release, the Python panel errors at
load time by design — there is no stub or fake fallback. When the wheel ships,
bump `WICKRA_BACKTEST_VERSION` in `src/runner/python.ts` and the table above
together.

## Go (via WASM core)

The Go panel currently drives the same WASM core and is labelled "Go (via WASM
core)" — see [PANELS.md](PANELS.md). A real TinyGo-compiled panel was evaluated
for P-PG-6 and **deferred**: compiling the Go C-ABI binding to TinyGo-WASM and
wiring its `run_json` across the JS boundary is fragile enough that a half-working
panel would undermine the very determinism claim the playground exists to prove.
The honest "via core" label stays until a frictionless TinyGo path exists. No
fake, no half-stub.
