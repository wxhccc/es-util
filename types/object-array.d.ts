declare type Obj = {
    [key: string]: any;
};
/**
 * translate object array to key-value map object
 *
 * @param {Object[]} objectArray
 * @param {string} keyProp
 * @param {string} valueProp
 */
interface PropHandler {
    (item: any, index: number): string;
}
export declare function mapToObject(objectArray: any[], keyProp?: string | PropHandler, valueProp?: string | PropHandler): Obj;
/**
 * checkout values form object as an array
 *
 * @param {Object} object
 * @param {string[] | Object} keys
 * @param {string} valueProp
 */
declare type MergeFn = <T>(...args: T[]) => T;
export declare function checkoutBy(object: Obj, keys?: string[] | Obj, mergeFn?: MergeFn): any[];
/**
 * pick and rename object values
 *
 * @param {Object} object
 * @param {Object} keysMap
 */
export declare function pickRenameKeys(object: Obj, keysMap: {
    [key: string]: string;
}): Obj | undefined;
export {};
