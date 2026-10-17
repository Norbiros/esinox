import type { Context, Diagnostic, FixFn, Plugin, Range, Rule } from '@oxlint/plugins'
import type { ESLint, Rule as ESLintRule } from 'eslint'
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { Linter } from 'eslint'

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

// Whole-file offsets from oxc#20501, not in the published types yet.
type ActualRangeDiagnostic = Diagnostic & { actualRange: Range }

interface Batch {
  filename: string
  section: string
  rules: Map<EsinoxOptions, Map<string, Context['options']>>
  diagnostics?: Map<string, ActualRangeDiagnostic[]>
}

// oxlint calls `create` of every enabled rule before walking the AST, so the batch is complete
// at the first `Program` visit.
let batch: Batch | undefined

export function createEsinoxPlugin<P extends ESLint.Plugin>(
  options: EsinoxOptions<P>,
): EsinoxPlugin<P> {
  const rules: Record<string, Rule> = {}

  for (const [ruleName, rule] of Object.entries(options.plugin.rules ?? {})) {
    const ruleId = `${options.name}/${ruleName}`
    rules[ruleName] = {
      meta: {
        schema: rule.meta?.schema,
        fixable: rule.meta?.fixable,
        hasSuggestions: rule.meta?.hasSuggestions,
      },
      create(context) {
        const current = enterBatch(context, options, ruleId)
        return {
          Program() {
            current.diagnostics ??= lintBatch(context, current)
            for (const diagnostic of current.diagnostics.get(ruleId) ?? []) {
              context.report(diagnostic)
            }
          },
        }
      },
    }
  }

  return { meta: { name: options.name }, rules, configs: toOxlintConfigs(options) }
}

function toOxlintConfigs<P extends ESLint.Plugin>(
  options: EsinoxOptions<P>,
): EsinoxPlugin<P>['configs'] {
  // Rules of the base config already run inside ESLint; enabling them under the alias too would
  // run them twice.
  const baseRules = new Set(Object.keys(toAliasedRules(options, options.config ?? [])))
  const configs: Record<string, OxlintRulesConfig> = {}

  for (const [configName, config] of Object.entries(options.plugin.configs ?? {})) {
    const rules = Object.entries(toAliasedRules(options, [config].flat()))
    configs[configName] = {
      rules: Object.fromEntries(rules.filter(([ruleId]) => !baseRules.has(ruleId))),
    }
  }
  // Keys come from `plugin.configs`. Legacy configs are included too, with no rules, but left out
  // of the type.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  return configs as EsinoxPlugin<P>['configs']
}

// A flat config names the plugin by the key it registers it under, e.g. `vue` in `vue/no-v-html`.
function toAliasedRules(
  options: EsinoxOptions,
  configs: Array<Linter.Config | Linter.LegacyConfig>,
): Linter.RulesRecord {
  const prefixes = new Set(
    configs.flatMap((config) =>
      Object.entries(config.plugins ?? {})
        .filter(([, plugin]) => plugin === options.plugin)
        .map(([prefix]) => prefix),
    ),
  )

  const rules: Linter.RulesRecord = {}
  for (const config of configs) {
    for (const [ruleId, entry] of Object.entries(config.rules ?? {})) {
      const slash = ruleId.lastIndexOf('/')
      if (entry !== undefined && prefixes.has(ruleId.slice(0, slash))) {
        rules[`${options.name}/${ruleId.slice(slash + 1)}`] = entry
      }
    }
  }
  return rules
}

function enterBatch(context: Context, options: EsinoxOptions, ruleId: string): Batch {
  const filename = context.physicalFilename
  const section = context.sourceCode.text
  if (!isOngoing(batch, filename, section, options, ruleId)) {
    batch = { filename, section, rules: new Map() }
  }

  const pluginRules = batch.rules.get(options) ?? new Map<string, Context['options']>()
  pluginRules.set(ruleId, context.options)
  batch.rules.set(options, pluginRules)
  return batch
}

function isOngoing(
  current: Batch | undefined,
  filename: string,
  section: string,
  options: EsinoxOptions,
  ruleId: string,
): current is Batch {
  return (
    current !== undefined &&
    current.diagnostics === undefined &&
    current.filename === filename &&
    current.section === section &&
    current.rules.get(options)?.has(ruleId) !== true
  )
}

