import { TypedRpcDataEncoder } from '../data-encoder';
import { encodeString, decodeString, safeJsonParse } from '../../utils/convert';

export class JsonBytesEncoder implements TypedRpcDataEncoder<any, string> {
    encode(value: any): string | null {
        if (!value) {
            return null;
        }

        return encodeString(JSON.stringify(value));
    }

    decode(value: string | null): any {
        if (!value) {
            return null;
        }

        return safeJsonParse(decodeString(value));
    }
}
