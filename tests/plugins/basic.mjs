// A tiny ESLint plugin for fixtures, so their output does not depend on real plugins' messages.
export default {
  rules: {
    'no-foo': {
      meta: { fixable: 'code' },
      create: (context) => ({
        Identifier(node) {
          if (node.name === 'foo')
            context.report({
              node,
              message: 'Unexpected foo.',
              fix: (fixer) => fixer.replaceText(node, 'bar'),
            })
        },
      }),
    },
    'no-name': {
      meta: {
        schema: [{ type: 'string' }],
        hasSuggestions: true,
        messages: { unexpected: 'Unexpected {{name}}.', rename: 'Rename to {{name}}2.' },
      },
      create: (context) => ({
        Identifier(node) {
          if (node.name === context.options[0])
            context.report({
              node,
              messageId: 'unexpected',
              data: { name: node.name },
              suggest: [
                {
                  messageId: 'rename',
                  data: { name: node.name },
                  fix: (fixer) => fixer.insertTextAfter(node, '2'),
                },
              ],
            })
        },
      }),
    },
    // Like `unicorn/no-abusive-eslint-disable`, which reports before the first column.
    'no-file-start': {
      create: (context) => ({
        Program() {
          context.report({ loc: { line: 1, column: -1 }, message: 'Unexpected file start.' })
        },
      }),
    },
  },
}
