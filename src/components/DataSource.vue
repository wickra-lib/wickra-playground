<script setup lang="ts">
import { ref, watch } from 'vue'
import { candlesToJson, parseCandlesCsv, type Candle } from '../lib/candles'
import { fetchKlines } from '../lib/binance'

const props = defineProps<{ presetKey: string }>()
const emit = defineEmits<{ 'candles-changed': [candlesJson: string] }>()

type Source = 'preset' | 'upload' | 'binance'
const source = ref<Source>('preset')
const status = ref('')
const error = ref('')
const count = ref(0)

const binanceSymbol = ref('BTCUSDT')
const binanceInterval = ref('1h')

function publish(candles: Candle[]): void {
  count.value = candles.length
  emit('candles-changed', candlesToJson(candles))
}

async function loadPreset(key: string): Promise<void> {
  error.value = ''
  status.value = `Loading ${key}.csv…`
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${key}.csv`)
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`)
    }
    publish(parseCandlesCsv(await res.text()))
    status.value = `Preset dataset: ${key}.csv`
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

async function onUpload(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  source.value = 'upload'
  error.value = ''
  publish(parseCandlesCsv(await file.text()))
  status.value = `Uploaded: ${file.name}`
}

async function onBinanceFetch(): Promise<void> {
  source.value = 'binance'
  error.value = ''
  status.value = 'Fetching from Binance…'
  try {
    publish(await fetchKlines(binanceSymbol.value, binanceInterval.value, 500))
    status.value = `Binance: ${binanceSymbol.value} ${binanceInterval.value}`
  } catch (e) {
    error.value = `Binance fetch failed (a CORS fallback lands in a later phase): ${
      e instanceof Error ? e.message : String(e)
    }`
  }
}

// Reload the preset's dataset whenever the selected preset changes, as long as
// the preset source is active.
watch(
  () => props.presetKey,
  (key) => {
    if (source.value === 'preset') loadPreset(key)
  },
  { immediate: true },
)
</script>

<template>
  <section class="panel">
    <div class="row">
      <label>
        <input v-model="source" type="radio" value="preset" @change="loadPreset(props.presetKey)" />
        Preset dataset
      </label>
      <label><input v-model="source" type="radio" value="upload" /> Upload CSV</label>
      <label><input v-model="source" type="radio" value="binance" /> Binance</label>
    </div>

    <div v-if="source === 'upload'">
      <input type="file" accept=".csv,text/csv" @change="onUpload" />
      <span class="muted mono"> — header: ts,open,high,low,close,volume</span>
    </div>
    <div v-else-if="source === 'binance'" class="row">
      <input v-model="binanceSymbol" aria-label="Symbol" style="width: 8rem" />
      <input v-model="binanceInterval" aria-label="Interval" style="width: 5rem" />
      <button type="button" @click="onBinanceFetch">Fetch</button>
    </div>

    <p class="mono muted">{{ status }}<span v-if="count"> · {{ count }} bars</span></p>
    <p v-if="error" class="status-bad mono">{{ error }}</p>
  </section>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
</style>
