import { defineConfig } from 'oxlint'
import vueEslint from './plugin.ts'

export default defineConfig({
  categories: { correctness: 'off' },
  jsPlugins: [{ name: 'vue-eslint', specifier: './plugin.ts' }],
  extends: [vueEslint.configs['flat/recommended']],
})
