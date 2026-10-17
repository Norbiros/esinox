import { createEsinoxPlugin } from '../../../src/index.ts'
import mini from '../../plugins/mini.mjs'

export default createEsinoxPlugin({ name: 'mini', plugin: mini })
