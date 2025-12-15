jest.mock('@mavrykdynamics/mavryk-domains-core');
jest.mock('@mavrykdynamics/mavryk-domains-resolver');
jest.mock('@mavrykdynamics/mavryk-domains-manager');
jest.mock('@mavrykdynamics/mavryk-domains-taquito');
jest.mock('@mavrykdynamics/taquito');
jest.mock('../src/taquito-proxy-contract-address-resolver');
jest.mock('../src/taquito-resolver-data-provider');
jest.mock('../src/taquito-data-provider');

import { TezosToolkit } from '@mavrykdynamics/taquito';
import { AddressBook, MavrykDomainsValidator, UnsupportedDomainNameValidator, Tracer, createTracer } from '@mavrykdynamics/mavryk-domains-core';
import { TaquitoClient } from '@mavrykdynamics/mavryk-domains-taquito';
import {
    BlockchainDomainsManager,
    CommitmentGenerator,
    UnsupportedDomainsManager,
    TaquitoManagerDataProvider,
    TaquitoMavrykDomainsOperationFactory,
} from '@mavrykdynamics/mavryk-domains-manager';
import { TaquitoMavrykDomainsClient } from '@mavrykdynamics/mavryk-domains-taquito-client';
import { NameResolver, NullNameResolver, createResolver } from '@mavrykdynamics/mavryk-domains-resolver';
import { mock, instance } from 'ts-mockito';

import { TaquitoMavrykDomainsProxyContractAddressResolver } from '../src/taquito-proxy-contract-address-resolver';
import { TaquitoMavrykDomainsResolverDataProvider } from '../src/taquito-resolver-data-provider';
import { TaquitoMavrykDomainsDataProvider } from '../src/taquito-data-provider';

class T {}
class N {}

describe('TaquitoMavrykDomainsClient', () => {
    let taquitoClientMock: TaquitoClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;
    let blockchainDomainsManagerMock: BlockchainDomainsManager;
    let commitmentGeneratorMock: CommitmentGenerator;
    let nameResolverMock: NameResolver;
    let domainNameValidator: MavrykDomainsValidator;
    let tezosToolkitMock: TezosToolkit;
    let dataProviderMock: TaquitoMavrykDomainsResolverDataProvider;
    let proxyContractAddressResolver: TaquitoMavrykDomainsProxyContractAddressResolver;
    let nullNameResolver: NullNameResolver;
    let managerDataProvider: TaquitoManagerDataProvider;
    let operationFactory: TaquitoMavrykDomainsOperationFactory;
    let bigMapDataProviderMock: TaquitoMavrykDomainsDataProvider;

    let unsupportedDomainNameValidator: UnsupportedDomainNameValidator;
    let unsupportedDomainsManager: UnsupportedDomainsManager;

    beforeEach(() => {
        taquitoClientMock = mock(TaquitoClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock(T) as any;
        blockchainDomainsManagerMock = mock(BlockchainDomainsManager);
        commitmentGeneratorMock = mock(CommitmentGenerator);
        nameResolverMock = mock(N) as any;
        domainNameValidator = mock(MavrykDomainsValidator);
        tezosToolkitMock = mock(TezosToolkit);
        nullNameResolver = mock(NullNameResolver);
        unsupportedDomainNameValidator = mock(UnsupportedDomainNameValidator);
        unsupportedDomainsManager = mock(UnsupportedDomainsManager);
        dataProviderMock = mock(TaquitoMavrykDomainsResolverDataProvider);
        proxyContractAddressResolver = mock(TaquitoMavrykDomainsProxyContractAddressResolver);
        managerDataProvider = mock(TaquitoManagerDataProvider);
        operationFactory = mock(TaquitoMavrykDomainsOperationFactory);
        bigMapDataProviderMock = mock(TaquitoMavrykDomainsDataProvider);

        (TaquitoClient as jest.Mock).mockReturnValue(instance(taquitoClientMock));
        (AddressBook as jest.Mock).mockReturnValue(instance(addressBookMock));
        (createTracer as jest.Mock).mockReturnValue(instance(tracerMock));
        (BlockchainDomainsManager as jest.Mock).mockReturnValue(instance(blockchainDomainsManagerMock));
        (CommitmentGenerator as jest.Mock).mockReturnValue(instance(commitmentGeneratorMock));
        (createResolver as jest.Mock).mockReturnValue(instance(nameResolverMock));
        (MavrykDomainsValidator as jest.Mock).mockReturnValue(instance(domainNameValidator));
        (NullNameResolver as jest.Mock).mockReturnValue(instance(nullNameResolver));
        (UnsupportedDomainNameValidator as jest.Mock).mockReturnValue(instance(unsupportedDomainNameValidator));
        (UnsupportedDomainsManager as jest.Mock).mockReturnValue(instance(unsupportedDomainsManager));
        (TaquitoMavrykDomainsResolverDataProvider as jest.Mock).mockReturnValue(instance(dataProviderMock));
        (TaquitoMavrykDomainsProxyContractAddressResolver as jest.Mock).mockReturnValue(instance(proxyContractAddressResolver));
        (TaquitoManagerDataProvider as jest.Mock).mockReturnValue(instance(managerDataProvider));
        (TaquitoMavrykDomainsOperationFactory as jest.Mock).mockReturnValue(instance(operationFactory));
        (TaquitoMavrykDomainsDataProvider as jest.Mock).mockReturnValue(instance(bigMapDataProviderMock));
    });

    describe('config', () => {
        it('should setup with config', () => {
            const config = { tezos: instance(tezosToolkitMock) };
            new TaquitoMavrykDomainsClient(config);

            expect(TaquitoClient).toHaveBeenCalledWith(instance(tezosToolkitMock), instance(tracerMock));
            expect(TaquitoMavrykDomainsProxyContractAddressResolver).toHaveBeenCalledWith(instance(taquitoClientMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(proxyContractAddressResolver), config);
            expect(TaquitoMavrykDomainsResolverDataProvider).toHaveBeenCalledWith(instance(taquitoClientMock), instance(addressBookMock), instance(tracerMock));
            expect(CommitmentGenerator).toHaveBeenCalled();
            expect(TaquitoManagerDataProvider).toHaveBeenCalledWith(
                instance(taquitoClientMock),
                instance(addressBookMock),
                instance(tracerMock),
                instance(commitmentGeneratorMock),
                instance(domainNameValidator),
                instance(bigMapDataProviderMock)
            );
            expect(TaquitoMavrykDomainsOperationFactory).toHaveBeenCalledWith(
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
                const client = new TaquitoMavrykDomainsClient({ tezos: instance(tezosToolkitMock) });

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
        let client: TaquitoMavrykDomainsClient;

        beforeEach(() => {
            client = new TaquitoMavrykDomainsClient({ tezos: instance(tezosToolkitMock) });
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
                client = TaquitoMavrykDomainsClient.Unsupported;

                expect(client.isSupported).toBe(false);

                expect(client.manager).toBe(instance(unsupportedDomainsManager));
                expect(client.resolver).toBe(instance(nullNameResolver));
                expect(client.validator).toBe(instance(unsupportedDomainNameValidator));
            });

            it('should not allow to change config', () => {
                expect(() => TaquitoMavrykDomainsClient.Unsupported.setConfig({ tezos: instance(tezosToolkitMock) })).toThrow();
            });
        });
    });
});
