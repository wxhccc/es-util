export const objForEch = <T extends { [key: string]: any }, K extends string = Extract<keyof T, 'string'>>(obj: T, callbackfn: (key: K, value: T[K], index: number) => void) => {
  (Object.keys(obj) as K[]).forEach((key, index) => callbackfn(key, obj[key], index))
}