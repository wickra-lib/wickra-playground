<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <section class="panel about">
    <button type="button" class="toggle" @click="open = !open">
      {{ open ? '▾' : '▸' }} Why are the panels byte-identical?
    </button>
    <div v-if="open" class="body">
      <p>
        Every panel wraps the <strong>same deterministic Rust core</strong> through a
        different binding path — Rust calls it directly, JS calls it over the WASM
        bundle, and Go drives that same bundle. That is <em>why</em> the output is
        byte-identical: there is one engine, not four re-implementations.
      </p>
      <p class="muted">
        This is the claim no other TA or backtest library can make. Ports to Python,
        JS, and Go normally drift in rounding, warmup, and fill logic; here the diff
        view proves they don't, because there is nothing to drift from.
      </p>
    </div>
  </section>
</template>

<style scoped>
.about {
  margin-top: 1rem;
}
.toggle {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font: inherit;
  padding: 0;
}
.body {
  margin-top: 0.5rem;
}
</style>
