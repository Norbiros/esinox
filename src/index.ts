import type { Plugin, Rule } from '@oxlint/plugins'
import type { ESLint, Linter } from 'eslint'

export interface EsinoxOptions {
  /** Must match the alias the plugin is loaded under in `jsPlugins`. */
  name: string
  plugin: ESLint.Plugin
  languageOptions?: Linter.LanguageOptions
}

export function createEsinoxPlugin(options: EsinoxOptions): Plugin {
  const rules: Record<string, Rule> = {}

  for (const ruleName of Object.keys(options.plugin.rules ?? {})) {
    rules[ruleName] = {
      create() {
        return {}
      },
    }
  }

  return { meta: { name: options.name }, rules }
}
