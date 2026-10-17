// A tiny ESLint plugin for fixtures, so their output does not depend on real plugins' messages.
export default {
  rules: {
    'no-foo': {
      create: (context) => ({
        Identifier(node) {
          if (node.name === 'foo') context.report({ node, message: 'Unexpected foo.' })
        },
      }),
    },
    'no-name': {
      meta: { schema: [{ type: 'string' }] },
      create: (context) => ({
        Identifier(node) {
          if (node.name === context.options[0])
            context.report({ node, message: `Unexpected ${node.name}.` })
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
    'no-marquee': {
      create: (context) =>
        context.sourceCode.parserServices.defineTemplateBodyVisitor?.({
          'VElement[name="marquee"]'(node) {
            context.report({ node, message: 'Unexpected <marquee>.' })
          },
        }) ?? {},
    },
  },
}
