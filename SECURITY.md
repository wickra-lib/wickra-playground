# Security Policy

`wickra-playground` is a static, client-side web app. It runs one `StrategySpec`
through the WebAssembly build of the Wickra backtest core along several language
paths and compares the results in the browser. It has **no backend, no server, no
API key, and no authenticated connections** — nothing you enter or run ever
leaves your machine. The attack surface is therefore narrow: principally the
parsing of untrusted `StrategySpec` and candle JSON inside the browser sandbox,
and the third-party WebAssembly / npm dependencies the site bundles.

## Supported versions

Until the first stable release, only the latest version receives security
fixes. That is `0.1.0`, the version `package.json` declares and the one the
deployed site is built from.

| Version          | Supported          |
| ---------------- | ------------------ |
| `0.1.0` (latest) | :white_check_mark: |
| older            | :x:                |

## Reporting a vulnerability

Please report suspected vulnerabilities privately via GitHub Security Advisories:
[open a draft advisory](https://github.com/wickra-lib/wickra-playground/security/advisories/new).
Do not open a public issue for a security report. We aim to acknowledge within a
few days and will coordinate a fix and disclosure timeline with you.
