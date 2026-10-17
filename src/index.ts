import type { Rule } from '@oxlint/plugins'
import type { ESLint, Linter } from 'eslint'
import { batchDiagnostics, joinBatch } from './batch.ts'
import { toOxlintConfigs, type EsinoxPlugin } from './configs.ts'

export type { EsinoxPlugin, OxlintRulesConfig } from './configs.ts'

export interface EsinoxOptions<P extends ESLint.Plugin = ESLint.Plugin> {
  /** Must match the alias the plugin is loaded under in `jsPlugins`. */
  name: string
  plugin: P
  /**
   * ESLint config the plugin needs to run, usually its base preset. Rules should not be
   * configured here, but in the oxlint config directly.
   */
  config?: Linter.Config[]
}

type ESLintRuleMeta = NonNullable<ESLint.Plugin['rules']>[string]['meta']

export function createEsinoxPlugin<P extends ESLint.Plugin>(
  options: EsinoxOptions<P>,
): EsinoxPlugin<P> {
  const rules: Record<string, Rule> = {}
  for (const [ruleName, rule] of Object.entries(options.plugin.rules ?? {})) {
    rules[ruleName] = wrapRule(options, `${options.name}/${ruleName}`, rule.meta)
  }

  return {
    meta: { name: options.name },
    rules,
    configs: toOxlintConfigs(options.name, options.plugin, options.config ?? []),
  }
}

function wrapRule(options: EsinoxOptions, ruleId: string, meta: ESLintRuleMeta): Rule {
  return {
    meta: {
      schema: meta?.schema,
      fixable: meta?.fixable,
      hasSuggestions: meta?.hasSuggestions,
    },
    create(context) {
      const batch = joinBatch(context, options, ruleId)
      return {
        // oxlint calls `create` of every enabled rule before walking the AST, so the batch is
        // complete at the first `Program` visit.
        Program() {
          for (const diagnostic of batchDiagnostics(context, batch, ruleId)) {
            context.report(diagnostic)
          }
        },
      }
    },
  }
}
