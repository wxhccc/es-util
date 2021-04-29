export declare const objType: (val: unknown) => string;
/**
 * wrap promise and handle reject or err by return an array like [error, undefined]
 * @param promise promise
 * @returns Promise<[K, undefined] | [null, T]>
 */
export declare function awaitWrapper<T, K = Error>(promise: Promise<T>): Promise<[K, undefined] | [null, T]>;
export declare type SyncRefHandle = [Record<string, boolean>, string];
export declare type LockSwitchHook = (val: boolean) => unknown;
export interface LockMethod<T> {
    (key: string): PromiseWithLock<T>;
    (syncRefHandle: SyncRefHandle): PromiseWithLock<T>;
    (switchHook: LockSwitchHook, syncRefHandle?: [Record<string, boolean>, string]): PromiseWithLock<T>;
}
export interface PromiseWithLock<T> extends Promise<T> {
    lock: LockMethod<T>;
}
export declare type ContextType = 'react' | 'vue' | 'unknown';
export declare function wpl<T>(this: any, promise: Promise<T>, wrap?: boolean): PromiseWithLock<T> | Promise<[Error, undefined] | [null, T]>;
