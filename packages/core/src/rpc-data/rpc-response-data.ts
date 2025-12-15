import { Constructable } from '../utils/types';
import { cleanupResponse } from './cleanup-taquito-response';
import { TypedRpcDataEncoder } from './data-encoder';
export class RpcResponseData {
    constructor(private rawValue: unknown) {}

    scalar<TDecoded, TEncoded = unknown>(encoder?: Constructable<TypedRpcDataEncoder<TDecoded, TEncoded>>): TDecoded | null {
        if (!encoder) {
            return (this.rawValue || null) as TDecoded | null;
        }

        const encoderInstance = new encoder();

        return encoderInstance.decode(this.rawValue as TEncoded) as TDecoded;
    }

    decode<T>(type: Constructable<T>): T | null {
        if (!this.rawValue) {
            return null;
        }

        const result: any = new type();

        Object.assign(result, cleanupResponse(this.rawValue));

        return result;
    }
}
