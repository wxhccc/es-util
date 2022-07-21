export type TimeUnitShort = 'd' | 'h' | 'm' | 's'

export interface DurationDetail {
  d?: number
  h?: number
  m?: number
  s: number
}
/**
 * 将秒数转换为时间段对象
 * @param number 秒数
 * @param maxUnit 最大的单位，默认是小时
 * @returns DurationDetail
 */
export const secondsToDuration = (number: number, maxUnit: Exclude<TimeUnitShort, 's'> = 'h') => {
  const secNum = Number.isInteger(number) ? number : Math.round(number)
  const result: DurationDetail = { s: secNum % 60 }

  switch (maxUnit) {
    case 'm':
      result.m = Math.floor(secNum / 60)
      break
    case 'h':
      result.m = Math.floor((secNum % 3600) / 60)
      result.h = Math.floor(secNum / 3600)
      break
    case 'd':
      result.m = Math.floor((secNum % 3600) / 60)
      result.h = Math.floor((secNum % (3600 * 24)) / 3600)
      result.d = Math.floor(secNum / 3600 / 24)
      break
  }
  return result
}
