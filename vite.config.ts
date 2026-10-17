import { defineConfig } from 'vite-plus'

// Kept byte for byte and linted by their own configs in the tests.
const fixtureInputs = ['tests/fixtures/*/*.js', 'tests/fixtures/*/*.vue']

export default defineConfig({
  pack: {
    dts: true,
    exports: true,
    publint: true,
    attw: true,
    failOnWarn: true,
    // tsgo emits this integration notice even when declaration generation succeeds.
    suppressWarnings: [
      /^TypeScript 7\.0 does not yet have a stable API and is experimental\. Some options will be unavailable\.$/,
    ],
  },
  lint: {
    // Example sources are intentionally faulty.
    ignorePatterns: ['examples/*/src/**', ...fixtureInputs],
    categories: { correctness: 'error', suspicious: 'error', perf: 'error' },
    options: { typeAware: true, typeCheck: true, denyWarnings: true },
  },
  fmt: { singleQuote: true, semi: false, ignorePatterns: ['**/*.snap.md', ...fixtureInputs] },
  test: { include: ['tests/**/*.test.ts'], globalSetup: ['tests/global-setup.ts'] },
  staged: {
    '*': 'vp check --fix',
  },
})
