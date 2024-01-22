jest.mock('@mavrykdynamics/mavryk-domains-core');
jest.mock('@mavrykdynamics/mavryk-domains-resolver');
jest.mock('../src/conseil-proxy-contract-address-resolver');
jest.mock('../src/conseil-data-provider');
jest.mock('../src/conseil/client');

import { AddressBook, MavrykDomainsValidator, UnsupportedDomainNameValidator, Tracer, createTracer, ResolverDataProviderAdapter } from '@mavrykdynamics/mavryk-domains-core';
import { ConseilMavrykDomainsClient } from '@mavrykdynamics/mavryk-domains-conseil-client';
import { NameResolver, NullNameResolver, createResolver } from '@mavrykdynamics/mavryk-domains-resolver';
import { mock, instance } from 'ts-mockito';

import { ConseilMavrykDomainsDataProvider } from '../src/conseil-data-provider';
import { ConseilMavrykDomainsProxyContractAddressResolver } from '../src/conseil-proxy-contract-address-resolver';
import { ConseilClient } from '../src/conseil/client';

class T {}
class N {}

describe('ConseilMavrykDomainsClient', () => {
    let conseilClientMock: ConseilClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;
    let nameResolverMock: NameResolver;
    let domainNameValidator: MavrykDomainsValidator;
    let dataProviderMock: ConseilMavrykDomainsDataProvider;
    let resolverDataProviderAdapter: ResolverDataProviderAdapter;
    let proxyContractAddressResolver: ConseilMavrykDomainsProxyContractAddressResolver;
    let nullNameResolver: NullNameResolver;
    let unsupportedDomainNameValidator: UnsupportedDomainNameValidator;

    beforeEach(() => {
        conseilClientMock = mock(ConseilClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock(T) as any;
        nameResolverMock = mock(N) as any;
        domainNameValidator = mock(MavrykDomainsValidator);
        nullNameResolver = mock(NullNameResolver);
        unsupportedDomainNameValidator = mock(UnsupportedDomainNameValidator);
        dataProviderMock = mock(ConseilMavrykDomainsDataProvider);
        resolverDataProviderAdapter = mock(ResolverDataProviderAdapter);
        proxyContractAddressResolver = mock(ConseilMavrykDomainsProxyContractAddressResolver);

        (ConseilClient as jest.Mock).mockReturnValue(instance(conseilClientMock));
        (AddressBook as jest.Mock).mockReturnValue(instance(addressBookMock));
        (createTracer as jest.Mock).mockReturnValue(instance(tracerMock));
        (createResolver as jest.Mock).mockReturnValue(instance(nameResolverMock));
        (MavrykDomainsValidator as jest.Mock).mockReturnValue(instance(domainNameValidator));
        (NullNameResolver as jest.Mock).mockReturnValue(instance(nullNameResolver));
        (UnsupportedDomainNameValidator as jest.Mock).mockReturnValue(instance(unsupportedDomainNameValidator));
        (ConseilMavrykDomainsDataProvider as jest.Mock).mockReturnValue(instance(dataProviderMock));
        (ConseilMavrykDomainsProxyContractAddressResolver as jest.Mock).mockReturnValue(instance(proxyContractAddressResolver));
        (ResolverDataProviderAdapter as jest.Mock).mockReturnValue(instance(resolverDataProviderAdapter));
    });

    describe('config', () => {
        it('should setup with config', () => {
            const config = { conseil: { server: 'https://rpc.io/' } };
            new ConseilMavrykDomainsClient(config);

            expect(ConseilClient).toHaveBeenCalledWith(config.conseil, instance(tracerMock));
            expect(ConseilMavrykDomainsProxyContractAddressResolver).toHaveBeenCalledWith(instance(conseilClientMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(proxyContractAddressResolver), config);
            expect(ConseilMavrykDomainsDataProvider).toHaveBeenCalledWith(instance(conseilClientMock), instance(addressBookMock), instance(tracerMock));
            expect(ResolverDataProviderAdapter).toHaveBeenCalledWith(instance(dataProviderMock), instance(tracerMock));

            expect(createResolver).toHaveBeenCalledWith(config, instance(resolverDataProviderAdapter), instance(tracerMock), instance(domainNameValidator));
        });

        describe('setConfig()', () => {
            it('should recreate parts', () => {
                const client = new ConseilMavrykDomainsClient({ conseil: { server: 'https://rpc.io/' } });

                const newResolver = mock(N) as any;
                (createResolver as jest.Mock).mockReturnValue(instance(newResolver));

                client.setConfig({ conseil: { server: 'https://rpc2.io/' } });

                expect(client.resolver).toBe(instance(newResolver));
            });
        });
    });

    describe('functionality', () => {
        let client: ConseilMavrykDomainsClient;

        beforeEach(() => {
            client = new ConseilMavrykDomainsClient({ conseil: { server: 'https://rpc.io/' } });
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
                client = ConseilMavrykDomainsClient.Unsupported;

                expect(client.isSupported).toBe(false);

                expect(client.resolver).toBe(instance(nullNameResolver));
                expect(client.validator).toBe(instance(unsupportedDomainNameValidator));
            });

            it('should not allow to change config', () => {
                expect(() => ConseilMavrykDomainsClient.Unsupported.setConfig({ conseil: { server: 'https://rpc2.io/' } })).toThrow();
            });
        });
    });
});
