const axios = require('axios');
const data = require('../../data/CryptoMetaData.json')

if (process.env.NODE_ENV !== 'production') {
  const dotenv = require('dotenv');
  const result = dotenv.config();
  if (result.error) {
      throw result.error;
  }
}

const { 
  COINMARKETCAP_URL, 
  COINMARKETCAP_HEADER_KEY, 
  COINMARKETCAP_API_KEY,
  COINGECKO_URL,
  NEWSDATAIO_API_URL,
  NEWSDATAIO_API_KEY 
} = process.env

const getRange = require('../../utils/getRange')
const formatChartData = require('../../utils/formatChartData');
const replaceSlug = require('../../utils/replaceSlugs');

const resolvers = {
  Query: {
    trending: (parent, { limit }) => {
      return axios.get(`${COINMARKETCAP_URL}/cryptocurrency/listings/latest?limit=${limit}`, {
        headers: {
          [COINMARKETCAP_HEADER_KEY]: COINMARKETCAP_API_KEY
        }
      })
      .then(res => res.data.data)
      .catch(error => console.log(error))
    },
    metaData: (parent, { slugs }) => {
      const allMetadata = [...data];
      const cryptoMetadata = []
      slugs.forEach((slug) => cryptoMetadata.push(       
          allMetadata
          .filter((data) => data.slug === slug)
          .map(data => ({
            slug,
            logo: data.logo,
            description: data.description,
            url: data.urls[0]
          }))[0]
        )
      );
      return cryptoMetadata;    
    },
    chartData: async (parent, { slugs, range }) => {
      const { start, end } = getRange(range);
      const allChartData = [];
      for await (let slug of slugs) {
        let newSlug = replaceSlug(slug);
        const chartData = await axios.get(`${COINGECKO_URL}/coins/${newSlug}/market_chart/range?vs_currency=usd&from=${start}&to=${end}`)
          .then(res => res.data.prices)
          .then(data => formatChartData(data))
          .catch(error => console.log(error))
        allChartData.push({
          slug,
          chartData
        })
      }
      return allChartData;
    },
    search: async (parent, { query }) => {
      allCryptoData = [...data];
      const rawResults = allCryptoData.filter(item => (
        (item.name.startsWith(query) || item.symbol.startsWith(query.toUpperCase()))
      ));
      const results = rawResults.length > 0 ? 
        rawResults.map(result => ({ 
          name: result.name,
          symbol: result.symbol,
          logo: result.logo
        })) 
      : 
        [{name: "No results found", symbol: null}]
      const symbols = results.map(result => result.symbol);
      const priceData = await axios.get(`${COINMARKETCAP_URL}/cryptocurrency/quotes/latest?symbol=${symbols}`, {
          headers: {
            [COINMARKETCAP_HEADER_KEY]: COINMARKETCAP_API_KEY
          }
        })
        .then(res => res.data.data)
        .then(data => Object.keys(data).map((key, i) => ({
          symbol: symbols[i],
          price: data[key].quote.USD.price,
          percent_change_24h: data[key].quote.USD.percent_change_24h,
          volume_24h: data[key].quote.USD.volume_24h
        })))
        .catch(err => console.log(err))
      const resultsWithPriceData = results.map((result, i) => ({
        name: result.name,
        symbol: result.symbol,
        logo: result.logo,
        price: priceData[i].price,
        percent_change_24h: priceData[i].percent_change_24h,
        volume_24h: priceData[i].volume_24h
      }))
      return resultsWithPriceData;
    },
    news: async () => {
      return axios.get(`${NEWSDATAIO_API_URL}${NEWSDATAIO_API_KEY}&q=cryptocurrency&country=us&language=en`)
        .then(results => results.data.results)
    }
  },
}

module.exports = resolvers;


