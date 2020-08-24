import { TypedRpcDataEncoder } from './data-encoder';
import { Constructable } from './../utils/types';
import { RpcResponseData } from './rpc-response-data';
import { RpcRequestScalarData } from './rpc-request-data';
import { JsonBytesEncoder } from './encoders/json-bytes-encoder';

export class RecordMetadata {
    private data: Record<string, string>;

    constructor(data?: Record<string, string>) {
        this.data = data || {};
    }

    /** @internal */
    raw(): Record<string, string> {
        return this.data;
    }

    get<T>(key: string, encoder?: Constructable<TypedRpcDataEncoder<T, unknown>>): T | null {
        return new RpcResponseData(this.data[key]).scalar(encoder);
    }

    set<T>(key: string, value: T, encoder?: Constructable<TypedRpcDataEncoder<T, string>>): void {
        const encodedValue = RpcRequestScalarData.fromValue(value, encoder).encode();
        if (encodedValue) {
            this.data[key] = encodedValue;
        } else {
            delete this.data[key];
        }
    }

    get ttl(): number | null {
        return this.get('ttl', JsonBytesEncoder);
    }
    set ttl(value: number | null) {
        this.set('ttl', value, JsonBytesEncoder);
    }
}
