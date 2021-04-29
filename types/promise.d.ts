export declare const objType: (val: unknown) => string;
/**
 * wrap promise and handle reject or err by return an array like [error, undefined]
 * @param promise promise
 * @returns Promise<[K, undefined] | [null, T]>
 */
declare type WarpperReturn<T, K> = [null, T] | [K, undefined];
export declare function awaitWrapper<T, K = Error, P = Promise<WarpperReturn<T, K>>>(promise: Promise<T>): Promise<[null, T] | [K, undefined]>;
export declare type SyncRefHandle = [Record<string, boolean>, string];
export declare type LockSwitchHook = (val: boolean) => unknown;
export interface LockMethod<T> {
    (key: string): Promise<T>;
    (syncRefHandle: SyncRefHandle): Promise<T>;
    (switchHook: LockSwitchHook, syncRefHandle?: [Record<string, boolean>, string]): Promise<T>;
}
export interface PromiseWithLock<T> extends Promise<T> {
    lock: LockMethod<T>;
}
export declare type ContextType = 'react' | 'vue' | 'unknown';
export declare function wpl<T>(this: any, promise: Promise<T>, wrap?: boolean): PromiseWithLock<T | [null, T] | [Error, undefined]>;
export {};
