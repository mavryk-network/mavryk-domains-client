import { isMavrykDomainsSupportedNetwork } from '@mavrykdynamics/mavryk-domains-core';

describe('isMavrykDomainsSupportedNetwork()', () => {
    it('should indicate if network is currently supported', () => {
        expect(isMavrykDomainsSupportedNetwork('mainnet')).toBe(true);
        expect(isMavrykDomainsSupportedNetwork('basenet')).toBe(true);
        expect(isMavrykDomainsSupportedNetwork('carthagenet')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('delphinet')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('edonet')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('florencenet')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('granadanet')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('hangzhounet')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('ithacanet')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('ghostnet')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('kathmandunet')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('limanet')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('jakartanet')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('custom')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('gibberish')).toBe(false);
        expect(isMavrykDomainsSupportedNetwork('')).toBe(false);
    });
});
