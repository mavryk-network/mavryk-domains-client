jest.mock('@tezos-domains/core');
jest.mock('../../src/resolver/blockchain-name-resolver');
jest.mock('../../src/resolver/cached-name-resolver');
jest.mock('../../src/resolver/name-normalizing-name-resolver');
jest.mock('@taquito/taquito');

import { TezosClient, ConsoleTracer, NoopTracer, AddressBook, DomainNameValidator } from '@tezos-domains/core';
import { TezosDomainsResolver, BlockchainNameResolver, CachedNameResolver, ResolverConfig, DomainInfo, ReverseRecordInfo, NameNormalizingNameResolver } from '@tezos-domains/resolver';
import { mock, instance, when, anyString, verify } from 'ts-mockito';
import { TezosToolkit } from '@taquito/taquito';
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
    let tezosToolkitMock: TezosToolkit;

    beforeEach(() => {
        tezosClientMock = mock(TezosClient);
        addressBookMock = mock(AddressBook);
        noopTracerMock = mock(NoopTracer);
        consoleTracerMock = mock(ConsoleTracer);
        blockchainNameResolverMock = mock(BlockchainNameResolver);
        cachedNameResolverMock = mock(CachedNameResolver);
        nameNormalizingNameResolver = mock(NameNormalizingNameResolver);
        domainNameValidator = mock(DomainNameValidator);
        tezosToolkitMock = mock(TezosToolkit);

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
            const config = { tezos: instance(tezosToolkitMock) };
            new TezosDomainsResolver(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(tezosToolkitMock), instance(noopTracerMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(tezosClientMock), config);
            expect(BlockchainNameResolver).toHaveBeenCalledWith(instance(tezosClientMock), instance(addressBookMock), instance(noopTracerMock), instance(domainNameValidator));
            expect(CachedNameResolver).not.toHaveBeenCalled();
            expect(NameNormalizingNameResolver).toHaveBeenCalledWith(instance(blockchainNameResolverMock), instance(noopTracerMock));
        });

        it('should setup with custom config', () => {
            const config: ResolverConfig = {
                tezos: instance(tezosToolkitMock),
                network: 'delphinet',
                tracing: true,
                caching: { enabled: true, defaultRecordTtl: 50, defaultReverseRecordTtl: 60 },
            };
            new TezosDomainsResolver(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(tezosToolkitMock), instance(consoleTracerMock));
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
        let resolveDomainRecord: FakePromise<DomainInfo | null>;
        let resolveNameToAddress: FakePromise<string | null>;
        let resolveReverseRecord: FakePromise<ReverseRecordInfo | null>;
        let resolveAddressToName: FakePromise<string | null>;
        let record: DomainInfo;
        let reverseRecord: ReverseRecordInfo;

        beforeEach(() => {
            resolveDomainRecord = new FakePromise();
            resolveNameToAddress = new FakePromise();
            resolveReverseRecord = new FakePromise();
            resolveAddressToName = new FakePromise();

            record = { address: 'tz1xxx' } as DomainInfo;
            reverseRecord = { name: 'rr.tez' } as ReverseRecordInfo;

            when(nameNormalizingNameResolver.resolveDomainRecord(anyString())).thenReturn(resolveDomainRecord);
            when(nameNormalizingNameResolver.resolveNameToAddress(anyString())).thenReturn(resolveNameToAddress);
            when(nameNormalizingNameResolver.resolveReverseRecord(anyString())).thenReturn(resolveReverseRecord);
            when(nameNormalizingNameResolver.resolveAddressToName(anyString())).thenReturn(resolveAddressToName);

            resolver = new TezosDomainsResolver({ tezos: instance(tezosToolkitMock) });
        });

        describe('resolveDomainRecord()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.resolveDomainRecord('necroskillz.tez');

                verify(nameNormalizingNameResolver.resolveDomainRecord('necroskillz.tez'));

                resolveDomainRecord.resolve(record);

                await expect(address).resolves.toBe(record);
            });
        });

        describe('resolveNameToAddress()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.resolveNameToAddress('necroskillz.tez');

                verify(nameNormalizingNameResolver.resolveNameToAddress('necroskillz.tez'));

                resolveNameToAddress.resolve('tz1xxx');

                await expect(address).resolves.toBe('tz1xxx');
            });
        });

        describe('resolveReverseRecord()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.resolveReverseRecord('tz1xxx');

                verify(nameNormalizingNameResolver.resolveReverseRecord('tz1xxx'));

                resolveReverseRecord.resolve(reverseRecord);

                await expect(address).resolves.toBe(reverseRecord);
            });
        });

        describe('resolveAddressToName()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.resolveAddressToName('tz1xxx');

                verify(nameNormalizingNameResolver.resolveAddressToName('tz1xxx'));

                resolveAddressToName.resolve('necroskillz.tez');

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
