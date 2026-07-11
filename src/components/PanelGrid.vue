<script setup lang="ts">
import { reactive } from 'vue'
import { runners } from '../runner/registry'
import DiffView from './DiffView.vue'
import LangPanel from './LangPanel.vue'

defineProps<{
  candlesJson: string
  specJson: string
}>()

// The raw report string per runner id (null once a runner errors), collected
// from the panels and handed to the diff view.
const reports = reactive<Record<string, string | null>>({})

function onReport(payload: { id: string; report: string | null }): void {
  reports[payload.id] = payload.report
}
</script>

<template>
  <div>
    <div class="grid">
      <LangPanel
        v-for="r in runners"
        :key="r.id"
        :runner="r"
        :candles-json="candlesJson"
        :spec-json="specJson"
        @report="onReport"
      />
    </div>
    <DiffView :reports="reports" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
</style>
