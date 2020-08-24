jest.mock('node-cache');

import { Tracer, DomainRecord, ReverseRecord, RecordMetadata } from '@tezos-domains/core';
import { CachedNameResolver, NameResolver } from '@tezos-domains/resolver';
import { mock, instance, when, anything, verify, anyString, anyNumber } from 'ts-mockito';
import NodeCache from 'node-cache';

describe('CachcedNameResolver', () => {
    let resolver: CachedNameResolver;
    let nameResolverMock: NameResolver;
    let cacheMock: NodeCache;
    let tracerMock: Tracer;

    let aR: DomainRecord;
    let bR: DomainRecord;
    let raR: ReverseRecord;
    let rbR: ReverseRecord;

    let paR: Promise<DomainRecord>;
    let pbR: Promise<DomainRecord>;
    let praR: Promise<ReverseRecord>;
    let prbR: Promise<ReverseRecord>;

    let fakeCache: Record<string, Promise<string>>;

    beforeEach(() => {
        nameResolverMock = mock<NameResolver>();
        tracerMock = mock<Tracer>();
        cacheMock = mock(NodeCache);
        fakeCache = {};

        aR = mock(DomainRecord);
        bR = mock(DomainRecord);
        raR = mock(ReverseRecord);
        rbR = mock(ReverseRecord);

        paR = Promise.resolve(instance(aR));
        pbR = Promise.resolve(instance(bR));
        praR = Promise.resolve(instance(raR));
        prbR = Promise.resolve(instance(rbR));

        when(aR.address).thenReturn('aR');
        const aRMeta = new RecordMetadata();
        aRMeta.ttl = 69;
        when(aR.data).thenReturn(aRMeta);
        when(bR.address).thenReturn('bR');
        when(bR.data).thenReturn(new RecordMetadata());
        when(raR.name).thenReturn('raR');
        when(rbR.name).thenReturn('rbR');

        when(tracerMock.trace(anything(), anything()));
        when(nameResolverMock.resolve('a')).thenReturn(paR).thenReturn(pbR);
        when(nameResolverMock.reverseResolve('a')).thenReturn(praR).thenReturn(prbR);
        when(cacheMock.has(anyString())).thenCall(key => Boolean(fakeCache[key]));
        when(cacheMock.get(anyString())).thenCall(key => fakeCache[key]);
        when(cacheMock.del(anyString())).thenCall(key => delete fakeCache[key]);
        when(cacheMock.set(anyString(), anything(), anyNumber())).thenCall((key, value) => (fakeCache[key] = value));

        ((NodeCache as unknown) as jest.Mock).mockImplementation(() => instance(cacheMock));

        resolver = new CachedNameResolver(instance(nameResolverMock), instance(tracerMock), { defaultRecordTtl: 10, defaultReverseRecordTtl: 11 });
    });

    describe('resolve()', () => {
        it('should cache result and return it', async () => {
            const a1 = await resolver.resolve('a');
            const a2 = await resolver.resolve('a');

            verify(nameResolverMock.resolve('a')).once();
            verify(cacheMock.set('a', paR, 10)).once();

            expect(a1).toBe(instance(aR));
            expect(a2).toBe(a1);
        });

        it('should set ttl if domain has it in metadata', async () => {
            const a1 = await resolver.resolve('a');

            verify(nameResolverMock.resolve('a')).once();
            verify(cacheMock.set('a', paR, 10)).once();
            verify(cacheMock.ttl('a', 69)).called();

            expect(a1).toBe(instance(aR));
        });

        it('should get result again when ttl expires', async () => {
            const a1 = await resolver.resolve('a');

            fakeCache = {};

            const a2 = await resolver.resolve('a');

            verify(nameResolverMock.resolve('a')).twice();
            verify(cacheMock.set('a', paR, 10)).once();
            verify(cacheMock.set('a', pbR, 10)).once();

            expect(a1).toBe(instance(aR));
            expect(a2).toBe(instance(bR));
        });

        it('should evict from cache if resolve fails', async () => {
            when(nameResolverMock.resolve('a')).thenReject(new Error('e'));

            const a = resolver.resolve('a');
            expect(fakeCache['a']).toBeDefined();

            await expect(a).rejects.toEqual(new Error('e'));

            expect(fakeCache['a']).toBeUndefined();
        });
    });

    describe('resolveAddress()', () => {
        it('should cache result and return address', async () => {
            const a1 = await resolver.resolveAddress('a');
            const a2 = await resolver.resolveAddress('a');

            verify(nameResolverMock.resolve('a')).once();
            verify(cacheMock.set('a', paR, 10)).once();

            expect(a1).toBe('aR');
            expect(a2).toBe(a1);
        });

        it('should return null if record is null', async () => {
            when(nameResolverMock.resolve('a')).thenResolve(null);

            const a1 = await resolver.resolveAddress('a');

            expect(a1).toBe(null);
        });
    });

    describe('reverseResolve()', () => {
        it('should cache result and return it', async () => {
            const a1 = await resolver.reverseResolve('a');
            const a2 = await resolver.reverseResolve('a');

            verify(nameResolverMock.reverseResolve('a')).once();
            verify(cacheMock.set('a', praR, 11)).called();

            expect(a1).toBe(instance(raR));
            expect(a2).toBe(a1);
        });

        it('should get result again when ttl expires', async () => {
            const a1 = await resolver.reverseResolve('a');

            fakeCache = {};

            const a2 = await resolver.reverseResolve('a');

            verify(nameResolverMock.reverseResolve('a')).twice();
            verify(cacheMock.set('a', praR, 11)).once();
            verify(cacheMock.set('a', prbR, 11)).once();

            expect(a1).toBe(instance(raR));
            expect(a2).toBe(instance(rbR));
        });

        it('should evict from cache if resolve fails', async () => {
            when(nameResolverMock.reverseResolve('a')).thenReject(new Error('e'));

            const a = resolver.reverseResolve('a');
            expect(fakeCache['a']).toBeDefined();

            await expect(a).rejects.toEqual(new Error('e'));

            expect(fakeCache['a']).toBeUndefined();
        });
    });

    describe('reverseResolveName()', () => {
        it('should cache result and return name', async () => {
            const a1 = await resolver.reverseResolveName('a');
            const a2 = await resolver.reverseResolveName('a');

            verify(nameResolverMock.reverseResolve('a')).once();
            verify(cacheMock.set('a', praR, 11)).once();

            expect(a1).toBe('raR');
            expect(a2).toBe(a1);
        });

        it('should return null if record is null', async () => {
            when(nameResolverMock.reverseResolve('a')).thenResolve(null);

            const a1 = await resolver.reverseResolveName('a');

            expect(a1).toBe(null);
        });
    });
});
