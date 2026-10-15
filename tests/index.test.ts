import type { ESLint } from 'eslint'
import { expect, test } from 'vite-plus/test'
import { createEsinoxPlugin } from '../src/index.ts'

const plugin: ESLint.Plugin = {
  rules: {
    'no-foo': {
      meta: { type: 'problem', schema: [], messages: { foo: 'No foo.' } },
      create: () => ({}),
    },
    'no-bar': {
      meta: { type: 'suggestion', schema: [{ type: 'string' }] },
      create: () => ({}),
    },
  },
}

test('exposes every rule of the wrapped plugin under the given name', () => {
  const wrapped = createEsinoxPlugin({ name: 'wrapped', plugin })

  expect(wrapped.meta?.name).toBe('wrapped')
  expect(Object.keys(wrapped.rules)).toEqual(['no-foo', 'no-bar'])
})
