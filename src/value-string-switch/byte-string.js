const { hasOwnProperty } = Object.prototype
// 
const configCreater = (standard, unit) => {
  const unitMap = {
    B: { expMax: 0, units: { metric: 'B', iec: 'B', jedec: 'B' } },
    K: { expMax: 1, units: { metric: 'kB', iec: 'KiB', jedec: 'KB' } },
    M: { expMax: 2, units: { metric: 'MB', iec: 'MiB', jedec: 'MB' } },
    G: { expMax: 3, units: { metric: 'GB', iec: 'GiB', jedec: 'GB' } },
    T: { expMax: 4, units: { metric: 'TB', iec: 'TiB', jedec: 'TB' } },
    P: { expMax: 5, units: { metric: 'PB', iec: 'PiB', jedec: 'PB' } },
    E: { expMax: 6, units: { metric: 'EB', iec: 'EiB', jedec: 'EB' } },
    Z: { expMax: 7, units: { metric: 'ZB', iec: 'ZiB', jedec: 'ZB' } },
    Y: { expMax: 8, units: { metric: 'YB', iec: 'YiB', jedec: 'YB' } }
  }
  const standBase = { metric: 1000, iec: 1024, jedec: 1024 }
  return {
    base: standBase[standard] || standBase['jedec'],
    unitMap: unitMap[unit] || Object.values(unitMap)
  }
}
// translate byte num to string
export function byteStringify (byteNum, options) {
  const opts = Object.assign({
    standard: 'jedec',
    unitLvl: 'auto', 
    precision: 1,
    detail: false
  }, options || {})
  const { standard, unitLvl, precision, detail } = opts
  byteNum = parseFloat(byteNum)
  if (!Number.isFinite(byteNum)) return 
  const negative = byteNum < 0 ? -1 : 1
  byteNum = Math.abs(byteNum)
  const { base, unitMap } = configCreater(standard, unitLvl)
  const getValue = value => Number.isInteger(value) ? value : value.toFixed(precision)
  let resUnit = ''
  let resValue = 0
  if (!Array.isArray(unitMap)) {
    const maxValue = Math.pow(base, unitMap.expMax)
    resUnit = unitMap.units[standard]
    const value = byteNum / maxValue
    resValue = getValue(value * negative) 
  } else {
    unitMap.some(item => {
      const maxValue = Math.pow(base, item.expMax)
      const value = byteNum / maxValue
      if(value > base) return false
      resUnit = item.units[standard]
      resValue = getValue(value * negative)
      return true
    })
  }
  return detail ? { value: resValue, unit: resUnit } : `${resValue} ${resUnit}`
}
// translate string to byte num
export function byteParse (byteStr, options = {}) {
  
}
