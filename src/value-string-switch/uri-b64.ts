/**
 * 将字符串编码为base64, 采用encodeURIComponent+window.btoa，主要为了解决atob/btoa处理特殊字符会报错的问题，性能不如buffer方案，适用于简单场景
 * @param str 
 * @returns 
 */
export const b64UriEncode = (str: string) => window.btoa(encodeURIComponent(str))
/** b64UriEncode对应的解码函数 */
export const b64UriDecode = (str: string) => decodeURIComponent(window.atob(str))