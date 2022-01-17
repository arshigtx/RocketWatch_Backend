const mergeArrs = (...args) => {
  return args.reduce((a, b) => a.map((v, i) => ({...v, ...b[i]}) ))
}

module.exports = mergeArrs