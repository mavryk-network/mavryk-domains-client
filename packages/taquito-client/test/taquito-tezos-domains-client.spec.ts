jest.mock('@tezos-domains/core');
jest.mock('@tezos-domains/resolver');
jest.mock('@tezos-domains/manager');
jest.mock('@tezos-domains/taquito');
jest.mock('@taquito/taquito');
jest.mock('../src/taquito-proxy-contract-address-resolver');
jest.mock('../src/taquito-resolver-data-provider');

import { TezosToolkit } from '@taquito/taquito';
import { AddressBook, TezosDomainsValidator, UnsupportedDomainNameValidator, Tracer, createTracer } from '@tezos-domains/core';
import { TaquitoClient } from '@tezos-domains/taquito';
import {
    BlockchainDomainsManager,
    CommitmentGenerator,
    UnsupportedDomainsManager,
    TaquitoManagerDataProvider,
    TaquitoTezosDomainsOperationFactory,
} from '@tezos-domains/manager';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import { NameResolver, NullNameResolver, createResolver } from '@tezos-domains/resolver';
import { mock, instance } from 'ts-mockito';

import { TaquitoTezosDomainsProxyContractAddressResolver } from '../src/taquito-proxy-contract-address-resolver';
import { TaquitoTezosDomainsResolverDataProvider } from '../src/taquito-resolver-data-provider';

class T {}
class N {}

describe('TaquitoTezosDomainsClient', () => {
    let taquitoClientMock: TaquitoClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;
    let blockchainDomainsManagerMock: BlockchainDomainsManager;
    let commitmentGeneratorMock: CommitmentGenerator;
    let nameResolverMock: NameResolver;
    let domainNameValidator: TezosDomainsValidator;
    let tezosToolkitMock: TezosToolkit;
    let dataProviderMock: TaquitoTezosDomainsResolverDataProvider;
    let proxyContractAddressResolver: TaquitoTezosDomainsProxyContractAddressResolver;
    let nullNameResolver: NullNameResolver;
    let managerDataProvider: TaquitoManagerDataProvider;
    let operationFactory: TaquitoTezosDomainsOperationFactory;

    let unsupportedDomainNameValidator: UnsupportedDomainNameValidator;
    let unsupportedDomainsManager: UnsupportedDomainsManager;

    beforeEach(() => {
        taquitoClientMock = mock(TaquitoClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock(T) as any;
        blockchainDomainsManagerMock = mock(BlockchainDomainsManager);
        commitmentGeneratorMock = mock(CommitmentGenerator);
        nameResolverMock = mock(N) as any;
        domainNameValidator = mock(TezosDomainsValidator);
        tezosToolkitMock = mock(TezosToolkit);
        nullNameResolver = mock(NullNameResolver);
        unsupportedDomainNameValidator = mock(UnsupportedDomainNameValidator);
        unsupportedDomainsManager = mock(UnsupportedDomainsManager);
        dataProviderMock = mock(TaquitoTezosDomainsResolverDataProvider);
        proxyContractAddressResolver = mock(TaquitoTezosDomainsProxyContractAddressResolver);
        managerDataProvider = mock(TaquitoManagerDataProvider);
        operationFactory = mock(TaquitoTezosDomainsOperationFactory);

        (TaquitoClient as jest.Mock).mockReturnValue(instance(taquitoClientMock));
        (AddressBook as jest.Mock).mockReturnValue(instance(addressBookMock));
        (createTracer as jest.Mock).mockReturnValue(instance(tracerMock));
        (BlockchainDomainsManager as jest.Mock).mockReturnValue(instance(blockchainDomainsManagerMock));
        (CommitmentGenerator as jest.Mock).mockReturnValue(instance(commitmentGeneratorMock));
        (createResolver as jest.Mock).mockReturnValue(instance(nameResolverMock));
        (TezosDomainsValidator as jest.Mock).mockReturnValue(instance(domainNameValidator));
        (NullNameResolver as jest.Mock).mockReturnValue(instance(nullNameResolver));
        (UnsupportedDomainNameValidator as jest.Mock).mockReturnValue(instance(unsupportedDomainNameValidator));
        (UnsupportedDomainsManager as jest.Mock).mockReturnValue(instance(unsupportedDomainsManager));
        (TaquitoTezosDomainsResolverDataProvider as jest.Mock).mockReturnValue(instance(dataProviderMock));
        (TaquitoTezosDomainsProxyContractAddressResolver as jest.Mock).mockReturnValue(instance(proxyContractAddressResolver));
        (TaquitoManagerDataProvider as jest.Mock).mockReturnValue(instance(managerDataProvider));
        (TaquitoTezosDomainsOperationFactory as jest.Mock).mockReturnValue(instance(operationFactory));
    });

    describe('config', () => {
        it('should setup with config', () => {
            const config = { tezos: instance(tezosToolkitMock) };
            new TaquitoTezosDomainsClient(config);

            expect(TaquitoClient).toHaveBeenCalledWith(instance(tezosToolkitMock), instance(tracerMock));
            expect(TaquitoTezosDomainsProxyContractAddressResolver).toHaveBeenCalledWith(instance(taquitoClientMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(proxyContractAddressResolver), config);
            expect(TaquitoTezosDomainsResolverDataProvider).toHaveBeenCalledWith(instance(taquitoClientMock), instance(addressBookMock), instance(tracerMock));
            expect(CommitmentGenerator).toHaveBeenCalled();
            expect(TaquitoManagerDataProvider).toHaveBeenCalledWith(
                instance(taquitoClientMock),
                instance(addressBookMock),
                instance(tracerMock),
                instance(commitmentGeneratorMock),
                instance(domainNameValidator)
            );
            expect(TaquitoTezosDomainsOperationFactory).toHaveBeenCalledWith(
                instance(taquitoClientMock),
                instance(addressBookMock),
                instance(tracerMock),
                instance(commitmentGeneratorMock),
                instance(managerDataProvider),
                instance(domainNameValidator)
            );
            expect(BlockchainDomainsManager).toHaveBeenCalledWith(
                instance(taquitoClientMock),
                instance(tracerMock),
                instance(operationFactory),
                instance(managerDataProvider)
            );

            expect(createResolver).toHaveBeenCalledWith(config, instance(dataProviderMock), instance(tracerMock), instance(domainNameValidator));
        });

        describe('setConfig()', () => {
            it('should recreate parts', () => {
                const client = new TaquitoTezosDomainsClient({ tezos: instance(tezosToolkitMock) });

                const newManager = mock(BlockchainDomainsManager);
                const newResolver = mock(N) as any;
                (BlockchainDomainsManager as jest.Mock).mockReturnValue(instance(newManager));
                (createResolver as jest.Mock).mockReturnValue(instance(newResolver));

                client.setConfig({ tezos: instance(tezosToolkitMock) });

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
            expect(client.resolver).toBe(instance(nameResolverMock));
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
