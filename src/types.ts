export type AnyObject = { [key: string]: any }

export type AnyFunction<T = any> = (...args: any[]) => T
