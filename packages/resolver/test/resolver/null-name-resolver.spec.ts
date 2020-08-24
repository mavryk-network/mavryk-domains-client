import { NullNameResovler, NameResolver } from '@tezos-domains/resolver';

describe('NullNameResolver', () => {
    let resolver: NameResolver;

    beforeEach(() => {
        resolver = new NullNameResovler();
    })

    describe('resolve()', () => {
        it('should return null', async () => {
            await expect(resolver.resolve('necroskillz.tez')).resolves.toBeNull();
        });
    });

    describe('resolveAddress()', () => {
        it('should return null', async () => {
            await expect(resolver.resolveAddress('necroskillz.tez')).resolves.toBeNull();
        });
    });

    describe('reverseResolve()', () => {
        it('should return null', async () => {
            await expect(resolver.reverseResolve('tz1xxx')).resolves.toBeNull();
        });
    });

    describe('reverseResolveName()', () => {
        it('should return null', async () => {
            await expect(resolver.reverseResolveName('tz1xxx')).resolves.toBeNull();
        });
    });
});