import { Constructable, Exact } from '../utils/types';
import { TypedRpcDataEncoder } from './data-encoder';

export abstract class RpcRequestData {
    abstract encode(): unknown;
    abstract get originalValue(): unknown;

    static fromValue<TSource, TTarget = TSource>(
        value: TSource,
        encoder?: Constructable<TypedRpcDataEncoder<TSource, TTarget>>
    ): RpcRequestScalarData<TSource, TTarget> {
        return new RpcRequestScalarData(value, encoder);
    }

    static fromObject<T>(type: Constructable<T>, data: Exact<T>): RpcRequestObjectData<T> {
        return new RpcRequestObjectData(type, data);
    }
}

export class RpcRequestScalarData<TSource, TTarget = TSource> extends RpcRequestData {
    constructor(private rawValue: TSource, private encoder?: Constructable<TypedRpcDataEncoder<TSource, TTarget>>) {
        super();
    }

    get originalValue(): TSource {
        return this.rawValue;
    }

    encode(): TTarget | null {
        if (this.encoder) {
            const encoderInstance = new this.encoder();

            return encoderInstance.encode(this.rawValue);
        }

        return (this.rawValue as unknown) as TTarget;
    }
}

export class RpcRequestObjectData<T> extends RpcRequestData {
    constructor(private type: Constructable<T>, private rawValue: Exact<T>) {
        super();
    }

    get originalValue(): Exact<T> {
        return this.rawValue;
    }

    encode(): T {
        const result = new this.type();

        Object.assign(result, this.rawValue);

        return result;
    }
}
