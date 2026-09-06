/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import wasm from 'vite-plugin-wasm'

// Served from the root of the playground.wickra.org custom domain (Cloudflare
// Pages), so the base is '/'. wickra-backtest-wasm and wickra-wasm are real
// WebAssembly modules — the two wasm plugins let Vite bundle and instantiate
// them client-side. Their async `init()` uses top-level await, which the esnext
// build target below supports natively -- vite-plugin-top-level-await is not
// needed for that and does not work under Vite 8's Rolldown build.
export default defineConfig({
  base: '/',
  plugins: [vue(), wasm()],
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
