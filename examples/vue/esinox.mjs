import tsParser from '@typescript-eslint/parser'
import { createEsinoxPlugin } from 'esinoxc'
import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

export default createEsinoxPlugin({
  name: 'vue-eslint',
  plugin: vue,
  languageOptions: { parser: vueParser, parserOptions: { parser: tsParser } },
})
