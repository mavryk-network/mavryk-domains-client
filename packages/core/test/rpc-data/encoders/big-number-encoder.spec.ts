import { BigNumberEncoder } from '@tezos-domains/core';
import BigNumber from 'bignumber.js';

describe('BigNumberEncoder', () => {
    let encoder: BigNumberEncoder;

    beforeEach(() => {
        encoder = new BigNumberEncoder();
    });

    describe('encode()', () => {
        it('should encode string', () => {
            expect(encoder.encode(2)!.toNumber()).toBe(2);
        });

        it('should return null for null', () => {
            expect(encoder.encode(null)).toBeNull();
        });
    });

    describe('decode()', () => {
        it('should decode string', () => {
            expect(encoder.decode(new BigNumber(2))).toBe(2);
        });

        it('should return null for null', () => {
            expect(encoder.decode(null)).toBeNull();
        });
    });
});
