import tsParser from '@typescript-eslint/parser'
import { createEsinoxPlugin } from 'esinoxc'
import vue from 'eslint-plugin-vue'

export default createEsinoxPlugin({
  name: 'vue-eslint',
  plugin: vue,
  config: [
    ...vue.configs['flat/base'],
    { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: tsParser } } },
  ],
})
