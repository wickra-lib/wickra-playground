# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Project scaffolding: the Vue 3 + Vite + TypeScript app manifest and build
  config (ESLint, Prettier, referenced-project `tsconfig`), dual
  `MIT OR Apache-2.0` license, the supply-chain / link config (`lychee.toml`,
  `osv-scanner.toml`, `repo-metadata.toml`), and the project governance and
  community docs.
- The full application: WASM core loader, `StrategySpec` schema + four presets,
  deterministic candle datasets, the spec editor, the data source (preset /
  upload / Binance with mirror fallback), and the runner abstraction.
- The byte-identity proof UI: one `LangPanel` per runner (Rust, JS, Go via the
  WASM core, and real Python via Pyodide), a `PanelGrid` fanning one shared
  source to every panel, and a `DiffView` with a byte-level delta table, a
  prominent proof sha256, a "Copy proof" block, and a `#spec=<base64>` permalink.
- Tests: vitest suites for candles, hashing, and diffing, plus the golden
  determinism test that pins byte-identity across the automatic runners.
- CI/CD: `ci.yml` (build/lint/test on node 22/24), `codeql.yml`, `scorecard.yml`,
  `zizmor.yml`, `links.yml`, and a secret-gated Cloudflare Pages `deploy.yml`.
- Docs: `ARCHITECTURE`, `PANELS`, `SPEC`, `CROSS_LANGUAGE`, and the `Cookbook`.

[Unreleased]: https://github.com/wickra-lib/wickra-playground/commits/main
