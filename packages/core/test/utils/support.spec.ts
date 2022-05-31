import { isTezosDomainsSupportedNetwork } from '@tezos-domains/core';

describe('isTezosDomainsSupportedNetwork()', () => {
    it('should indicate if network is currently supported', () => {
        expect(isTezosDomainsSupportedNetwork('mainnet')).toBe(true);
        expect(isTezosDomainsSupportedNetwork('carthagenet')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('delphinet')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('edonet')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('florencenet')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('granadanet')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('hangzhounet')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('ithacanet')).toBe(true);
        expect(isTezosDomainsSupportedNetwork('custom')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('gibberish')).toBe(false);
        expect(isTezosDomainsSupportedNetwork('')).toBe(false);
    });
});
