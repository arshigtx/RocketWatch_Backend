const gql = require('graphql-tag')

const typeDefs = gql`
  type Query {
    trending(limit: Int): [CryptoData],
    metaData(slugs: [String] ): [CryptoMetaData],
    chartData(slugs: [String], range: String): [CryptoChartData],
    search(query: String): [SearchResults],
  }

  type CryptoData {
    id: Int,
    name: String,
    symbol: String,
    slug: String,
    quote: Quote
  }

  type Quote {
    USD: PriceData
  }

  type PriceData {
    price: Float,
    percent_change_24h: Float,
    volume_24h: Float,    
  }

  type CryptoMetaData {
    slug: String,
    logo: String,
    description: String,
    url: String
  }

  type CryptoChartData {
    slug: String,
    chartData: [ChartData]
  }

  type ChartData {
    time: Float,
    price: Float
  }

  type SearchResults {
    name: String,
    symbol: String,
    logo: String,
    price: Float,
    percent_change_24h: Float,
    volume_24h: Float,      
  }

  `
  module.exports = typeDefs


