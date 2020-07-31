export interface RpcDataEncoder {
    encode(value: unknown): unknown;
    decode(value: unknown): unknown;
}

export interface TypedRpcDataEncoder<TSource, TTarget> extends RpcDataEncoder {
    encode(value: TSource | null): TTarget | null;
    decode(value: TTarget | null): TSource | null;
}
