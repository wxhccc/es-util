export declare function awaitWrapper<T, K = Error>(promise: Promise<T>): Promise<[K, undefined] | [null, T]>;
