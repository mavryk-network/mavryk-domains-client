jest.mock('@tezos-domains/core');
jest.mock('../../src/resolver/blockchain-name-resolver');
jest.mock('../../src/resolver/cached-name-resolver');
jest.mock('../../src/resolver/name-normalizing-name-resolver');
jest.mock('@taquito/taquito');

import { TezosClient, ConsoleTracer, NoopTracer, AddressBook, DomainNameValidator } from '@tezos-domains/core';
import { TezosDomainsResolver, BlockchainNameResolver, CachedNameResolver, ResolverConfig, DomainInfo, ReverseRecordInfo, NameNormalizingNameResolver } from '@tezos-domains/resolver';
import { mock, instance, when, anyString, verify } from 'ts-mockito';
import { Tezos, TezosToolkit } from '@taquito/taquito';
import FakePromise from 'fake-promise';

describe('TezosDomainsResolver', () => {
    let resolver: TezosDomainsResolver;
    let tezosClientMock: TezosClient;
    let addressBookMock: AddressBook;
    let noopTracerMock: NoopTracer;
    let consoleTracerMock: ConsoleTracer;
    let blockchainNameResolverMock: BlockchainNameResolver;
    let cachedNameResolverMock: CachedNameResolver;
    let nameNormalizingNameResolver: NameNormalizingNameResolver;
    let domainNameValidator: DomainNameValidator;

    beforeEach(() => {
        tezosClientMock = mock(TezosClient);
        addressBookMock = mock(AddressBook);
        noopTracerMock = mock(NoopTracer);
        consoleTracerMock = mock(ConsoleTracer);
        blockchainNameResolverMock = mock(BlockchainNameResolver);
        cachedNameResolverMock = mock(CachedNameResolver);
        nameNormalizingNameResolver = mock(NameNormalizingNameResolver);
        domainNameValidator = mock(DomainNameValidator);

        (TezosClient as jest.Mock).mockReturnValue(instance(tezosClientMock));
        (AddressBook as jest.Mock).mockReturnValue(instance(addressBookMock));
        (ConsoleTracer as jest.Mock).mockReturnValue(instance(consoleTracerMock));
        (NoopTracer as jest.Mock).mockReturnValue(instance(noopTracerMock));
        (BlockchainNameResolver as jest.Mock).mockReturnValue(instance(blockchainNameResolverMock));
        (CachedNameResolver as jest.Mock).mockReturnValue(instance(cachedNameResolverMock));
        (NameNormalizingNameResolver as jest.Mock).mockReturnValue(instance(nameNormalizingNameResolver));
        (DomainNameValidator as jest.Mock).mockReturnValue(instance(domainNameValidator));
    });

    describe('config', () => {
        it('should setup with default config', () => {
            new TezosDomainsResolver();

            expect(TezosClient).toHaveBeenCalledWith(Tezos, instance(noopTracerMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(tezosClientMock), undefined);
            expect(BlockchainNameResolver).toHaveBeenCalledWith(instance(tezosClientMock), instance(addressBookMock), instance(noopTracerMock), instance(domainNameValidator));
            expect(CachedNameResolver).not.toHaveBeenCalled();
            expect(NameNormalizingNameResolver).toHaveBeenCalledWith(instance(blockchainNameResolverMock), instance(noopTracerMock));
        });

        it('should setup with custom config', () => {
            const customTezosToolkit = mock(TezosToolkit);
            const config: ResolverConfig = {
                tezos: instance(customTezosToolkit),
                network: 'delphinet',
                tracing: true,
                caching: { enabled: true, defaultRecordTtl: 50, defaultReverseRecordTtl: 60 },
            };
            new TezosDomainsResolver(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(customTezosToolkit), instance(consoleTracerMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(tezosClientMock), config);
            expect(BlockchainNameResolver).toHaveBeenCalledWith(instance(tezosClientMock), instance(addressBookMock), instance(consoleTracerMock), instance(domainNameValidator));
            expect(CachedNameResolver).toHaveBeenCalledWith(instance(blockchainNameResolverMock), instance(consoleTracerMock), {
                defaultRecordTtl: 50,
                defaultReverseRecordTtl: 60,
            });
            expect(NameNormalizingNameResolver).toHaveBeenCalledWith(instance(cachedNameResolverMock), instance(consoleTracerMock));
        });
    });

    describe('functionality', () => {
        let resolve: FakePromise<DomainInfo | null>;
        let resolveAddress: FakePromise<string | null>;
        let reverseResolve: FakePromise<ReverseRecordInfo | null>;
        let reverseResolveName: FakePromise<string | null>;
        let record: DomainInfo;
        let reverseRecord: ReverseRecordInfo;

        beforeEach(() => {
            resolve = new FakePromise();
            resolveAddress = new FakePromise();
            reverseResolve = new FakePromise();
            reverseResolveName = new FakePromise();

            record = { address: 'tz1xxx' } as DomainInfo;
            reverseRecord = { name: 'rr.tez' } as ReverseRecordInfo;

            when(nameNormalizingNameResolver.resolve(anyString())).thenReturn(resolve);
            when(nameNormalizingNameResolver.resolveAddress(anyString())).thenReturn(resolveAddress);
            when(nameNormalizingNameResolver.reverseResolve(anyString())).thenReturn(reverseResolve);
            when(nameNormalizingNameResolver.reverseResolveName(anyString())).thenReturn(reverseResolveName);

            resolver = new TezosDomainsResolver();
        });

        describe('resolve()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.resolve('necroskillz.tez');

                verify(nameNormalizingNameResolver.resolve('necroskillz.tez'));

                resolve.resolve(record);

                await expect(address).resolves.toBe(record);
            });
        });

        describe('resolveAddress()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.resolveAddress('necroskillz.tez');

                verify(nameNormalizingNameResolver.resolveAddress('necroskillz.tez'));

                resolveAddress.resolve('tz1xxx');

                await expect(address).resolves.toBe('tz1xxx');
            });
        });

        describe('reverseResolve()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.reverseResolve('tz1xxx');

                verify(nameNormalizingNameResolver.reverseResolve('tz1xxx'));

                reverseResolve.resolve(reverseRecord);

                await expect(address).resolves.toBe(reverseRecord);
            });
        });

        describe('reverseResolveName()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.reverseResolveName('tz1xxx');

                verify(nameNormalizingNameResolver.reverseResolveName('tz1xxx'));

                reverseResolveName.resolve('necroskillz.tez');

                await expect(address).resolves.toBe('necroskillz.tez');
            });
        });

        describe('clearCache()', () => {
            // eslint-disable-next-line jest/expect-expect
            it('should call actual resolver', () => {
                resolver.clearCache();

                verify(nameNormalizingNameResolver.clearCache()).called();
            });
        });
    });
});
