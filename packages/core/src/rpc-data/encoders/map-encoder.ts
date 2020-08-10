import { MichelsonMap } from '@taquito/taquito';

import { TypedRpcDataEncoder } from '../data-encoder';
// import { encodeString, decodeString } from '../../utils/convert';
// TODO: implement serialization of values

export class MapEncoder implements TypedRpcDataEncoder<Record<string, string>, MichelsonMap<string, string>> {
    encode(value: Record<string, string> | null): MichelsonMap<string, string> | null {
        if (!value) {
            return null;
        }

        const map = new MichelsonMap<string, string>();

        return map;
    }

    decode(value: MichelsonMap<string, string> | null): Record<string, string> | null {
        if (!value) {
            return null;
        }

        const record = {};

        return record;
    }
}
