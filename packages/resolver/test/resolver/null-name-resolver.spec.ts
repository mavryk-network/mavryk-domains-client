import { NullNameResolver, NameResolver } from '@mavrykdynamics/mavryk-domains-resolver';

describe('NullNameResolver', () => {
    let resolver: NameResolver;

    beforeEach(() => {
        resolver = new NullNameResolver();
    })

    describe('resolveDomainRecord()', () => {
        it('should return null', async () => {
            await expect(resolver.resolveDomainRecord('necroskillz.mav')).resolves.toBeNull();
        });
    });

    describe('resolveNameToAddress()', () => {
        it('should return null', async () => {
            await expect(resolver.resolveNameToAddress('necroskillz.mav')).resolves.toBeNull();
        });
    });

    describe('resolveReverseRecord()', () => {
        it('should return null', async () => {
            await expect(resolver.resolveReverseRecord('mv1xxx')).resolves.toBeNull();
        });
    });

    describe('resolveAddressToName()', () => {
        it('should return null', async () => {
            await expect(resolver.resolveAddressToName('mv1xxx')).resolves.toBeNull();
        });
    });

    describe('clearCache()', () => {
        it('should do nothing', () => {
            expect(() => resolver.clearCache()).not.toThrow();
        });
    });
});