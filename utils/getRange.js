const formatUnix = unix => {
  let unixStr = unix.toString();
  let newUnixStr = unixStr.slice(0, -3);
  let newUnixNum = parseInt(newUnixStr);
  return newUnixNum
}

const getRange = (range) => {
  let durationUnit = range.charAt(range.length-1);
  let durationNum = parseInt(range)
  let durationMultiplier;
  switch (durationUnit) {
    case 'H':
    case 'h':
      durationMultiplier = 1;
      break;
    case 'D':
    case 'd':
      durationMultiplier = 24;
      break;
    case 'M':
    case 'm':
      durationMultiplier = 24*30;
      break;
    case 'Y':
    case 'y':
      durationMultiplier = 24*30*12;
      break;
    default:
      console.log('Invalid range unit entered. Please Enter H,D,M,Y,h,d,m,y')
      break;
  }
  let end = formatUnix(new Date().getTime());
  let start = end - (durationNum * durationMultiplier * 3600);
  // console.log(start, end);
  return {start, end}
}

module.exports = getRange