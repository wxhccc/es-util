export interface MaskDataOptions {
  /** 替换的字符，默认为* */
  maskWith?: string
  /** 起始字符索引，为负数时从字符串结尾起倒数第几个数开始 */
  startCharIndex?: number
  /** 结束字符索引，包含在处理字符内，缺省时会替换到字符串结尾，为负数时从字符串结尾起倒数第几个数开始 */
  endCharIndex?: number
  /** 待处理字符串起始处理字符（串），不包含在待处理片段内 */
  startFrom?: string
  /** 待处理字符串结束处理字符（串），不包含在待处理片段内 */
  endUntil?: string
  /** 内置的默认的的处理模式，会预设一些属性值，属性值可以被覆盖 */
  mode?: 'telphone' | 'idcard'
}
const modeIndexs: Record<
  NonNullable<MaskDataOptions['mode']>,
  MaskDataOptions
> = {
  telphone: { startCharIndex: -8, endCharIndex: -5 },
  idcard: { startCharIndex: -12, endCharIndex: -5 }
}
/**
 * 对给定的字符串进行脱敏处理
 * @param data 需要处理的字符串
 * @param options 配置参数对象
 * @returns
 */
export function maskData(data: string, options?: MaskDataOptions) {
  if (typeof data !== 'string' || !data) {
    return ''
  }
  const modeOpts =
    options && options.mode && modeIndexs[options.mode]
      ? modeIndexs[options.mode]
      : {}
  const {
    maskWith,
    startCharIndex: start = 0,
    endCharIndex: end,
    startFrom,
    endUntil
  } = { maskWith: '*', ...modeOpts, ...options }
  let handleData = data
  let beforeChars = ''
  let afterChars = ''
  const startFromIndex = startFrom ? data.indexOf(startFrom) : -1
  if (startFromIndex > -1) {
    const index = startFromIndex + (startFrom as string).length
    handleData = handleData.slice(index)
    beforeChars = data.slice(0, index)
  }
  const endUtilIndex = endUntil ? data.lastIndexOf(endUntil) : -1
  if (endUtilIndex > -1) {
    handleData = handleData.slice(0, endUtilIndex)
    afterChars = data.slice(endUtilIndex)
  }
  const chars = handleData.split('')
  const newChars = [beforeChars]
  const charLen = chars.length
  const indexs = [
    start >= 0 ? start : charLen + start,
    end !== undefined ? (end >= 0 ? end : charLen + end) : charLen - 1
  ]
  let [startIdx, endIdx] = indexs
  endIdx = endIdx > 0 && endIdx < charLen ? endIdx : charLen - 1
  startIdx = startIdx >= 0 && startIdx <= endIdx ? startIdx : 0
  chars.forEach((char, idx) => {
    newChars.push(idx >= startIdx && idx <= endIdx ? maskWith : char)
  })
  newChars.push(afterChars)
  return newChars.join('')
}
