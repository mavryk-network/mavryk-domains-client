import { DateEncoder } from '@mavrykdynamics/mavryk-domains-core';

describe('DateEncoder', () => {
    let encoder: DateEncoder;

    beforeEach(() => {
        encoder = new DateEncoder();
    });

    describe('encode()', () => {
        it('should encode date', () => {
            const date = new Date(2020, 9, 1, 22, 5, 0);
            expect(encoder.encode(new Date(date.getTime() - date.getTimezoneOffset() * 60000))).toBe(
                '2020-10-01T22:05:00.000Z'
            );
        });

        it('should return null for null', () => {
            expect(encoder.encode(null)).toBeNull();
        });
    });

    describe('decode()', () => {
        it('should decode date', () => {
            const date = new Date(2020, 9, 1, 20, 5, 0);
            expect(encoder.decode('2020-10-01T20:05:00.000Z')?.toString()).toBe(
                new Date(date.getTime() - date.getTimezoneOffset() * 60000).toString()
            );
        });

        it('should return null for null', () => {
            expect(encoder.decode(null)).toBeNull();
        });
    });
});
