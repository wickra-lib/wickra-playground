<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { compare } from '../lib/diff'
import { sha256 } from '../lib/hash'

const props = defineProps<{
  /** The raw report string per runner id; `null` means that runner errored. */
  reports: Record<string, string | null>
  /** The spec JSON fed to every runner — part of the shareable proof block. */
  specJson: string
  /** The candles JSON fed to every runner — hashed into the proof block. */
  candlesJson: string
}>()

const proofHash = ref('')
const dataHash = ref('')
const copied = ref(false)

const entries = computed(() =>
  Object.entries(props.reports).filter((e): e is [string, string] => e[1] !== null),
)
const values = computed(() => entries.value.map((e) => e[1]))
const anyMissing = computed(() => Object.values(props.reports).some((r) => r === null))
const result = computed(() => compare(values.value))

/**
 * Where each panel first diverges from the reference (panel 0). Empty while
 * identical. Rendered as a small table so a real drift is legible byte-for-byte.
 */
const deltas = computed(() => {
  if (values.value.length < 2 || result.value.identical) return []
  const reference = values.value[0]
  return entries.value.slice(1).flatMap(([id, report], i) => {
    const at = result.value.firstDiff[i + 1]
    if (at === -1) return []
    return [
      {
        id,
        at,
        reference: reference.slice(at, at + 24),
        actual: report.slice(at, at + 24),
      },
    ]
  })
})

watch(
  [values, () => props.candlesJson],
  async ([v]) => {
    proofHash.value = v.length > 0 && result.value.identical ? await sha256(v[0]) : ''
    dataHash.value = props.candlesJson ? await sha256(props.candlesJson) : ''
  },
  { immediate: true },
)

async function copyProof(): Promise<void> {
  const block = [
    'wickra-playground byte-identity proof',
    `panels: ${entries.value.map((e) => e[0]).join(', ')}`,
    `data sha256: ${dataHash.value}`,
    `report sha256: ${proofHash.value}`,
    '',
    'spec:',
    props.specJson,
  ].join('\n')
  await navigator.clipboard.writeText(block)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
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
        ✗ {{ deltas.length }} panel(s) differ from the reference
      </p>

      <p v-if="proofHash" class="mono proof">proof sha256: {{ proofHash }}</p>

      <table v-if="deltas.length" class="mono delta">
        <thead>
          <tr>
            <th>panel</th>
            <th>first diff @</th>
            <th>reference</th>
            <th>actual</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in deltas" :key="d.id">
            <td>{{ d.id }}</td>
            <td>{{ d.at }}</td>
            <td>{{ d.reference }}…</td>
            <td>{{ d.actual }}…</td>
          </tr>
        </tbody>
      </table>

      <p v-if="anyMissing" class="status-bad">One or more panels failed to produce a report.</p>

      <button
        v-if="result.identical && proofHash"
        type="button"
        class="copy"
        @click="copyProof"
      >
        {{ copied ? 'Copied ✓' : 'Copy proof' }}
      </button>
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
.proof {
  word-break: break-all;
}
.delta {
  border-collapse: collapse;
  margin-top: 0.5rem;
  font-size: 0.85em;
}
.delta th,
.delta td {
  border: 1px solid var(--panel);
  padding: 0.25rem 0.5rem;
  text-align: left;
}
.copy {
  margin-top: 0.75rem;
}
</style>
