const axios = require('axios');
const localMetaData = require('../../data/CryptoMetaData.json');
const newsData = require('../../data/NewsData.json')

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
const mergeArrs = require('../../utils/mergeArrays');

const resolvers = {
  Query: {
    getTopWinnersAndLosersList: async (parent, { limit, sortDir, includeChartData, range }) => {

      const pricedata = await axios.get(`${COINMARKETCAP_URL}/cryptocurrency/listings/latest?limit=${limit}&sort=percent_change_24h&sort_dir=${sortDir}&market_cap_min=750000000`, {
        headers: {
          [COINMARKETCAP_HEADER_KEY]: COINMARKETCAP_API_KEY
        }
      })
        .then(res => res.data.data.map(item => ({
          id: item.id,
          name: item.name,
          symbol: item.symbol,
          slug: item.slug,
          price: item.quote.USD.price,
          percent_change_24h: item.quote.USD.percent_change_24h,
          volume_24h: item.quote.USD.volume_24h,
          direction: item.quote.USD.percent_change_24h >= 0 ? 'up' : 'down',
        })))
        .catch(error => console.log(error));

      const metadata = [];
      
      pricedata.map(data => data.slug)
        .forEach((slug) => metadata.push(       
          [...localMetaData]
          .filter((data) => data.slug === slug)
          .map(data => ({
            logo: data.logo,
            description: data.description,
            url: data.urls[0]
          }))[0]
        )
      );

      if (includeChartData) {

        const { start, end } = getRange(range);
        const allChartData = [];
        const slugs = pricedata.map(data => data.slug);
  
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
        // console.log(chartData);

        const pricedataAndMetadataAndChartData = mergeArrs(pricedata, metadata, allChartData);
        return pricedataAndMetadataAndChartData;

      } else {

        const pricedataAndMetadata = mergeArrs(pricedata, metadata);
        return pricedataAndMetadata;

      }
    },
    getCryptoData: async (parent, { slugs, includeChartData, range }) => {

      const pricedata = await axios.get(`${COINMARKETCAP_URL}/cryptocurrency/quotes/latest?slug=${slugs}`, {
        headers: {
          [COINMARKETCAP_HEADER_KEY]: COINMARKETCAP_API_KEY
        }
      })
        .then(res => res.data.data)
        .then(data => Object.keys(data).map((key, i) => ({
          id: data[key].id,
          name: data[key].name,
          symbol: data[key].symbol,
          slug: data[key].slug,
          price: data[key].quote.USD.price,
          percent_change_24h: data[key].quote.USD.percent_change_24h,
          volume_24h: data[key].quote.USD.volume_24h,
          direction: data[key].quote.USD.percent_change_24h >= 0 ? 'up' : 'down'
        })));

      const metadata = [];
      
      pricedata.map(data => data.slug)
        .forEach((slug) => metadata.push(       
          [...localMetaData]
          .filter((data) => data.slug === slug)
          .map(data => ({
            logo: data.logo,
            description: data.description,
            url: data.urls[0]
          }))[0]
        )
      );

      if (includeChartData) {

        const { start, end } = getRange(range);
        const allChartData = [];
        const slugs = pricedata.map(data => data.slug);
  
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
        // console.log(chartData);

        const pricedataAndMetadataAndChartData = mergeArrs(pricedata, metadata, allChartData);
        return pricedataAndMetadataAndChartData;

      } else {

        const pricedataAndMetadata = mergeArrs(pricedata, metadata);
        return pricedataAndMetadata;

      }

    },
    allCryptoListOffset: async (parent, { limit, offset }) => {

      const cryptosToGet = [...localMetaData].slice(offset, offset+limit);
      const slugs = cryptosToGet.map(item => item.slug);

      const pricedata = await axios.get(`${COINMARKETCAP_URL}/cryptocurrency/quotes/latest?slug=${slugs}`, {
        headers: {
          [COINMARKETCAP_HEADER_KEY]: COINMARKETCAP_API_KEY
        }
      })
      .then(res => res.data.data)
        .then(data => slugs.map(slug => data[Object.keys(data).find((key) => data[key].slug === slug)]))
        .then(data => Object.keys(data).map((key) => ({
          price: data[key].quote.USD.price,
          percent_change_24h: data[key].quote.USD.percent_change_24h,
          volume_24h: data[key].quote.USD.volume_24h,
          direction: data[key].quote.USD.percent_change_24h >= 0 ? 'up' : 'down'
        })))
      .catch(err => console.log(err))

      const metadata = cryptosToGet.map((data) => ({
        id: data.id,
        name: data.name,
        symbol: data.symbol,
        slug: data.slug,
        logo: data.logo,
        description: data.description,
        url: data.urls[0]
      }))
      
      const pricedataAndMetadata = pricedata.map((data, i) => ({
        ...data,
        ...metadata[i],
      }))

      return pricedataAndMetadata;

    },
    search: async (parent, { query }) => {

      const results = [...localMetaData].filter(item => item.name.startsWith(query) || item.symbol.startsWith(query.toUpperCase()));
      const slugs = results.map(result => result.slug)
      
      if (results.length > 0) {

        const pricedata = await axios.get(`${COINMARKETCAP_URL}/cryptocurrency/quotes/latest?slug=${slugs}`, {
          headers: {
            [COINMARKETCAP_HEADER_KEY]: COINMARKETCAP_API_KEY
          }
        })
          .then(res => res.data.data)
          .then(data => slugs.map(slug => data[Object.keys(data).find((key) => data[key].slug === slug)]))
          .then(data => Object.keys(data).map((key) => ({
            price: data[key].quote.USD.price,
            percent_change_24h: data[key].quote.USD.percent_change_24h,
            volume_24h: data[key].quote.USD.volume_24h,
            direction: data[key].quote.USD.percent_change_24h >= 0 ? 'up' : 'down'
          })))
        .catch(err => console.log(err))

        const metadata = results.map((data) => ({
          id: data.id,
          name: data.name,
          symbol: data.symbol,
          slug: data.slug,
          logo: data.logo,
          description: data.description,
          url: data.urls[0],
          error: false
        }))
        
        const pricedataAndMetadata = pricedata.map((data, i) => ({
          ...data,
          ...metadata[i],
        }))
  
        return pricedataAndMetadata;

      } 
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
    /** pause this for now so we dont waste the API calls */
    // news: async () => {
    //   return axios.get(`${NEWSDATAIO_API_URL}${NEWSDATAIO_API_KEY}&q=cryptocurrency&country=us&language=en`)
    //     .then(results => results.data.results)
    // }
    news: async () => {
      return await newsData;
    }
  },
}

module.exports = resolvers;


