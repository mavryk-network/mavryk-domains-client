import { RecordMetadata, JsonBytesEncoder, BytesEncoder } from '@tezos-domains/core';
import { MapEncoder } from '@tezos-domains/taquito';
import { MichelsonMap } from '@taquito/taquito';

describe('MapEncoder', () => {
    let encoder: MapEncoder;

    beforeEach(() => {
        encoder = new MapEncoder();
    });

    describe('encode()', () => {
        it('should encode object', () => {
            const metadata = new RecordMetadata();
            metadata.set('a', 'val', BytesEncoder);
            metadata.set('b', 'val', JsonBytesEncoder);
            metadata.set('c', '71');
            metadata.set('d', '71');
            metadata.set('d', null);

            const map = encoder.encode(metadata)!;

            expect(map).toBeInstanceOf(MichelsonMap);
            expect(map.get('a')).toBe('76616c');
            expect(map.get('b')).toBe('2276616c22');
            expect(map.get('c')).toBe('71');
            expect(map.get('d')).toBeUndefined();
        });

        it('should return null for null', () => {
            expect(encoder.encode(null)).toBeNull();
        });
    });

    describe('decode()', () => {
        it('should decode string', () => {
            const map = new MichelsonMap<string, string>();

            map.set('a', '76616c');
            map.set('b', '2276616c22');
            map.set('c', 'raw');

            const metadata = encoder.decode(map)!;

            expect(metadata).toBeInstanceOf(RecordMetadata);
            expect(metadata.get('a', BytesEncoder)).toBe('val');
            expect(metadata.get('b', JsonBytesEncoder)).toBe('val');
            expect(metadata.get('c')).toBe('raw');
        });

        it('should return null for null', () => {
            expect(encoder.decode(null)).toBeNull();
        });
    });
});
