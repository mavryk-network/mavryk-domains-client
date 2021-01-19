jest.mock('@tezos-domains/core');
jest.mock('@tezos-domains/resolver');
jest.mock('../src/conseil-proxy-contract-address-resolver');
jest.mock('../src/conseil-data-provider');
jest.mock('../src/conseil/client');

import { AddressBook, TezosDomainsValidator, UnsupportedDomainNameValidator, Tracer, createTracer, ResolverDataProviderAdapter } from '@tezos-domains/core';
import { ConseilTezosDomainsClient } from '@tezos-domains/conseil-client';
import { NameResolver, NullNameResolver, createResolver } from '@tezos-domains/resolver';
import { mock, instance } from 'ts-mockito';

import { ConseilTezosDomainsDataProvider } from '../src/conseil-data-provider';
import { ConseilTezosDomainsProxyContractAddressResolver } from '../src/conseil-proxy-contract-address-resolver';
import { ConseilClient } from '../src/conseil/client';

class T {}
class N {}

describe('ConseilTezosDomainsClient', () => {
    let conseilClientMock: ConseilClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;
    let nameResolverMock: NameResolver;
    let domainNameValidator: TezosDomainsValidator;
    let dataProviderMock: ConseilTezosDomainsDataProvider;
    let resolverDataProviderAdapter: ResolverDataProviderAdapter;
    let proxyContractAddressResolver: ConseilTezosDomainsProxyContractAddressResolver;
    let nullNameResolver: NullNameResolver;
    let unsupportedDomainNameValidator: UnsupportedDomainNameValidator;

    beforeEach(() => {
        conseilClientMock = mock(ConseilClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock(T) as any;
        nameResolverMock = mock(N) as any;
        domainNameValidator = mock(TezosDomainsValidator);
        nullNameResolver = mock(NullNameResolver);
        unsupportedDomainNameValidator = mock(UnsupportedDomainNameValidator);
        dataProviderMock = mock(ConseilTezosDomainsDataProvider);
        resolverDataProviderAdapter = mock(ResolverDataProviderAdapter);
        proxyContractAddressResolver = mock(ConseilTezosDomainsProxyContractAddressResolver);

        (ConseilClient as jest.Mock).mockReturnValue(instance(conseilClientMock));
        (AddressBook as jest.Mock).mockReturnValue(instance(addressBookMock));
        (createTracer as jest.Mock).mockReturnValue(instance(tracerMock));
        (createResolver as jest.Mock).mockReturnValue(instance(nameResolverMock));
        (TezosDomainsValidator as jest.Mock).mockReturnValue(instance(domainNameValidator));
        (NullNameResolver as jest.Mock).mockReturnValue(instance(nullNameResolver));
        (UnsupportedDomainNameValidator as jest.Mock).mockReturnValue(instance(unsupportedDomainNameValidator));
        (ConseilTezosDomainsDataProvider as jest.Mock).mockReturnValue(instance(dataProviderMock));
        (ConseilTezosDomainsProxyContractAddressResolver as jest.Mock).mockReturnValue(instance(proxyContractAddressResolver));
        (ResolverDataProviderAdapter as jest.Mock).mockReturnValue(instance(resolverDataProviderAdapter));
    });

    describe('config', () => {
        it('should setup with config', () => {
            const config = { conseil: { server: 'https://rpc.io/' } };
            new ConseilTezosDomainsClient(config);

            expect(ConseilClient).toHaveBeenCalledWith(config.conseil, instance(tracerMock));
            expect(ConseilTezosDomainsProxyContractAddressResolver).toHaveBeenCalledWith(instance(conseilClientMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(proxyContractAddressResolver), config);
            expect(ConseilTezosDomainsDataProvider).toHaveBeenCalledWith(instance(conseilClientMock), instance(addressBookMock), instance(tracerMock));
            expect(ResolverDataProviderAdapter).toHaveBeenCalledWith(instance(dataProviderMock), instance(tracerMock));

            expect(createResolver).toHaveBeenCalledWith(config, instance(resolverDataProviderAdapter), instance(tracerMock), instance(domainNameValidator));
        });

        describe('setConfig()', () => {
            it('should recreate parts', () => {
                const client = new ConseilTezosDomainsClient({ conseil: { server: 'https://rpc.io/' } });

                const newResolver = mock(N) as any;
                (createResolver as jest.Mock).mockReturnValue(instance(newResolver));

                client.setConfig({ conseil: { server: 'https://rpc2.io/' } });

                expect(client.resolver).toBe(instance(newResolver));
            });
        });
    });

    describe('functionality', () => {
        let client: ConseilTezosDomainsClient;

        beforeEach(() => {
            client = new ConseilTezosDomainsClient({ conseil: { server: 'https://rpc.io/' } });
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
                client = ConseilTezosDomainsClient.Unsupported;

                expect(client.isSupported).toBe(false);

                expect(client.resolver).toBe(instance(nullNameResolver));
                expect(client.validator).toBe(instance(unsupportedDomainNameValidator));
            });

            it('should not allow to change config', () => {
                expect(() => ConseilTezosDomainsClient.Unsupported.setConfig({ conseil: { server: 'https://rpc2.io/' } })).toThrowError();
            });
        });
    });
});
