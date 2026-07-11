<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getBacktest, initWasm } from './lib/wasm'

type Status = 'loading' | 'ready' | 'error'

const status = ref<Status>('loading')
const coreVersion = ref('')
const errorMessage = ref('')

onMounted(async () => {
  try {
    await initWasm()
    coreVersion.value = getBacktest().version()
    status.value = 'ready'
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err)
    status.value = 'error'
  }
})
</script>

<template>
  <header>
    <h1>Wickra Playground</h1>
    <p class="muted">
      One strategy spec, run byte-identical in Rust · JS · Go · Python — live in
      your browser, zero backend.
    </p>
    <p class="mono">
      <template v-if="status === 'loading'">Loading the backtest core…</template>
      <template v-else-if="status === 'ready'">
        <span class="status-ok">● core ready</span> · wickra-backtest {{ coreVersion }}
      </template>
      <template v-else>
        <span class="status-bad">● core failed to load</span> — {{ errorMessage }}
      </template>
    </p>
  </header>

  <main v-if="status === 'ready'">
    <!-- The spec editor and data source (P-PG-2) and the language panel grid +
         diff view (P-PG-3) mount here as they are implemented. -->
    <section class="panel">
      <p class="muted">
        Edit a strategy spec, pick a candle dataset, and watch every language
        panel compute the same report — the diff view proves byte-identity.
      </p>
    </section>
  </main>
</template>
