type AnyObject = Record<string | number, any>
/**
 * JSON.parse string safely
 * @param json string
 * @param faileValue any
 * @returns any
 */
export function safeJsonParse<T = AnyObject>(json?: string): T | undefined
export function safeJsonParse<T = AnyObject>(json: string | undefined, faileValue: T): T
export function safeJsonParse<T = AnyObject>(json = '', faileValue?: T) {
  try {
    return JSON.parse(json) as T
  } catch (_e) {
    return faileValue
  }
}

/** 
 * check value whether empty text
 * 判断给定变量是否是字面量空值 */
export const isNullable = (value: unknown): value is '' | null | undefined =>
  value === '' || value === undefined || value === null


/**
 * 过滤对象中属性为空（'' | undefined | null）的字段
 * @param obj 给定对象
 * @param deep 是否需要递归过滤
 * @returns 过滤后的对象
 */
 export const filterNullable = <T extends AnyObject>(obj: T, deep?: boolean) => {
  const result: Record<string, NonNullable<any>> = {}
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    if (value !== '' && value !== undefined && value !== null) {
      result[key] = deep && Object.prototype.toString.call(value) === '[object Object]' ? filterNullable(value) : value
    }
  })
  return result as T
}

const { toString } = Object.prototype
/**
 * 将对象中属性值为null的转换为undefined
 * @param data 对象数据
 * @returns 
 */
export const switchNullToUndefined = (data: any): any => {
  if (data === null) {
    return undefined
  }
  if (Array.isArray(data)) {
    return data.map(switchNullToUndefined)
  } else if (toString.call(data) === '[object Object]') {
    Object.keys(data).forEach((key: string) => {
      data[key] = switchNullToUndefined(data[key])
    })
  }
  return data
}

/**
 * 参数转换规则的配置对象
 * 值可以是时间范围转换所需的开始，结束时间字段的名称，或者需要进行拼接的数组
 */
export type ParamsSwitchMaps<DK extends string = string, RK extends string = string> = Record<
   DK,
   [RK, RK] | [RK, RK, string] | 'join' | 'pop'
 >
/**
 * 将搜素条件里的数组字段转换为其他格式，通常用于搜索表单的字段转换
 * @param formData 传入参数
 * @param maps 转换的映射关系，eg：{ date: ['startTime', 'endTime'] }
 * @param filterNullableValue 是否需要过滤掉空数据项
 */
export const formParamsSwitch = <T extends AnyObject, R extends AnyObject = AnyObject>(
  formData: T,
  maps: ParamsSwitchMaps,
  options?: {
    filterNullable: boolean
    dateFormat: (date: unknown, format?: string) => string
  }
) => {
  const dateKeys = Object.keys(maps)
  const dateData: AnyObject = {}
  const restData: AnyObject = {}
  Object.keys(formData).forEach(key => {
    if (dateKeys.includes(key)) {
      dateData[key] = formData[key]
    } else {
      restData[key] = formData[key]
    }
  })
  const accessKeys = Object.keys(dateData)
  // 如无需要转换的数据时，直接返回原对象
  if (accessKeys.length === 0) {
    return (formData as unknown) as R
  }
  const { filterNullable: filterNullableValue, dateFormat } = { filterNullable: true, ...options }
  const handleData = accessKeys.reduce((acc, key) => {
    const values = dateData[key]
    if (!values) {
      return acc
    }
    const mapValue = maps[key]
    // 数组合并操作/取最后一位操作
    if (mapValue === 'join' || mapValue === 'pop') {
      if (Array.isArray(values) && values.length) {
        acc[key] = mapValue === 'join' ? values.join(',') : values.slice(-1)[0]
      }
    } else if (mapValue.length === 2 || mapValue.length === 3) {
      if (!values || values.length !== 2) {
        return acc
      }
      const [startKey, endKey, format] = mapValue
      const [startValue, endValue] = values as [string, string]
      Object.assign(acc, {
        [startKey]: dateFormat instanceof Function ? dateFormat(startValue, format) : startValue,
        [endKey]: dateFormat instanceof Function ? dateFormat(endValue, format) : endValue
      })
    }
    return acc
  }, {} as AnyObject)
  const result = ({
    ...restData,
    ...handleData
  } as unknown) as R
  return filterNullableValue ? filterNullable(result) : result
}
