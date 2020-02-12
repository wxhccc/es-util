interface Options {
    standard?: 'metric' | 'iec' | 'jedec';
    unitLvl?: string;
    precision?: number;
    detail?: boolean;
}
export declare function byteStringify(byteNum: number | string, options?: Options): string | {
    value: string | number;
    unit: string;
};
export declare function byteParse(byteStr: string, options?: {}): void;
export {};
