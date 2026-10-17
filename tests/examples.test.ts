import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { ROOT, runOxlint } from './oxlint.ts'

const EXAMPLES = join(ROOT, 'examples')

for (const example of readdirSync(EXAMPLES, { withFileTypes: true })) {
  if (!example.isDirectory()) continue

  test(`example: ${example.name}`, async () => {
    const dir = join(EXAMPLES, example.name)
    await expect(runOxlint(dir)).toMatchFileSnapshot(join(dir, 'output.snap.md'))
  })
}
