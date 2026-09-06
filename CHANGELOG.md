# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `package-lock.json`. Its absence is why nothing in this repository had ever
  run: every workflow uses `actions/setup-node` with `cache: npm` and then
  `npm ci`, both of which need a lock file, so all 15 CI runs and all 8 deploy
  runs since the repository was created failed at the same step.
- `src/__golden__/sma_cross.sha256`, blessed from a run in which every automatic
  runner already agreed on the report — which is the condition `golden.test.ts`
  documents for blessing it.

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

### Fixed

- The dependency set is installable. `typescript` was declared `^7.0.2`, which
  `vue-tsc` cannot drive (`ERR_PACKAGE_PATH_NOT_EXPORTED`) and which is outside
  the `>=4.8.4 <6.1.0` peer range of the `@typescript-eslint` packages that
  `@vue/eslint-config-typescript` pulls in. Pinned to `~6.0.3`, the highest
  version both accept.
- `tsconfig.node.json` set `composite: true` together with `noEmit: true`, which
  TypeScript rejects for a referenced project (`TS6310`). It emits declarations
  now. `tsconfig.json` also gained `node` in `types`, without which
  `golden.test.ts` could not name `node:fs`.
- `@types/node` is a dependency. `tsconfig.node.json` asked for the `node` type
  library and nothing provided it.
- Every file is Prettier-formatted, so `npm run lint` passes. It had never been
  run over the repository.

### Removed

- `vite-plugin-top-level-await` and the `deploy.yml` workflow.

  The plugin does not work under Vite 8, whose Rolldown build rejects it with
  `missing field \`type\``. It is also unnecessary here: `build.target`is
already`esnext`, which supports top-level await natively, and the WASM
  modules load either way.

  The workflow deployed through `wrangler` behind `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID`, which were never set, so the deploy step was skipped
  on every run that got that far — and none did. Deployment is the Cloudflare
  Pages Git integration instead, the same as every other site in the family, so
  no repository secret is involved.
