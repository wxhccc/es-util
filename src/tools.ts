export async function awaitWrapper<T, K = Error> (promise: Promise<T>): Promise<[K, undefined] | [null, T]> {
  try {
    const data: T = await promise;
    return [null, data];
  } catch (err) {
    return [err as K, undefined];
  }
}