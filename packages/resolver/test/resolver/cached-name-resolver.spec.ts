jest.mock('node-cache');

import { Tracer, RecordMetadata, StandardRecordMetadataKey } from '@tezos-domains/core';
import { NameResolver, DomainInfo, ReverseRecordInfo } from '@tezos-domains/resolver';
import { mock, instance, when, anything, verify, anyString, anyNumber } from 'ts-mockito';
import NodeCache from 'node-cache';

import { CachedNameResolver } from '../../src/resolver/cached-name-resolver';

describe('CachedNameResolver', () => {
    let resolver: CachedNameResolver;
    let nameResolverMock: NameResolver;
    let cacheMock: NodeCache;
    let tracerMock: Tracer;

    let aR: DomainInfo;
    let bR: DomainInfo;
    let raR: ReverseRecordInfo;
    let rbR: ReverseRecordInfo;

    let paR: Promise<DomainInfo>;
    let pbR: Promise<DomainInfo>;
    let praR: Promise<ReverseRecordInfo>;
    let prbR: Promise<ReverseRecordInfo>;

    let fakeCache: Record<string, Promise<string>>;

    beforeEach(() => {
        nameResolverMock = mock<NameResolver>();
        tracerMock = mock<Tracer>();
        cacheMock = mock(NodeCache);
        fakeCache = {};

        const aRMeta = new RecordMetadata();
        aRMeta.setJson(StandardRecordMetadataKey.TTL, 69);
        aR = { address: 'aR', data: aRMeta } as DomainInfo;
        bR = { address: 'bR', data: new RecordMetadata() } as DomainInfo;
        const raRMeta = new RecordMetadata();
        raRMeta.setJson(StandardRecordMetadataKey.TTL, 420);
        raR = { domain: { name: 'raR' }, data: raRMeta } as ReverseRecordInfo;
        rbR = { domain: { name: 'rbR' }, data: new RecordMetadata() } as ReverseRecordInfo;

        paR = Promise.resolve(aR);
        pbR = Promise.resolve(bR);
        praR = Promise.resolve(raR);
        prbR = Promise.resolve(rbR);

        when(tracerMock.trace(anything(), anything()));
        when(nameResolverMock.resolveDomainRecord('a')).thenReturn(paR).thenReturn(pbR);
        when(nameResolverMock.resolveReverseRecord('a')).thenReturn(praR).thenReturn(prbR);
        when(cacheMock.has(anyString())).thenCall(key => Boolean(fakeCache[key]));
        when(cacheMock.get(anyString())).thenCall(key => fakeCache[key]);
        when(cacheMock.del(anyString())).thenCall(key => delete fakeCache[key]);
        when(cacheMock.set(anyString(), anything(), anyNumber())).thenCall((key, value) => (fakeCache[key] = value));

        ((NodeCache as unknown) as jest.Mock).mockImplementation(() => instance(cacheMock));

        resolver = new CachedNameResolver(instance(nameResolverMock), instance(tracerMock), { defaultRecordTtl: 10, defaultReverseRecordTtl: 11 });
    });

    describe('resolveDomainRecord()', () => {
        it('should cache result and return it', async () => {
            const a1 = await resolver.resolveDomainRecord('a');
            const a2 = await resolver.resolveDomainRecord('a');

            verify(nameResolverMock.resolveDomainRecord('a')).once();
            verify(cacheMock.set('a', paR, 10)).once();

            expect(a1).toBe(aR);
            expect(a2).toBe(a1);
        });

        it('should set ttl if domain has it in metadata', async () => {
            const a1 = await resolver.resolveDomainRecord('a');

            verify(nameResolverMock.resolveDomainRecord('a')).once();
            verify(cacheMock.set('a', paR, 10)).once();
            verify(cacheMock.ttl('a', 69)).called();

            expect(a1).toBe(aR);
        });

        it('should get result again when ttl expires', async () => {
            const a1 = await resolver.resolveDomainRecord('a');

            fakeCache = {};

            const a2 = await resolver.resolveDomainRecord('a');

            verify(nameResolverMock.resolveDomainRecord('a')).twice();
            verify(cacheMock.set('a', paR, 10)).once();
            verify(cacheMock.set('a', pbR, 10)).once();

            expect(a1).toBe(aR);
            expect(a2).toBe(bR);
        });

        it('should evict from cache if resolve fails', async () => {
            when(nameResolverMock.resolveDomainRecord('a')).thenReject(new Error('e'));

            const a = resolver.resolveDomainRecord('a');
            expect(fakeCache['a']).toBeDefined();

            await expect(a).rejects.toEqual(new Error('e'));

            expect(fakeCache['a']).toBeUndefined();
        });
    });

    describe('resolveNameToAddress()', () => {
        it('should cache result and return address', async () => {
            const a1 = await resolver.resolveNameToAddress('a');
            const a2 = await resolver.resolveNameToAddress('a');

            verify(nameResolverMock.resolveDomainRecord('a')).once();
            verify(cacheMock.set('a', paR, 10)).once();

            expect(a1).toBe('aR');
            expect(a2).toBe(a1);
        });

        it('should return null if record is null', async () => {
            when(nameResolverMock.resolveDomainRecord('a')).thenResolve(null);

            const a1 = await resolver.resolveNameToAddress('a');

            expect(a1).toBe(null);
        });
    });

    describe('resolveReverseRecord()', () => {
        it('should cache result and return it', async () => {
            const a1 = await resolver.resolveReverseRecord('a');
            const a2 = await resolver.resolveReverseRecord('a');

            verify(nameResolverMock.resolveReverseRecord('a')).once();
            verify(cacheMock.set('a', praR, 11)).called();

            expect(a1).toBe(raR);
            expect(a2).toBe(a1);
        });

        it('should set ttl if reverse record has it in metadata', async () => {
            const a1 = await resolver.resolveReverseRecord('a');

            verify(nameResolverMock.resolveReverseRecord('a')).once();
            verify(cacheMock.set('a', praR, 11)).once();
            verify(cacheMock.ttl('a', 420)).called();

            expect(a1).toBe(raR);
        });

        it('should get result again when ttl expires', async () => {
            const a1 = await resolver.resolveReverseRecord('a');

            fakeCache = {};

            const a2 = await resolver.resolveReverseRecord('a');

            verify(nameResolverMock.resolveReverseRecord('a')).twice();
            verify(cacheMock.set('a', praR, 11)).once();
            verify(cacheMock.set('a', prbR, 11)).once();

            expect(a1).toBe(raR);
            expect(a2).toBe(rbR);
        });

        it('should evict from cache if resolve fails', async () => {
            when(nameResolverMock.resolveReverseRecord('a')).thenReject(new Error('e'));

            const a = resolver.resolveReverseRecord('a');
            expect(fakeCache['a']).toBeDefined();

            await expect(a).rejects.toEqual(new Error('e'));

            expect(fakeCache['a']).toBeUndefined();
        });
    });

    describe('resolveAddressToName()', () => {
        it('should cache result and return name', async () => {
            const a1 = await resolver.resolveAddressToName('a');
            const a2 = await resolver.resolveAddressToName('a');

            verify(nameResolverMock.resolveReverseRecord('a')).once();
            verify(cacheMock.set('a', praR, 11)).once();

            expect(a1).toBe('raR');
            expect(a2).toBe(a1);
        });

        it('should return null if record is null', async () => {
            when(nameResolverMock.resolveReverseRecord('a')).thenResolve(null);

            const a1 = await resolver.resolveAddressToName('a');

            expect(a1).toBe(null);
        });
    });

    describe('clearCache()', () => {
        // eslint-disable-next-line jest/expect-expect
        it('should flush cache data', () => {
            resolver.clearCache();

            verify(cacheMock.flushAll()).called();
        });
    });
});
