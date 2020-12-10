import { isTezosDomainsSupportedNetwork } from '@tezos-domains/core';

describe('isTezosDomainsSupportedNetwork()', () => {
    it('should indicate if network is currently supported', () => {
        expect(isTezosDomainsSupportedNetwork('mainnet')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('carthagenet')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('delphinet')).toBe(true);
        expect(isTezosDomainsSupportedNetwork('custom')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('gibberish')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('')).toBe(false);
    });
});
