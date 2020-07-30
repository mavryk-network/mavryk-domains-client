export abstract class RpcDataEncoder {
    abstract encode(value: unknown): unknown;
    abstract decode(value: unknown): unknown;
}

export abstract class TypedRpcDataEncoder<TSource, TTarget> extends RpcDataEncoder {
    abstract encode(value: TSource | null): TTarget | null;
    abstract decode(value: TTarget | null): TSource | null;
}
