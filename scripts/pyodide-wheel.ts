import { createHash, randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The Pyodide wheel of wickra-backtest, as `src/runner/pyodide-wheel.json` pins
 * it. The wheel is not committed -- a binary in the tree is what OpenSSF
 * Scorecard's Binary-Artifacts check exists to flag. `pyodide-wheel.yml`
 * publishes each build as the asset of its own release instead, tagged
 * `release`, and every consumer -- `vite build`, the dev server and the Python
 * panel's test -- downloads it into `public/wheels/` and checks its sha256
 * before using it. The page still installs it from its own origin.
 */
export interface WheelManifest {
  pyodide: string
  wickra_backtest: string
  wheel: string
  sha256: string
  release: string
}

const REPOSITORY = 'wickra-lib/wickra-playground'

export function readWheelManifest(path: string): WheelManifest {
  return JSON.parse(readFileSync(path, 'utf8')) as WheelManifest
}

/** Where the release that carries the pinned wheel serves it. */
export function wheelDownloadUrl(manifest: WheelManifest): string {
  return `https://github.com/${REPOSITORY}/releases/download/${manifest.release}/${manifest.wheel}`
}

const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')

/**
 * Make sure `wheelsDir` holds the pinned wheel and return its path. A file that
 * is already there is kept when its sha256 is the pinned one (the wheel
 * `pyodide-wheel.yml` has just built, or an earlier download); otherwise the
 * wheel is downloaded from its release. Bytes whose sha256 is not the pinned
 * one are refused, never written.
 */
export async function ensurePyodideWheel(manifestPath: string, wheelsDir: string): Promise<string> {
  const manifest = readWheelManifest(manifestPath)
  const path = join(wheelsDir, manifest.wheel)
  if (existsSync(path) && digest(readFileSync(path)) === manifest.sha256) return path

  const url = wheelDownloadUrl(manifest)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`downloading the Pyodide wheel from ${url} failed: HTTP ${response.status}`)
  }
  const bytes = new Uint8Array(await response.arrayBuffer())
  const got = digest(bytes)
  if (got !== manifest.sha256) {
    throw new Error(
      `the Pyodide wheel from ${url} has sha256 ${got}, not the pinned ${manifest.sha256}; refusing it`,
    )
  }
  mkdirSync(wheelsDir, { recursive: true })
  // Write beside the target and rename, so a reader never sees half a wheel.
  const partial = `${path}.${randomUUID()}.part`
  writeFileSync(partial, bytes)
  renameSync(partial, path)
  return path
}
