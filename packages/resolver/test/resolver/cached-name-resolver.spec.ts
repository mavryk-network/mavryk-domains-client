jest.mock('node-cache');

import { Tracer } from '@tezos-domains/core';
import { CachedNameResolver, NameResolver } from '@tezos-domains/resolver';
import { mock, instance, when, anything, verify, anyString, anyNumber } from 'ts-mockito';
import NodeCache from 'node-cache';

describe('CachcedNameResolver', () => {
    let resolver: CachedNameResolver;
    let nameResolverMock: NameResolver;
    let cacheMock: NodeCache;
    let tracerMock: Tracer;

    let a: Promise<string>;
    let b: Promise<string>;
    let fakeCache: Record<string, Promise<string>>;

    beforeEach(() => {
        nameResolverMock = mock<NameResolver>();
        tracerMock = mock<Tracer>();
        cacheMock = mock(NodeCache);
        fakeCache = {};

        a = Promise.resolve('aR');
        b = Promise.resolve('bR');

        when(tracerMock.trace(anything(), anything()));
        when(nameResolverMock.resolve('a')).thenReturn(a).thenReturn(b);
        when(nameResolverMock.reverseResolve('a')).thenReturn(a).thenReturn(b);
        when(cacheMock.has(anyString())).thenCall(key => Boolean(fakeCache[key]));
        when(cacheMock.get(anyString())).thenCall(key => fakeCache[key]);
        when(cacheMock.del(anyString())).thenCall(key => delete fakeCache[key]);
        when(cacheMock.set(anyString(), anything(), anyNumber())).thenCall((key, value) => (fakeCache[key] = value));

        ((NodeCache as unknown) as jest.Mock).mockImplementation(() => instance(cacheMock));

        resolver = new CachedNameResolver(instance(nameResolverMock), instance(tracerMock), { recordTtl: 10, reverseRecordTtl: 11 });
    });

    describe('resolve()', () => {
        it('should cache result and return it', async () => {
            const a1 = await resolver.resolve('a');
            const a2 = await resolver.resolve('a');

            verify(nameResolverMock.resolve('a')).once();
            verify(cacheMock.set('a', a, 10)).called();

            expect(a1).toBe('aR');
            expect(a2).toBe(a1);
        });

        it('should get result again when ttl expires', async () => {
            const a1 = await resolver.resolve('a');

            fakeCache = {};

            const a2 = await resolver.resolve('a');

            verify(nameResolverMock.resolve('a')).twice();
            verify(cacheMock.set('a', a, 10)).once();
            verify(cacheMock.set('a', b, 10)).once();

            expect(a1).toBe('aR');
            expect(a2).toBe('bR');
        });

        it('should evict from cache if resolve fails', async () => {
            when(nameResolverMock.resolve('a')).thenReject(new Error('e'));
            
            const a = resolver.resolve('a');
            expect(fakeCache['a']).toBeDefined();

            await expect(a).rejects.toEqual(new Error('e'));

            expect(fakeCache['a']).toBeUndefined();
        });
    });

    describe('reverseResolve()', () => {
        it('should cache result and return it', async () => {
            const a1 = await resolver.reverseResolve('a');
            const a2 = await resolver.reverseResolve('a');

            verify(nameResolverMock.reverseResolve('a')).once();
            verify(cacheMock.set('a', a, 11)).called();

            expect(a1).toBe('aR');
            expect(a2).toBe(a1);
        });

        it('should get result again when ttl expires', async () => {
            const a1 = await resolver.reverseResolve('a');

            fakeCache = {};

            const a2 = await resolver.reverseResolve('a');

            verify(nameResolverMock.reverseResolve('a')).twice();
            verify(cacheMock.set('a', a, 11)).once();
            verify(cacheMock.set('a', b, 11)).once();

            expect(a1).toBe('aR');
            expect(a2).toBe('bR');
        });

        it('should evict from cache if resolve fails', async () => {
            when(nameResolverMock.reverseResolve('a')).thenReject(new Error('e'));
            
            const a = resolver.reverseResolve('a');
            expect(fakeCache['a']).toBeDefined();

            await expect(a).rejects.toEqual(new Error('e'));

            expect(fakeCache['a']).toBeUndefined();
        });
    });
});
