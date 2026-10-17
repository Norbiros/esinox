import { readdirSync } from 'node:fs'
import { extname, join } from 'node:path'
import { expect, test } from 'vite-plus/test'
import { ROOT, runOxlint } from './oxlint.ts'

const FIXTURES = join(ROOT, 'tests/fixtures')

for (const group of readdirSync(FIXTURES)) {
  const dir = join(FIXTURES, group)

  for (const file of readdirSync(join(dir, 'input'))) {
    const input = join('input', file)
    const output = (name: string) => join(dir, 'output', name)
    const base = file.slice(0, -extname(file).length)

    test(`fixture: ${group}/${file}`, async () => {
      await expect(runOxlint(dir, [input])).toMatchFileSnapshot(output(`${base}.md`))
    })
  }
}
