/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

// Served from the root of the playground.wickra.org custom domain (Cloudflare
// Pages), so the base is '/'. wickra-backtest-wasm and wickra-wasm are real
// WebAssembly modules — the two wasm plugins let Vite bundle and instantiate
// them client-side, with top-level await for their async `init()`.
export default defineConfig({
  base: '/',
  plugins: [vue(), wasm(), topLevelAwait()],
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
