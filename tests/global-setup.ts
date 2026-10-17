import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { ROOT } from './oxlint.ts'

// Examples import the built package, like users do, so it must be up to date.
export default function setup(): void {
  execFileSync(join(ROOT, 'node_modules/.bin/vp'), ['pack'], { cwd: ROOT })
}
