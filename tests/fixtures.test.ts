import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { ROOT, runOxlint } from './oxlint.ts'

const FIXTURES = join(ROOT, 'tests/fixtures')

for (const group of readdirSync(FIXTURES)) {
  const dir = join(FIXTURES, group)

  for (const file of readdirSync(dir)) {
    if (file.startsWith('.') || file === 'plugin.mjs' || file.endsWith('.snap.md')) continue

    test(`fixture: ${group}/${file}`, async () => {
      await expect(runOxlint(dir, [file])).toMatchFileSnapshot(join(dir, `${file}.snap.md`))
    })
  }
}
