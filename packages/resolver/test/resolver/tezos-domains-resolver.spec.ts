jest.mock('@tezos-domains/core');
jest.mock('../../src/resolver/blockchain-name-resolver');
jest.mock('../../src/resolver/cached-name-resolver');
jest.mock('@taquito/taquito');

import { TezosClient, ConsoleTracer, NoopTracer, AddressBook } from '@tezos-domains/core';
import { TezosDomainsResolver, BlockchainNameResolver, CachedNameResolver, ResolverConfig } from '@tezos-domains/resolver';
import { mock, instance, when, anyString, verify } from 'ts-mockito';
import { Tezos, TezosToolkit } from '@taquito/taquito';
import FakePromise from 'fake-promise';
import { DomainRecord, ReverseRecord } from '@tezos-domains/core';

describe('TezosDomainsResolver', () => {
    let resolver: TezosDomainsResolver;
    let tezosClientMock: TezosClient;
    let addressBookMock: AddressBook;
    let noopTracerMock: NoopTracer;
    let consoleTracerMock: ConsoleTracer;
    let blockchainNameResolverMock: BlockchainNameResolver;
    let cachedNameResolverMock: CachedNameResolver;

    beforeEach(() => {
        tezosClientMock = mock(TezosClient);
        addressBookMock = mock(AddressBook);
        noopTracerMock = mock(NoopTracer);
        consoleTracerMock = mock(ConsoleTracer);
        blockchainNameResolverMock = mock(BlockchainNameResolver);
        cachedNameResolverMock = mock(CachedNameResolver);

        (TezosClient as jest.Mock).mockReturnValue(instance(tezosClientMock));
        (AddressBook as jest.Mock).mockReturnValue(instance(addressBookMock));
        (ConsoleTracer as jest.Mock).mockReturnValue(instance(consoleTracerMock));
        (NoopTracer as jest.Mock).mockReturnValue(instance(noopTracerMock));
        (BlockchainNameResolver as jest.Mock).mockReturnValue(instance(blockchainNameResolverMock));
        (CachedNameResolver as jest.Mock).mockReturnValue(instance(cachedNameResolverMock));
    });

    describe('config', () => {
        it('should setup with default config', () => {
            new TezosDomainsResolver();

            expect(TezosClient).toHaveBeenCalledWith(Tezos, instance(noopTracerMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(tezosClientMock), undefined);
            expect(BlockchainNameResolver).toHaveBeenCalledWith(instance(tezosClientMock), instance(addressBookMock), instance(noopTracerMock));
            expect(CachedNameResolver).not.toHaveBeenCalled();
        });

        it('should setup with custom config', () => {
            const customTezosToolkit = mock(TezosToolkit);
            const config: ResolverConfig = {
                tezos: instance(customTezosToolkit),
                network: 'carthagenet',
                tracing: true,
                caching: { enabled: true, defaultRecordTtl: 50, defaultReverseRecordTtl: 60 },
            };
            new TezosDomainsResolver(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(customTezosToolkit), instance(consoleTracerMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(tezosClientMock), config);
            expect(BlockchainNameResolver).toHaveBeenCalledWith(instance(tezosClientMock), instance(addressBookMock), instance(consoleTracerMock));
            expect(CachedNameResolver).toHaveBeenCalledWith(instance(blockchainNameResolverMock), instance(consoleTracerMock), {
                defaultRecordTtl: 50,
                defaultReverseRecordTtl: 60,
            });
        });
    });

    describe('functionality', () => {
        let resolve: FakePromise<DomainRecord | null>;
        let resolveAddress: FakePromise<string | null>;
        let reverseResolve: FakePromise<ReverseRecord | null>;
        let reverseResolveName: FakePromise<string | null>;
        let record: DomainRecord;
        let reverseRecord: ReverseRecord;

        beforeEach(() => {
            resolve = new FakePromise();
            resolveAddress = new FakePromise();
            reverseResolve = new FakePromise();
            reverseResolveName = new FakePromise();

            record = mock(DomainRecord);
            reverseRecord = mock(ReverseRecord);

            when(blockchainNameResolverMock.resolve(anyString())).thenReturn(resolve);
            when(blockchainNameResolverMock.resolveAddress(anyString())).thenReturn(resolveAddress);
            when(blockchainNameResolverMock.reverseResolve(anyString())).thenReturn(reverseResolve);
            when(blockchainNameResolverMock.reverseResolveName(anyString())).thenReturn(reverseResolveName);
            when(cachedNameResolverMock.resolve(anyString())).thenReturn(resolve);
            when(cachedNameResolverMock.resolveAddress(anyString())).thenReturn(resolveAddress);
            when(cachedNameResolverMock.reverseResolve(anyString())).thenReturn(reverseResolve);
            when(cachedNameResolverMock.reverseResolveName(anyString())).thenReturn(reverseResolveName);

            resolver = new TezosDomainsResolver();
        });

        describe('resolve()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.resolve('necroskillz.tez');

                verify(blockchainNameResolverMock.resolve('necroskillz.tez'));

                resolve.resolve(instance(record));

                await expect(address).resolves.toBe(instance(record));
            });

            it('should call actual resolver (with caching)', async () => {
                resolver = new TezosDomainsResolver({ caching: { enabled: true } });

                const address = resolver.resolve('necroskillz.tez');

                verify(cachedNameResolverMock.resolve('necroskillz.tez'));

                resolve.resolve(instance(record));

                await expect(address).resolves.toBe(instance(record));
            });
        });

        describe('resolveAddress()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.resolveAddress('necroskillz.tez');

                verify(blockchainNameResolverMock.resolveAddress('necroskillz.tez'));

                resolveAddress.resolve('tz1xxx');

                await expect(address).resolves.toBe('tz1xxx');
            });

            it('should call actual resolver (with caching)', async () => {
                resolver = new TezosDomainsResolver({ caching: { enabled: true } });

                const address = resolver.resolveAddress('necroskillz.tez');

                verify(cachedNameResolverMock.resolve('necroskillz.tez'));

                resolveAddress.resolve('tz1xxx');

                await expect(address).resolves.toBe('tz1xxx');
            });
        });

        describe('reverseResolve()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.reverseResolve('tz1xxx');

                verify(blockchainNameResolverMock.reverseResolve('tz1xxx'));

                reverseResolve.resolve(instance(reverseRecord));

                await expect(address).resolves.toBe(instance(reverseRecord));
            });

            it('should call actual resolver (with caching)', async () => {
                resolver = new TezosDomainsResolver({ caching: { enabled: true } });

                const address = resolver.reverseResolve('tz1xxx');

                verify(cachedNameResolverMock.reverseResolve('tz1xxx'));

                reverseResolve.resolve(instance(reverseRecord));

                await expect(address).resolves.toBe(instance(reverseRecord));
            });
        });

        describe('reverseResolveName()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.reverseResolveName('tz1xxx');

                verify(blockchainNameResolverMock.reverseResolveName('tz1xxx'));

                reverseResolveName.resolve('necroskillz.tez');

                await expect(address).resolves.toBe('necroskillz.tez');
            });

            it('should call actual resolver (with caching)', async () => {
                resolver = new TezosDomainsResolver({ caching: { enabled: true } });

                const address = resolver.reverseResolveName('tz1xxx');

                verify(cachedNameResolverMock.reverseResolveName('tz1xxx'));

                reverseResolveName.resolve('necroskillz.tez');

                await expect(address).resolves.toBe('necroskillz.tez');
            });
        });

        describe('clearCache()', () => {
            // eslint-disable-next-line jest/expect-expect
            it('should call actual resolver', () => {
                resolver.clearCache();

                verify(blockchainNameResolverMock.clearCache()).called();
            });

            // eslint-disable-next-line jest/expect-expect
            it('should call actual resolver (with caching)', () => {
                resolver = new TezosDomainsResolver({ caching: { enabled: true } });

                resolver.clearCache();

                verify(cachedNameResolverMock.clearCache()).called();
            });
        });
    });
});
