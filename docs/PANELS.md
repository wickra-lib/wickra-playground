# Panels

The playground shows one strategy backtest side by side across four language
panels. This document explains what each panel actually runs and why the outputs
are byte-identical.

## The core claim

Every panel reaches the **same deterministic Rust core** through a different
path. Rust calls it directly, JS calls it over the WASM bundle, Go drives that
same bundle, and Python calls the `wickra-backtest` extension inside a real
CPython runtime. That is _why_ the output is byte-identical: there is one engine,
not four re-implementations.

This is the claim no other TA or backtest library can make. Ports to Python, JS,
and Go normally drift in rounding, warmup periods, and fill logic; here the diff
view proves they don't, because there is nothing to drift from.

## Panel status

| Panel                  | What it runs                                                                                                                                                                                                                                                                                                                                         | Honest labelling |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **Rust**               | The native Rust core compiled to WebAssembly (`wickra-backtest-wasm`), called directly. Canonical output.                                                                                                                                                                                                                                            | Real.            |
| **JS**                 | The same WASM core, reached over a separate JavaScript call path (represents "JS calls the library").                                                                                                                                                                                                                                                | Real.            |
| **Go (via WASM core)** | The same WASM core. A real Go program using the C-ABI hub would produce this exact string, so the panel drives the core and is **explicitly labelled** "via WASM core".                                                                                                                                                                              | Transparent.     |
| **Python (Pyodide)**   | Real [Pyodide](https://pyodide.org/), CPython compiled to WebAssembly, with the `wickra-backtest` extension installed from a Pyodide wheel built from the released sdist. It calls the extension's `run_json`, which returns the core's report string verbatim. Opt-in: the runtime is a large download, so the panel waits for its "Enable" button. | Real.            |

The Python artifacts are pinned in `src/runner/pyodide-wheel.json`: the Pyodide
version, and the wheel's version, file name, sha256 and release.
[CROSS_LANGUAGE.md](CROSS_LANGUAGE.md) explains how the wheel is built, verified
and served from the site's own origin.

## Why not fake a Go runtime?

Faking a runtime would defeat the entire point — the playground exists to _prove_
cross-language determinism, so a stubbed panel would be a lie in the one place
honesty matters most. Python got a real runtime for that reason rather than a
stub. A TinyGo-compiled Go panel was evaluated and deferred: wiring the Go C-ABI
binding through TinyGo-WASM is fragile enough that a half-working panel would
undermine the claim (see [CROSS_LANGUAGE.md](CROSS_LANGUAGE.md#go-via-wasm-core)).
The Go panel is therefore labelled for exactly what it is.
