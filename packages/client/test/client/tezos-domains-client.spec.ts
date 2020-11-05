jest.mock('@tezos-domains/core');
jest.mock('@tezos-domains/resolver');
jest.mock('@tezos-domains/manager');
jest.mock('@taquito/taquito');

import { TezosToolkit } from '@taquito/taquito';
import { TezosClient, ConsoleTracer, NoopTracer, AddressBook, TezosDomainsValidator, UnsupportedDomainNameValidator } from '@tezos-domains/core';
import { BlockchainDomainsManager, CommitmentGenerator, UnsupportedDomainsManager } from '@tezos-domains/manager';
import { TezosDomainsClient, ClientConfig } from '@tezos-domains/client';
import { BlockchainNameResolver, CachedNameResolver, NameNormalizingNameResolver, NullNameResolver } from '@tezos-domains/resolver';
import { mock, instance, verify } from 'ts-mockito';

describe('TezosDomainsClient', () => {
    let tezosClientMock: TezosClient;
    let addressBookMock: AddressBook;
    let noopTracerMock: NoopTracer;
    let consoleTracerMock: ConsoleTracer;
    let blockchainDomainsManagerMock: BlockchainDomainsManager;
    let commitmentGeneratorMock: CommitmentGenerator;
    let blockchainNameResolverMock: BlockchainNameResolver;
    let cachedNameResolverMock: CachedNameResolver;
    let nameNormalizingNameResolver: NameNormalizingNameResolver;
    let domainNameValidator: TezosDomainsValidator;
    let tezosToolkitMock: TezosToolkit;
    let nullNameResolver: NullNameResolver;
    let unsupportedDomainNameValidator: UnsupportedDomainNameValidator;
    let unsupportedDomainsManager: UnsupportedDomainsManager;

    beforeEach(() => {
        tezosClientMock = mock(TezosClient);
        addressBookMock = mock(AddressBook);
        noopTracerMock = mock(NoopTracer);
        consoleTracerMock = mock(ConsoleTracer);
        blockchainDomainsManagerMock = mock(BlockchainDomainsManager);
        commitmentGeneratorMock = mock(CommitmentGenerator);
        blockchainNameResolverMock = mock(BlockchainNameResolver);
        cachedNameResolverMock = mock(CachedNameResolver);
        nameNormalizingNameResolver = mock(NameNormalizingNameResolver);
        domainNameValidator = mock(TezosDomainsValidator);
        tezosToolkitMock = mock(TezosToolkit);
        nullNameResolver = mock(NullNameResolver);
        unsupportedDomainNameValidator = mock(UnsupportedDomainNameValidator);
        unsupportedDomainsManager = mock(UnsupportedDomainsManager);

        (TezosClient as jest.Mock).mockReturnValue(instance(tezosClientMock));
        (AddressBook as jest.Mock).mockReturnValue(instance(addressBookMock));
        (ConsoleTracer as jest.Mock).mockReturnValue(instance(consoleTracerMock));
        (NoopTracer as jest.Mock).mockReturnValue(instance(noopTracerMock));
        (BlockchainDomainsManager as jest.Mock).mockReturnValue(instance(blockchainDomainsManagerMock));
        (CommitmentGenerator as jest.Mock).mockReturnValue(instance(commitmentGeneratorMock));
        (BlockchainNameResolver as jest.Mock).mockReturnValue(instance(blockchainNameResolverMock));
        (CachedNameResolver as jest.Mock).mockReturnValue(instance(cachedNameResolverMock));
        (NameNormalizingNameResolver as jest.Mock).mockReturnValue(instance(nameNormalizingNameResolver));
        (TezosDomainsValidator as jest.Mock).mockReturnValue(instance(domainNameValidator));
        (NullNameResolver as jest.Mock).mockReturnValue(instance(nullNameResolver));
        (UnsupportedDomainNameValidator as jest.Mock).mockReturnValue(instance(unsupportedDomainNameValidator));
        (UnsupportedDomainsManager as jest.Mock).mockReturnValue(instance(unsupportedDomainsManager));
    });

    describe('config', () => {
        it('should setup with default config', () => {
            const config = { tezos: instance(tezosToolkitMock) };
            new TezosDomainsClient(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(tezosToolkitMock), instance(noopTracerMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(tezosClientMock), config);
            expect(CommitmentGenerator).toHaveBeenCalledWith(instance(tezosToolkitMock));
            expect(BlockchainDomainsManager).toHaveBeenCalledWith(
                instance(tezosClientMock),
                instance(addressBookMock),
                instance(noopTracerMock),
                instance(commitmentGeneratorMock)
            );

            expect(BlockchainNameResolver).toHaveBeenCalledWith(
                instance(tezosClientMock),
                instance(addressBookMock),
                instance(noopTracerMock),
                instance(domainNameValidator)
            );
            expect(CachedNameResolver).not.toHaveBeenCalled();
            expect(NameNormalizingNameResolver).toHaveBeenCalledWith(instance(blockchainNameResolverMock), instance(noopTracerMock));
        });

        it('should setup with custom config', () => {
            const config: ClientConfig = {
                tezos: instance(tezosToolkitMock),
                network: 'delphinet',
                tracing: true,
                caching: { enabled: true, defaultRecordTtl: 50, defaultReverseRecordTtl: 60 },
            };
            new TezosDomainsClient(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(tezosToolkitMock), instance(consoleTracerMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(tezosClientMock), config);
            expect(CommitmentGenerator).toHaveBeenCalledWith(instance(tezosToolkitMock));
            expect(BlockchainDomainsManager).toHaveBeenCalledWith(
                instance(tezosClientMock),
                instance(addressBookMock),
                instance(consoleTracerMock),
                instance(commitmentGeneratorMock)
            );

            expect(BlockchainNameResolver).toHaveBeenCalledWith(
                instance(tezosClientMock),
                instance(addressBookMock),
                instance(consoleTracerMock),
                instance(domainNameValidator)
            );
            expect(CachedNameResolver).toHaveBeenCalledWith(instance(blockchainNameResolverMock), instance(consoleTracerMock), {
                defaultRecordTtl: 50,
                defaultReverseRecordTtl: 60,
            });
            expect(NameNormalizingNameResolver).toHaveBeenCalledWith(instance(cachedNameResolverMock), instance(consoleTracerMock));
        });

        describe('setConfig()', () => {
            it('should recreate parts', () => {
                const client = new TezosDomainsClient({ tezos: instance(tezosToolkitMock) });

                const newManager = mock(BlockchainDomainsManager);
                const newResolver = mock(NameNormalizingNameResolver);
                (BlockchainDomainsManager as jest.Mock).mockReturnValue(instance(newManager));
                (NameNormalizingNameResolver as jest.Mock).mockReturnValue(instance(newResolver));

                client.setConfig({ tezos: instance(tezosToolkitMock), caching: { enabled: true } });

                expect(client.manager).toBe(instance(newManager));
                expect(client.resolver).toBe(instance(newResolver));
            });
        });
    });

    describe('functionality', () => {
        let client: TezosDomainsClient;

        beforeEach(() => {
            client = new TezosDomainsClient({ tezos: instance(tezosToolkitMock) });
        });

        it('should expose manager', () => {
            expect(client.manager).toBe(instance(blockchainDomainsManagerMock));
        });

        it('should expose resolver', () => {
            expect(client.resolver).toBe(instance(nameNormalizingNameResolver));
        });

        it('should expose validator', () => {
            expect(client.validator).toBe(instance(domainNameValidator));
        });

        it('should be supported', () => {
            expect(client.isSupported).toBe(true);
        });

        describe('clearResolverCache()', () => {
            // eslint-disable-next-line jest/expect-expect
            it('should call clearCache() on the resolver', () => {
                client.clearResolverCache();

                verify(nameNormalizingNameResolver.clearCache()).called();
            });
        });

        describe('Unsupported', () => {
            it('should provide unsupported instance', () => {
                client = TezosDomainsClient.Unsupported;

                expect(client.isSupported).toBe(false);

                expect(client.manager).toBe(instance(unsupportedDomainsManager));
                expect(client.resolver).toBe(instance(nullNameResolver));
                expect(client.validator).toBe(instance(unsupportedDomainNameValidator));
            });

            it('should not allow to change config', () => {
                expect(() => TezosDomainsClient.Unsupported.setConfig({ tezos: instance(tezosToolkitMock) })).toThrowError();
            });
        });
    });
});
