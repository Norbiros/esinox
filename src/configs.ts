import type { Plugin } from '@oxlint/plugins'
import type { ESLint, Linter } from 'eslint'

export interface EsinoxPlugin<P extends ESLint.Plugin = ESLint.Plugin> extends Plugin {
  /** The wrapped plugin's flat configs, with its rules renamed to `name`, for oxlint's `extends`. */
  configs: Record<FlatConfigName<P>, OxlintRulesConfig>
}

export interface OxlintRulesConfig {
  rules: Linter.RulesRecord
}

type ConfigsOf<P extends ESLint.Plugin> = NonNullable<P['configs']>

// Legacy (eslintrc) configs name plugins by string, so their rules cannot be mapped.
type FlatConfigName<P extends ESLint.Plugin> = string extends keyof ConfigsOf<P>
  ? string
  : {
      [K in keyof ConfigsOf<P>]: ConfigsOf<P>[K] extends Linter.Config | Linter.Config[] ? K : never
    }[keyof ConfigsOf<P>]

export function toOxlintConfigs<P extends ESLint.Plugin>(
  name: string,
  plugin: P,
  baseConfig: Linter.Config[],
): EsinoxPlugin<P>['configs'] {
  // Base config rules already run inside ESLint, so enabling them under the alias runs them twice.
  const baseRules = new Set(Object.keys(toAliasedRules(name, plugin, baseConfig)))
  const configs: Record<string, OxlintRulesConfig> = {}

  for (const [configName, config] of Object.entries(plugin.configs ?? {})) {
    const rules = Object.entries(toAliasedRules(name, plugin, [config].flat()))
    configs[configName] = {
      rules: Object.fromEntries(rules.filter(([ruleId]) => !baseRules.has(ruleId))),
    }
  }
  // Legacy configs are present at runtime, with no rules, but excluded from the type.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return configs as EsinoxPlugin<P>['configs']
}

function toAliasedRules(
  name: string,
  plugin: ESLint.Plugin,
  configs: Array<Linter.Config | Linter.LegacyConfig>,
): Linter.RulesRecord {
  const prefixes = pluginPrefixes(plugin, configs)
  const rules: Linter.RulesRecord = {}

  for (const config of configs) {
    for (const [ruleId, entry] of Object.entries(config.rules ?? {})) {
      const slash = ruleId.lastIndexOf('/')
      if (entry !== undefined && prefixes.has(ruleId.slice(0, slash))) {
        rules[`${name}/${ruleId.slice(slash + 1)}`] = entry
      }
    }
  }
  return rules
}

function pluginPrefixes(
  plugin: ESLint.Plugin,
  configs: Array<Linter.Config | Linter.LegacyConfig>,
): Set<string> {
  return new Set(
    configs.flatMap((config) =>
      Object.entries(config.plugins ?? {})
        .filter(([, registered]) => registered === plugin)
        .map(([prefix]) => prefix),
    ),
  )
}
