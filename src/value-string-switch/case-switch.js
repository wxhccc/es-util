/**
 * Camelize a hyphen-delimited or undercore string.
 * 短横线转驼峰
 */
const camelizeRE = /[-_](\w)/g

export function camelize (string) {
  return string.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
}

const hyphenateRE = /\B([A-Z])/g
/**
 * Hyphenate or undercore a camelCase string.
 * 驼峰转短横线
 */
export function hyphenate (string) {
  return string.replace(hyphenateRE, '-$1').toLowerCase()
}

export function camel2snake (string) {
  return string.replace(hyphenateRE, '_$1').toLowerCase()
}