function lintBatch(context: Context, current: Batch): Map<string, ActualRangeDiagnostic[]> {
  const diagnostics = new Map<string, ActualRangeDiagnostic[]>()
  const text = readFullText(context)
  if (!claimFileRun(current.filename, current.section, text)) return diagnostics

  const lineStarts = computeLineStarts(text)
  for (const [options, rules] of current.rules) {
    // A fatal error belongs to no rule, so it is reported through the first one to stay visible.
    const [firstRuleId] = rules.keys()
    for (const message of runEslint(context.cwd, current.filename, text, options, rules)) {
      const ruleId = message.fatal === true ? firstRuleId : message.ruleId
      if (ruleId === null || ruleId === undefined) continue
      const list = diagnostics.get(ruleId) ?? []
      list.push(toDiagnostic(message, lineStarts))
      diagnostics.set(ruleId, list)
    }
  }
  return diagnostics
}

// Each `<script>` section of a partially loaded file is a separate oxlint call; only the first one
// of a run lints the whole file.
const fileRuns = new Map<string, { text: string; sections: Set<string> }>()
// A file's sections run back to back on one oxlint thread, so only files in flight need an entry.
const MAX_FILE_RUNS = 256

function claimFileRun(filename: string, section: string, text: string): boolean {
  const run = fileRuns.get(filename)
  if (run !== undefined && run.text === text && !run.sections.has(section)) {
    run.sections.add(section)
    return false
  }

  fileRuns.delete(filename)
  fileRuns.set(filename, { text, sections: new Set([section]) })
  const oldest = fileRuns.keys().next().value
  if (fileRuns.size > MAX_FILE_RUNS && oldest !== undefined) fileRuns.delete(oldest)
  return true
}

function runEslint(
  cwd: string,
  filename: string,
  text: string,
  options: EsinoxOptions,
  rules: Map<string, Context['options']>,
): Linter.LintMessage[] {
  const ruleEntries: Linter.RulesRecord = {}
  for (const [ruleId, ruleOptions] of rules) {
    ruleEntries[ruleId] = ['error', ...ruleOptions]
  }

  const linter = new Linter({ cwd })
  return linter.verify(
    text,
    [
      ...(options.config ?? []),
      {
        files: [`**/*${extname(filename)}`],
        plugins: { [options.name]: options.plugin },
        // Most disable directives target oxlint's own rules, which this pass never runs.
        linterOptions: { reportUnusedDisableDirectives: false },
        rules: ruleEntries,
      },
    ],
    filename,
  )
}

function toDiagnostic(message: Linter.LintMessage, lineStarts: number[]): ActualRangeDiagnostic {
  const start = toOffset(lineStarts, message.line, message.column)
  const end = toOffset(
    lineStarts,
    message.endLine ?? message.line,
    message.endColumn ?? message.column,
  )
  return {
    message: message.message,
    // Required by the types; ignored when `actualRange` is supported.
    loc: { line: 1, column: 0 },
    actualRange: [start, end],
    // ESLint ranges index the same text as `actualRange`, so they need no conversion.
    fix: message.fix && toFixFn(message.fix),
    suggest: message.suggestions?.map((suggestion) => ({
      desc: suggestion.desc,
      fix: toFixFn(suggestion.fix),
    })),
  }
}

function toFixFn({ range, text }: ESLintRule.Fix): FixFn {
  return (fixer) => fixer.replaceTextRange(range, text)
}

// `actualText` is the editor buffer, exposed by the Norbiros/oxc build. oxlint offsets exclude a BOM.
function readFullText(context: Context): string {
  const { sourceCode } = context
  if ('actualText' in sourceCode && typeof sourceCode.actualText === 'string')
    return sourceCode.actualText
  return readFileSync(context.physicalFilename, 'utf8').replace(/^\uFEFF/, '')
}

function computeLineStarts(text: string): number[] {
  const starts = [0]
  for (const match of text.matchAll(/\r\n|[\n\r\u2028\u2029]/g)) {
    starts.push(match.index + match[0].length)
  }
  return starts
}

// Some rules report before the first column, and a negative offset makes oxlint fail the whole file.
function toOffset(lineStarts: number[], line: number, column: number): number {
  return Math.max(0, (lineStarts[line - 1] ?? 0) + column - 1)
}
