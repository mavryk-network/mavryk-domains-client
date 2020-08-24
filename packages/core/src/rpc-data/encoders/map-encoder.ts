import { MichelsonMap } from '@taquito/taquito';

import { TypedRpcDataEncoder } from '../data-encoder';
import { RecordMetadata } from '../record-metadata';

export class MapEncoder implements TypedRpcDataEncoder<RecordMetadata, MichelsonMap<string, string>> {
    encode(value: RecordMetadata | null): MichelsonMap<string, string> | null {
        if (!value) {
            return null;
        }

        const map = new MichelsonMap<string, string>({ prim: 'map', args: [{ prim: 'string' }, { prim: 'bytes' }] });

        const rawValues = value.raw();

        Object.keys(rawValues).forEach(k => {
            map.set(k, rawValues[k]);
        });

        return map;
    }

    decode(value: MichelsonMap<string, string> | null): RecordMetadata | null {
        if (!value) {
            return null;
        }

        const record = new RecordMetadata();
        value.forEach((v, k) => {
            record.set(k, v);
        });

        return record;
    }
}
