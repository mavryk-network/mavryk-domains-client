import { MapEncoder } from '@tezos-domains/core';
import { MichelsonMap } from '@taquito/taquito';

describe('MapEncoder', () => {
    let encoder: MapEncoder;

    beforeEach(() => {
        encoder = new MapEncoder();
    });

    describe('encode()', () => {
        it('should encode object', () => {
            const map = encoder.encode({});

            expect(map).toBeInstanceOf(MichelsonMap);
        });

        it('should return null for null', () => {
            expect(encoder.encode(null)).toBeNull();
        });
    });

    describe('decode()', () => {
        it('should decode string', () => {
            const map = new MichelsonMap<string, string>();

            expect(encoder.decode(map)).toEqual({});
        });

        it('should return null for null', () => {
            expect(encoder.decode(null)).toBeNull();
        });
    });
});
