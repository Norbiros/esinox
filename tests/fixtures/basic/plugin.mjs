import { createEsinoxPlugin } from '../../../src/index.ts'
import basic from '../../plugins/basic.mjs'

export default createEsinoxPlugin({ name: 'basic', plugin: basic })
