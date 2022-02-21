const gql = require('graphql-tag')

const typeDefs = gql`
  type Query {
    getTopWinnersAndLosersList(limit: Int!, sortDir: String!, currency: String!, includeChartData: Boolean, range: String): [CryptoData],
    getCryptoData(slugs: [String]!, currency: String!, includeChartData: Boolean, range: String): [CryptoData],
    allCryptoListOffset(limit: Int!, offset: Int!, currency: String!, includeChartData: Boolean, range: String): [CryptoData],
    search(query: String!, currency: String!,): [CryptoData],
    chartData(slugs: [String]!, range: String!, currency: String!): [CryptoChartData],
    news: [CryptoNews],
  }

  type CryptoData {
    id: Int,
    name: String,
    symbol: String,
    slug: String,
    logo: String,
    description: String,
    url: String,
    price: Float,
    percent_change_24h: Float,
    volume_24h: Float,   
    direction: String,
    chartData: ChartData
    error: Boolean 
  }

  type CryptoChartData {
    slug: String,
    chartData: ChartData
  }

  type ChartData {
    time: [Float],
    price: [Float]
  }

  type CryptoNews {
    id: Int,
    title: String,
    pubDate: String,
    source_id: String,
    link: String,
  }
  `
  module.exports = typeDefs


