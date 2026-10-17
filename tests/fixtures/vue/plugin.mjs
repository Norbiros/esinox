import vue from 'eslint-plugin-vue'
import { createEsinoxPlugin } from '../../../src/index.ts'
import mini from '../../plugins/mini.mjs'

export default createEsinoxPlugin({ name: 'mini', plugin: mini, config: vue.configs['flat/base'] })
