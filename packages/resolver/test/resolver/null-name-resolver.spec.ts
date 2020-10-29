import { NullNameResovler, NameResolver } from '@tezos-domains/resolver';

describe('NullNameResolver', () => {
    let resolver: NameResolver;

    beforeEach(() => {
        resolver = new NullNameResovler();
    })

    describe('resolveDomainRecord()', () => {
        it('should return null', async () => {
            await expect(resolver.resolveDomainRecord('necroskillz.tez')).resolves.toBeNull();
        });
    });

    describe('resolveNameToAddress()', () => {
        it('should return null', async () => {
            await expect(resolver.resolveNameToAddress('necroskillz.tez')).resolves.toBeNull();
        });
    });

    describe('resolveReverseRecord()', () => {
        it('should return null', async () => {
            await expect(resolver.resolveReverseRecord('tz1xxx')).resolves.toBeNull();
        });
    });

    describe('resolveAddressToName()', () => {
        it('should return null', async () => {
            await expect(resolver.resolveAddressToName('tz1xxx')).resolves.toBeNull();
        });
    });

    describe('clearCache()', () => {
        it('should do nothing', () => {
            expect(() => resolver.clearCache()).not.toThrow();
        });
    });
});