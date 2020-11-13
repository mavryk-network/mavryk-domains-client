jest.mock('@tezos-domains/core');
jest.mock('@tezos-domains/resolver');
jest.mock('@tezos-domains/manager');
jest.mock('@tezos-domains/taquito');
jest.mock('@taquito/taquito');
jest.mock('../src/taquito-proxy-contract-address-resolver');
jest.mock('../src/taquito-data-provider');

import { TezosToolkit } from '@taquito/taquito';
import { ConsoleTracer, NoopTracer, AddressBook, TezosDomainsValidator, UnsupportedDomainNameValidator } from '@tezos-domains/core';
import { TaquitoClient } from '@tezos-domains/taquito';
import { BlockchainDomainsManager, CommitmentGenerator, UnsupportedDomainsManager } from '@tezos-domains/manager';
import { TaquitoTezosDomainsClient, TaquitoTezosDomainsConfig } from '@tezos-domains/taquito-client';
import { BlockchainNameResolver, CachedNameResolver, NameNormalizingNameResolver, NullNameResolver } from '@tezos-domains/resolver';
import { mock, instance } from 'ts-mockito';
import { TaquitoTezosDomainsDataProvider } from '../src/taquito-data-provider';
import { TaquitoTezosDomainsProxyContractAddressResolver } from '../src/taquito-proxy-contract-address-resolver';

describe('TezosDomainsClient', () => {
    let taquitoClientMock: TaquitoClient;
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
    let dataProviderMock: TaquitoTezosDomainsDataProvider;
    let proxyContractAddressResolver: TaquitoTezosDomainsProxyContractAddressResolver;
    let nullNameResolver: NullNameResolver;
    let unsupportedDomainNameValidator: UnsupportedDomainNameValidator;
    let unsupportedDomainsManager: UnsupportedDomainsManager;

    beforeEach(() => {
        taquitoClientMock = mock(TaquitoClient);
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
        dataProviderMock = mock(TaquitoTezosDomainsDataProvider);
        proxyContractAddressResolver = mock(TaquitoTezosDomainsProxyContractAddressResolver);

        (TaquitoClient as jest.Mock).mockReturnValue(instance(taquitoClientMock));
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
        (TaquitoTezosDomainsDataProvider as jest.Mock).mockReturnValue(instance(dataProviderMock));
        (TaquitoTezosDomainsProxyContractAddressResolver as jest.Mock).mockReturnValue(instance(proxyContractAddressResolver));
    });

    describe('config', () => {
        it('should setup with default config', () => {
            const config = { tezos: instance(tezosToolkitMock) };
            new TaquitoTezosDomainsClient(config);

            expect(TaquitoClient).toHaveBeenCalledWith(instance(tezosToolkitMock), instance(noopTracerMock));
            expect(TaquitoTezosDomainsProxyContractAddressResolver).toHaveBeenCalledWith(instance(taquitoClientMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(proxyContractAddressResolver), config);
            expect(TaquitoTezosDomainsDataProvider).toHaveBeenCalledWith(instance(taquitoClientMock), instance(addressBookMock), instance(noopTracerMock));
            expect(CommitmentGenerator).toHaveBeenCalledWith(instance(tezosToolkitMock));
            expect(BlockchainDomainsManager).toHaveBeenCalledWith(
                instance(taquitoClientMock),
                instance(addressBookMock),
                instance(noopTracerMock),
                instance(commitmentGeneratorMock)
            );

            expect(BlockchainNameResolver).toHaveBeenCalledWith(
                instance(dataProviderMock),
                instance(noopTracerMock),
                instance(domainNameValidator)
            );
            expect(CachedNameResolver).not.toHaveBeenCalled();
            expect(NameNormalizingNameResolver).toHaveBeenCalledWith(instance(blockchainNameResolverMock), instance(noopTracerMock));
        });

        it('should setup with custom config', () => {
            const config: TaquitoTezosDomainsConfig = {
                tezos: instance(tezosToolkitMock),
                network: 'delphinet',
                tracing: true,
                caching: { enabled: true, defaultRecordTtl: 50, defaultReverseRecordTtl: 60 },
            };
            new TaquitoTezosDomainsClient(config);

            expect(TaquitoClient).toHaveBeenCalledWith(instance(tezosToolkitMock), instance(consoleTracerMock));
            expect(TaquitoTezosDomainsProxyContractAddressResolver).toHaveBeenCalledWith(instance(taquitoClientMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(proxyContractAddressResolver), config);
            expect(TaquitoTezosDomainsDataProvider).toHaveBeenCalledWith(instance(taquitoClientMock), instance(addressBookMock), instance(consoleTracerMock));
            expect(CommitmentGenerator).toHaveBeenCalledWith(instance(tezosToolkitMock));
            expect(BlockchainDomainsManager).toHaveBeenCalledWith(
                instance(taquitoClientMock),
                instance(addressBookMock),
                instance(consoleTracerMock),
                instance(commitmentGeneratorMock)
            );

            expect(BlockchainNameResolver).toHaveBeenCalledWith(
                instance(dataProviderMock),
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
                const client = new TaquitoTezosDomainsClient({ tezos: instance(tezosToolkitMock) });

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
        let client: TaquitoTezosDomainsClient;

        beforeEach(() => {
            client = new TaquitoTezosDomainsClient({ tezos: instance(tezosToolkitMock) });
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

        describe('Unsupported', () => {
            it('should provide unsupported instance', () => {
                client = TaquitoTezosDomainsClient.Unsupported;

                expect(client.isSupported).toBe(false);

                expect(client.manager).toBe(instance(unsupportedDomainsManager));
                expect(client.resolver).toBe(instance(nullNameResolver));
                expect(client.validator).toBe(instance(unsupportedDomainNameValidator));
            });

            it('should not allow to change config', () => {
                expect(() => TaquitoTezosDomainsClient.Unsupported.setConfig({ tezos: instance(tezosToolkitMock) })).toThrowError();
            });
        });
    });
});
