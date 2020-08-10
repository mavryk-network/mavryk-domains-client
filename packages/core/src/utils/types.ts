export type Constructable<T> = new (...args: unknown[]) => T;
export type Exact<T> = { [K in keyof T]: T[K] };
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
export type Unpromise<T> = T extends Promise<infer U> ? U : T;