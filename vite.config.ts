import { defineConfig } from 'vite-plus'

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
    categories: { correctness: 'error', suspicious: 'error', perf: 'error' },
    options: { typeAware: true, typeCheck: true, denyWarnings: true },
  },
  fmt: { singleQuote: true, semi: false },
  test: { include: ['tests/**/*.test.ts'] },
  staged: {
    '*': 'vp check --fix',
  },
})
