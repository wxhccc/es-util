import { isArr } from '../utils'
interface UnitItem {
  expMax: number
  units: {
    metric: string
    iec: string
    jedec: string
  }
}
//
const configCreater = (standard: string, unit: string) => {
  const unitMap: { [key: string]: UnitItem } = {
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
  const standBase: { [key: string]: number } = {
    metric: 1000,
    iec: 1024,
    jedec: 1024
  }
  return {
    base: standBase[standard] || standBase['jedec'],
    unitMap: unitMap[unit] || Object.values(unitMap)
  }
}
interface Options {
  standard?: 'metric' | 'iec' | 'jedec'
  unitLvl?: string
  precision?: number
  detail?: boolean
}
type StrOrNum = number | string
// translate byte num to string
export function byteStringify(
  byteNum: StrOrNum,
  options?: Options & { detail?: false }
): string
export function byteStringify(
  byteNum: StrOrNum,
  options: Options & { detail: true }
): { value: StrOrNum; unit: string }
export function byteStringify(byteNum: StrOrNum, options?: Options) {
  const opts = Object.assign(
    {
      standard: 'jedec',
      unitLvl: 'auto',
      precision: 1,
      detail: false
    },
    options
  )
  const { standard, unitLvl, precision, detail } = opts
  let byteNumber = parseFloat(<string>byteNum)
  if (!Number.isFinite(byteNumber)) return
  const negative = byteNumber < 0 ? -1 : 1
  byteNumber = Math.abs(byteNumber)
  const { base, unitMap } = configCreater(standard, unitLvl)
  const getValue = (value: number) =>
    Number.isInteger(value) ? value : value.toFixed(precision)
  let resUnit = ''
  let resValue: number | string = 0
  if (!isArr(unitMap)) {
    const maxValue = Math.pow(base, unitMap.expMax)
    resUnit = unitMap.units[standard]
    const value = byteNumber / maxValue
    resValue = getValue(value * negative)
  } else {
    unitMap.some((item) => {
      const maxValue = Math.pow(base, item.expMax)
      const value = byteNumber / maxValue
      if (value > base) return false
      resUnit = item.units[standard]
      resValue = getValue(value * negative)
      return true
    })
  }
  return detail ? { value: resValue, unit: resUnit } : `${resValue} ${resUnit}`
}
