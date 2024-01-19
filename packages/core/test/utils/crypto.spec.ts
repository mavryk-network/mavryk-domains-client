import { generateNonce } from '@mavrykdynamics/mavryk-domains-core';

describe('generateNonce()', () => {
    it('should generate a number', () => {
        expect(generateNonce()).toBeGreaterThanOrEqual(0);
        expect(generateNonce()).toBeLessThanOrEqual(281474976710655);
        expect(typeof generateNonce()).toBe('number');
    });
});
