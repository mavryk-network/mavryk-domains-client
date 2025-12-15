import { TypedRpcDataEncoder } from '@mavrykdynamics/mavryk-domains-core';

export class FakeEncoder implements TypedRpcDataEncoder<string, string> {
    encode(value: string | null): string | null {
        return value! + 'encoded';
    }
    decode(value: string | null): string | null {
        return value! + 'decoded';
    }
}
