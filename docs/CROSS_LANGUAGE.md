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

Pinned artifacts — one manifest, `src/runner/pyodide-wheel.json`, read by the
runner, the test and the build workflow:

| Artifact                | Version   | Source                                                                                               |
| ----------------------- | --------- | ---------------------------------------------------------------------------------------------------- |
| Pyodide runtime         | `314.0.7` | `https://cdn.jsdelivr.net/pyodide/v314.0.7/full/` (Python 3.14, platform `pyemscripten_2026_0`)      |
| `wickra-backtest` wheel | `0.2.0`   | `/wheels/wickra_backtest-0.2.0-cp39-abi3-pyemscripten_2026_0_wasm32.whl`, served by this site itself |

The wheel is a compiled PyO3 extension, so it must be an **Emscripten** wheel for
Pyodide's platform (`pyemscripten_<abi>_wasm32`), not a manylinux/macOS/Windows
one. wickra-backtest does not release such a wheel, and a GitHub release asset
could not be fetched from the page anyway — its download host sends no CORS
headers. So `.github/workflows/pyodide-wheel.yml` builds it here:

- **When:** hourly, and on demand. It builds when wickra-backtest has a newer
  release than the pinned wheel, or when the pinned Pyodide uses another
  platform tag than the wheel carries.
- **How:** `pyodide-build` (installed `--require-hashes` from
  `.github/requirements/pyodide-build.txt`) with the cross-build environment of
  the pinned Pyodide, the Rust toolchain and Emscripten version that environment
  names, over the released **sdist from PyPI** (its sha256 checked against
  PyPI's).
- **Proof:** `src/python.test.ts` boots the same Pyodide version in Node,
  installs the built wheel and requires the golden sha256 — the bytes the Rust,
  JS and Go runners produce. A report that differs fails the run; the golden is
  re-blessed by a person, never by the bot.
- **Then:** the wheel goes to `public/wheels/` and the manifest takes its
  version, file name and sha256, in one signed commit. The page installs it with
  micropip from its own origin, so the Content-Security-Policy needs no
  third-party host for it.

The panel calls the compiled `_wickra_backtest.run_json`, which returns the
core's report string verbatim. The package's public `wickra_backtest.run_json`
returns a dict (`json.loads` for Python callers), and serializing that again
would not reproduce the core's bytes.

**Moving Pyodide:** change `pyodide` in the manifest on a branch and run the
workflow there (`workflow_dispatch`); it rebuilds the wheel for the new platform
and commits it to that branch. The wheel build is not bit-reproducible (paths are
embedded), which is why the manifest records the sha256 of the file it serves
rather than expecting a fixed one.

## Go (via WASM core)

The Go panel currently drives the same WASM core and is labelled "Go (via WASM
core)" — see [PANELS.md](PANELS.md). A real TinyGo-compiled panel was evaluated
for P-PG-6 and **deferred**: compiling the Go C-ABI binding to TinyGo-WASM and
wiring its `run_json` across the JS boundary is fragile enough that a half-working
panel would undermine the very determinism claim the playground exists to prove.
The honest "via core" label stays until a frictionless TinyGo path exists. No
fake, no half-stub.
