<script setup lang="ts">
import { onMounted, ref } from 'vue'
import smaCross from '../presets/sma_cross.json'
import rsiReversion from '../presets/rsi_reversion.json'
import macdTrend from '../presets/macd_trend.json'
import breakout from '../presets/breakout.json'

interface Preset {
  key: string
  label: string
  spec: unknown
}

const PRESETS: Preset[] = [
  { key: 'sma_cross', label: 'SMA crossover', spec: smaCross },
  { key: 'rsi_reversion', label: 'RSI reversion', spec: rsiReversion },
  { key: 'macd_trend', label: 'MACD trend', spec: macdTrend },
  { key: 'breakout', label: 'ATR breakout', spec: breakout },
]

const DEFAULT_KEY = 'sma_cross'
const SPEC_STORE = 'wickra-playground:spec'
const PRESET_STORE = 'wickra-playground:preset'

const emit = defineEmits<{
  'spec-changed': [specJson: string]
  'preset-changed': [presetKey: string]
}>()

const presetKey = ref(DEFAULT_KEY)
const specText = ref('')
const error = ref('')

function presetSpecText(key: string): string {
  const preset = PRESETS.find((p) => p.key === key) ?? PRESETS[0]
  return JSON.stringify(preset.spec, null, 2)
}

/** UTF-8-safe base64 for the shareable `#spec=` permalink. */
function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(b64: string): string {
  const binary = atob(b64)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** The spec carried in `location.hash` (`#spec=<base64>`), or null if absent/invalid. */
function specFromHash(): string | null {
  const match = /(?:^#|&)spec=([^&]+)/.exec(location.hash)
  if (!match) return null
  try {
    return fromBase64(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

/** Write the current spec into `location.hash` so the URL is a forkable share-link. */
function syncHash(text: string): void {
  location.hash = `spec=${encodeURIComponent(toBase64(text))}`
}

function validate(text: string): boolean {
  try {
    JSON.parse(text)
    error.value = ''
    return true
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'invalid JSON'
    return false
  }
}

/** Persist + validate the current text and, if valid, emit it upward. */
function onEdit(): void {
  localStorage.setItem(SPEC_STORE, specText.value)
  if (validate(specText.value)) {
    syncHash(specText.value)
    emit('spec-changed', specText.value)
  }
}

function applyPreset(key: string): void {
  presetKey.value = key
  specText.value = presetSpecText(key)
  localStorage.setItem(PRESET_STORE, key)
  onEdit()
  emit('preset-changed', key)
}

function onPresetChange(event: Event): void {
  applyPreset((event.target as HTMLSelectElement).value)
}

function resetToPreset(): void {
  applyPreset(presetKey.value)
}

onMounted(() => {
  const savedPreset = localStorage.getItem(PRESET_STORE) ?? DEFAULT_KEY
  presetKey.value = PRESETS.some((p) => p.key === savedPreset) ? savedPreset : DEFAULT_KEY
  // A `#spec=` permalink wins over local storage so a shared link is reproducible.
  specText.value =
    specFromHash() ?? localStorage.getItem(SPEC_STORE) ?? presetSpecText(presetKey.value)
  onEdit()
  emit('preset-changed', presetKey.value)
})
</script>

<template>
  <section class="panel">
    <div class="row">
      <label>
        Preset:
        <select :value="presetKey" @change="onPresetChange">
          <option v-for="p in PRESETS" :key="p.key" :value="p.key">{{ p.label }}</option>
        </select>
      </label>
      <button type="button" @click="resetToPreset">Reset to preset</button>
    </div>
    <textarea
      v-model="specText"
      rows="18"
      spellcheck="false"
      aria-label="Strategy spec (JSON)"
      @input="onEdit"
    ></textarea>
    <p v-if="error" class="status-bad mono">Invalid JSON: {{ error }}</p>
    <p v-else class="status-ok mono">Spec is valid JSON</p>
  </section>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
</style>
