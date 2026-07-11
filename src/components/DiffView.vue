<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { compare } from '../lib/diff'
import { sha256 } from '../lib/hash'

const props = defineProps<{
  /** The raw report string per runner id; `null` means that runner errored. */
  reports: Record<string, string | null>
}>()

const proofHash = ref('')

const values = computed(() =>
  Object.values(props.reports).filter((r): r is string => r !== null),
)
const anyMissing = computed(() => Object.values(props.reports).some((r) => r === null))
const result = computed(() => compare(values.value))

watch(
  values,
  async (v) => {
    proofHash.value = v.length > 0 && result.value.identical ? await sha256(v[0]) : ''
  },
  { immediate: true },
)
</script>

<template>
  <section class="panel diff">
    <h2>Proof</h2>
    <p v-if="values.length < 2" class="muted">Waiting for at least two panels to report…</p>
    <template v-else>
      <p v-if="result.identical" class="status-ok big">
        ✓ byte-identical across {{ values.length }} panels — 0 differences
      </p>
      <p v-else class="status-bad big">
        ✗ {{ result.firstDiff.filter((i) => i !== -1).length }} panel(s) differ from the reference
      </p>
      <p v-if="proofHash" class="mono">proof sha256: {{ proofHash }}</p>
      <p v-if="anyMissing" class="status-bad">One or more panels failed to produce a report.</p>
    </template>
  </section>
</template>

<style scoped>
.diff {
  margin-top: 1rem;
}
.big {
  font-size: 1.15em;
  font-weight: 600;
}
</style>
