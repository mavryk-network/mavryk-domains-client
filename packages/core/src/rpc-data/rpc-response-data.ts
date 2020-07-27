import { Constructable } from '../utils/types';
import { RpcDataEncoder } from './data-encoder';

export class RpcResponseData {
    constructor(private rawValue: unknown | null) {}

    scalar<T>(encoder?: Constructable<RpcDataEncoder>): T | null {
        if (!encoder) {
            return this.rawValue as T;
        }

        const encoderInstance = new encoder();

        return encoderInstance.decode(this.rawValue) as T;
    }

    decode<T>(type: Constructable<T>): T | null {
        if (!this.rawValue) {
            return null;
        }

        const result = new type();

        Object.assign(result, this.rawValue);

        return result;
    }
}
