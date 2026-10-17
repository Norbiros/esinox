import { defineConfig } from 'oxlint'
import vueEslint from './esinox.ts'

export default defineConfig({
  jsPlugins: [{ name: 'vue-eslint', specifier: './esinox.ts' }],
  extends: [vueEslint.configs['flat/recommended']],
})
