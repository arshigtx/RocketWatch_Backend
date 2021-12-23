const formatChartData = data => {
  const formattedData = data.map((item) => ({
    time: item[0],
    price: item[1]
  }));
  return formattedData;
}

module.exports = formatChartData