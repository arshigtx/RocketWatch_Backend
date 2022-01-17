const formatChartData = data => {
  const time = [];
  const price = [];
  data.forEach((item) => {
    time.push(item[0]);
    price.push(item[1])
  });
  return {time: [...time], price: [...price]};
}

module.exports = formatChartData