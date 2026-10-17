import vue from 'eslint-plugin-vue'
import { createEsinoxPlugin } from '../../../src/index.ts'

export default createEsinoxPlugin({
  name: 'vue-eslint',
  plugin: vue,
  config: vue.configs['flat/base'],
})
