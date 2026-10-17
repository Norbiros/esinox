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
