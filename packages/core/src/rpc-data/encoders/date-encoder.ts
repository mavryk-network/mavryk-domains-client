import { TypedRpcDataEncoder } from '../data-encoder';

export class DateEncoder extends TypedRpcDataEncoder<Date, string> {
    encode(value: Date | null): string | null {
        if (!value) {
            return null;
        }

        return value.toISOString();
    }

    decode(value: string | null): Date | null {
        if (!value) {
            return null;
        }

        return new Date(value);
    }
}
