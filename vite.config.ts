/// <reference types="vitest/config" />
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'
import { ensurePyodideWheel } from './scripts/pyodide-wheel'

// The Python panel installs the pinned Pyodide wheel from this site's own
// /wheels/. The wheel is not committed: before Vite copies public/ (and before
// the dev server serves it) this fetches it from its release and checks its
// sha256 -- see scripts/pyodide-wheel.ts.
function pyodideWheel(): Plugin {
  let manifest = ''
  let wheels = ''
  return {
    name: 'wickra-pyodide-wheel',
    configResolved(config) {
      manifest = join(config.root, 'src/runner/pyodide-wheel.json')
      wheels = join(config.publicDir, 'wheels')
    },
    async buildStart() {
      await ensurePyodideWheel(manifest, wheels)
    },
  }
}

// Served from the root of the play.wickra.org custom domain (Cloudflare
// Pages), so the base is '/'. The marketing site for this product is a
// separate repository at playground.wickra.org. wickra-backtest-wasm and wickra-wasm are real
// WebAssembly modules — the two wasm plugins let Vite bundle and instantiate
// them client-side. Their async `init()` uses top-level await, which the esnext
// build target below supports natively -- vite-plugin-top-level-await is not
// needed for that and does not work under Vite 8's Rolldown build.
export default defineConfig({
  base: '/',
  plugins: [vue(), wasm(), pyodideWheel()],
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
