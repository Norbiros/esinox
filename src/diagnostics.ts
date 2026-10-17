import type { Diagnostic, FixFn, Range } from '@oxlint/plugins'
import type { Linter, Rule } from 'eslint'

// FIXME: `actualRange` comes from oxc#20501, which oxlint has not merged yet (#5).
export type ActualRangeDiagnostic = Diagnostic & { actualRange: Range }

export function computeLineStarts(text: string): number[] {
  const starts = [0]
  for (const match of text.matchAll(/\r\n|[\n\r\u2028\u2029]/g)) {
    starts.push(match.index + match[0].length)
  }
  return starts
}

export function toDiagnostic(
  message: Linter.LintMessage,
  lineStarts: number[],
): ActualRangeDiagnostic {
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
    fix: message.fix && toFixFunction(message.fix),
    suggest: message.suggestions?.map((suggestion) => ({
      desc: suggestion.desc,
      fix: toFixFunction(suggestion.fix),
    })),
  }
}

function toFixFunction({ range, text }: Rule.Fix): FixFn {
  return (fixer) => fixer.replaceTextRange(range, text)
}

// Some rules report before the first column, and oxlint rejects the whole file on a negative offset.
function toOffset(lineStarts: number[], line: number, column: number): number {
  return Math.max(0, (lineStarts[line - 1] ?? 0) + column - 1)
}
