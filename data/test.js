const cryptoRank = require('../data/test.json');
const cryptoMetaData = require('../data/cryptoMetaData.json');

exports.mergeDat = async () => {
  let newArr = [];
  cryptoRank.forEach((rank) => cryptoMetaData.some(test => rank.slug === test.slug) ? newArr.push(cryptoMetaData.find((metadata) => metadata.slug === rank.slug)) : null)
  return newArr
  // .map((data) => ({
  //   id: data.id,
  //   name: data.name,
  //   symbol: data.symbol,
  //   slug: data.slug,
  //   logo: data.logo,
  //   urls: data.urls[0],
  //   description: data.description
  // }))
}



