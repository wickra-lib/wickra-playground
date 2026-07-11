# Panels

The playground shows one strategy backtest side by side across several language
panels. This document explains what each panel actually runs and why the outputs
are byte-identical.

## The core claim

Every panel wraps the **same deterministic Rust core** through a different
binding path — Rust calls it directly, JS calls it over the WASM bundle, and Go
drives that same bundle. That is *why* the output is byte-identical: there is one
engine, not four re-implementations.

This is the claim no other TA or backtest library can make. Ports to Python, JS,
and Go normally drift in rounding, warmup periods, and fill logic; here the diff
view proves they don't, because there is nothing to drift from.

## Panel status

| Panel | What it runs today | Honest labelling |
|-------|--------------------|------------------|
| **Rust** | The native Rust core compiled to WebAssembly (`wickra-backtest-wasm`), called directly. Canonical output. | Real. |
| **JS** | The same WASM core, reached over a separate JavaScript call path (represents "JS calls the library"). | Real. |
| **Go (via WASM core)** | The same WASM core. A real Go program using the C-ABI hub would produce this exact string, so the panel drives the core and is **explicitly labelled** "via WASM core". | Transparent. |
| **Python** | Planned for P-PG-6: real [Pyodide](https://pyodide.org/) loading the `wickra-backtest` wheel and calling `run_json`. | Real (when shipped). |

## Why not fake a Go or Python runtime?

Faking a runtime would defeat the entire point — the playground exists to *prove*
cross-language determinism, so a stubbed panel would be a lie in the one place
honesty matters most. The Go panel is therefore labelled for exactly what it is
until a real TinyGo-compiled panel lands (the optional P-PG-6 upgrade). The
Python panel is deferred rather than stubbed for the same reason: it will run
real Pyodide or it will not appear.
