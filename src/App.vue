<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AboutCore from './components/AboutCore.vue'
import DataSource from './components/DataSource.vue'
import PanelGrid from './components/PanelGrid.vue'
import SpecEditor from './components/SpecEditor.vue'
import { getBacktest, initWasm } from './lib/wasm'

type Status = 'loading' | 'ready' | 'error'

const status = ref<Status>('loading')
const coreVersion = ref('')
const errorMessage = ref('')

const specJson = ref('')
const candlesJson = ref('')
const presetKey = ref('sma_cross')

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
    <SpecEditor @spec-changed="specJson = $event" @preset-changed="presetKey = $event" />
    <DataSource :preset-key="presetKey" @candles-changed="candlesJson = $event" />
    <PanelGrid :candles-json="candlesJson" :spec-json="specJson" />
    <AboutCore />
  </main>
</template>
