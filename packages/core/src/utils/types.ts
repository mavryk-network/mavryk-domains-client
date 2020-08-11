export type Constructable<T> = new (...args: unknown[]) => T;
export type Exact<T> = { [K in keyof T]: T[K] };