const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mergeResolvers } = require('@graphql-tools/merge');

const { typeDefs, resolvers } = require('./cryptos');

const schema = makeExecutableSchema({
  typeDefs,
  resolvers: mergeResolvers(resolvers)
})

module.exports = schema