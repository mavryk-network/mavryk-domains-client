import { JsonBytesEncoder } from '@mavrykdynamics/mavryk-domains-core';

describe('BytesEncoder', () => {
    let encoder: JsonBytesEncoder;

    beforeEach(() => {
        encoder = new JsonBytesEncoder();
    });

    describe('encode()', () => {
        it('should encode string', () => {
            expect(encoder.encode('ab')).toBe('22616222');
        });

        it('should encode number', () => {
            expect(encoder.encode(1)).toBe('31');
        });

        it('should encode boolean', () => {
            expect(encoder.encode(true)).toBe('74727565');
        });

        it('should encode object', () => {
            expect(encoder.encode({ a: 1 })).toBe('7b2261223a317d');
        });

        it('should return null for null', () => {
            expect(encoder.encode(null)).toBeNull();
        });
    });

    describe('decode()', () => {
        it('should decode string', () => {
            expect(encoder.decode('22616222')).toBe('ab');
        });

        it('should encode number', () => {
            expect(encoder.decode('31')).toBe(1);
        });

        it('should encode boolean', () => {
            expect(encoder.decode('74727565')).toBe(true);
        });

        it('should encode object', () => {
            expect(encoder.decode('7b2261223a317d')).toEqual({ a: 1 });
        });

        it('should return null for invalid json', () => {
            expect(encoder.decode('7b2261223a31')).toBeNull();
        });

        it('should return null for null', () => {
            expect(encoder.decode(null)).toBeNull();
        });
    });
});
