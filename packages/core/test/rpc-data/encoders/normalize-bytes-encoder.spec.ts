import { NormalizeBytesEncoder } from '@mavrykdynamics/mavryk-domains-core';

describe('BytesEncoder', () => {
    let encoder: NormalizeBytesEncoder;

    beforeEach(() => {
        encoder = new NormalizeBytesEncoder();
    });

    describe('encode()', () => {
        it('should encode string', () => {
            expect(encoder.encode('ab')).toBe('6162');
        });

        it('should encode and normalize string', () => {
            expect(encoder.encode('AB')).toBe('6162');
        });

        it('should return null for null', () => {
            expect(encoder.encode(null)).toBeNull();
        });
    });

    describe('decode()', () => {
        it('should decode string', () => {
            expect(encoder.decode('6162')).toBe('ab');
        });

        it('should return null for null', () => {
            expect(encoder.decode(null)).toBeNull();
        });
    });
});
