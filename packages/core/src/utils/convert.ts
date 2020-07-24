export function encodeString(str: string): string {
    let result = '';
    const encoded = new TextEncoder().encode(str);
    for (let i = 0; i < encoded.length; i++) {
        const hexchar = encoded[i].toString(16);
        result += hexchar.length == 2 ? hexchar : '0' + hexchar;
    }
    return result;
}

export function decodeString(hexString: string): string {
    return new TextDecoder().decode(hexToArray(hexString));
}

export function hexToArray(hexString: string): Uint8Array {
    return new Uint8Array(hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
}

export interface RpcDataEncoder {
    encode(value: unknown): unknown;
    decode(value: unknown): unknown;
}

export interface TypedRpcDataEncoder<TSource, TTarget> extends RpcDataEncoder {
    encode(value: TSource | null): TTarget | null;
    decode(value: TTarget | null): TSource | null;
}

export function encode(encoder: RpcDataEncoder): (target: unknown, propertyKey: string) => void {
    return function (target: unknown, propertyKey: string) {
        let value: unknown;
        const getter = function () {
            return value;
        };
        const setter = function (newVal: unknown) {
            value = encoder.encode(newVal);
        };

        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
        });
    };
}

export function decode(encoder: RpcDataEncoder): (target: unknown, propertyKey: string) => void {
    return function (target: unknown, propertyKey: string) {
        let value: unknown;
        const getter = function () {
            return value;
        };
        const setter = function (newVal: unknown) {
            value = encoder.decode(newVal);
        };

        Object.defineProperty(target, propertyKey, {
            get: getter,
            set: setter,
        });
    };
}

export class StringEncoder implements TypedRpcDataEncoder<string, string> {
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

export class DateEncoder implements TypedRpcDataEncoder<Date, string> {
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

export const encoders = {
    string: new StringEncoder(),
    date: new DateEncoder()
}
