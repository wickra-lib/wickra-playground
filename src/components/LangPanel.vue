<script setup lang="ts">
import { ref, watch } from 'vue'
import { sha256 } from '../lib/hash'
import type { Runner } from '../runner/types'

const props = defineProps<{
  runner: Runner
  candlesJson: string
  specJson: string
}>()

const emit = defineEmits<{
  report: [payload: { id: string; report: string | null }]
}>()

type State = 'idle' | 'running' | 'ok' | 'error'

const state = ref<State>('idle')
const pretty = ref('')
const hash = ref('')
const errorMessage = ref('')

async function run(): Promise<void> {
  if (!props.candlesJson || !props.specJson) return
  state.value = 'running'
  errorMessage.value = ''
  try {
    const raw = await props.runner.run(props.candlesJson, props.specJson)
    // Pretty-print a COPY for display only; the raw string used for diff/hash is
    // never re-serialized.
    try {
      pretty.value = JSON.stringify(JSON.parse(raw), null, 2)
    } catch {
      pretty.value = raw
    }
    hash.value = await sha256(raw)
    state.value = 'ok'
    emit('report', { id: props.runner.id, report: raw })
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e)
    state.value = 'error'
    emit('report', { id: props.runner.id, report: null })
  }
}

watch(() => [props.candlesJson, props.specJson], run, { immediate: true })
</script>

<template>
  <div class="panel">
    <h3>{{ runner.label }}</h3>
    <p class="mono">
      <span v-if="state === 'running'" class="muted">running…</span>
      <span v-else-if="state === 'ok'" class="status-ok">● ok · sha256 {{ hash.slice(0, 12) }}…</span>
      <span v-else-if="state === 'error'" class="status-bad">● error</span>
      <span v-else class="muted">idle</span>
    </p>
    <p v-if="errorMessage" class="status-bad mono">{{ errorMessage }}</p>
    <pre v-else-if="pretty" class="report mono">{{ pretty }}</pre>
  </div>
</template>

<style scoped>
.report {
  max-height: 22rem;
  overflow: auto;
  font-size: 0.85em;
  white-space: pre;
}
</style>
