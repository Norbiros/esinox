import type { Context, Diagnostic, Plugin, Range, Rule } from '@oxlint/plugins'
import type { ESLint } from 'eslint'
import { readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { Linter } from 'eslint'

export interface EsinoxOptions {
  /** Must match the alias the plugin is loaded under in `jsPlugins`. */
  name: string
  plugin: ESLint.Plugin
  languageOptions?: Linter.LanguageOptions
}

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

export function createEsinoxPlugin(options: EsinoxOptions): Plugin {
  const rules: Record<string, Rule> = {}

  for (const [ruleName, rule] of Object.entries(options.plugin.rules ?? {})) {
    const ruleId = `${options.name}/${ruleName}`
    rules[ruleName] = {
      meta: { schema: rule.meta?.schema },
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

  return { meta: { name: options.name }, rules }
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
    for (const message of runEslint(context.cwd, current.filename, text, options, rules)) {
      if (message.ruleId === null) continue
      const list = diagnostics.get(message.ruleId) ?? []
      list.push(toDiagnostic(message, lineStarts))
      diagnostics.set(message.ruleId, list)
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
      {
        files: [`**/*${extname(filename)}`],
        plugins: { [options.name]: options.plugin },
        languageOptions: options.languageOptions ?? {},
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
  }
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

function toOffset(lineStarts: number[], line: number, column: number): number {
  return (lineStarts[line - 1] ?? 0) + column - 1
}
