import { TypedRpcDataEncoder } from '../data-encoder';
import { encodeString, decodeString } from '../../utils/convert';

export class BytesEncoder extends TypedRpcDataEncoder<string, string> {
    encode(value: string | null): string | null {
        if (!value) {
            return null;
        }

        return encodeString(value);
    }

    decode(value: string | null): string | null {
        if (!value) {
            return null;
        }

        return decodeString(value);
    }
}
