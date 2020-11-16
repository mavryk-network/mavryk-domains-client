import { normalizeDomainName } from '../../utils/convert';
import { BytesEncoder } from './bytes-encoder';

export class NormalizeBytesEncoder extends BytesEncoder {
    encode(value: string | null): string | null {
        if (!value) {
            return null;
        }

        return super.encode(normalizeDomainName(value));
    }

    decode(value: string | null): string | null {
        return super.decode(value);
    }
}
