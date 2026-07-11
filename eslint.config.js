import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

// Flat config (ESLint 9): Vue essential rules + the Vue TypeScript recommended
// preset. Prettier owns formatting, so ESLint only lints correctness here.
export default defineConfigWithVueTs(
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
)
