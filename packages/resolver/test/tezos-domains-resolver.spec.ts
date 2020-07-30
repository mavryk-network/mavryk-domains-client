jest.mock('@tezos-domains/core');
jest.mock('../src/resolver/resolver');
jest.mock('@taquito/taquito');

import {
    TezosClient,
    TezosProxyClient,
    ProxyContractAddressResolver,
    TezosDomainsConfig,
    ConsoleTracer,
    NoopTracer,
    ProxyAddressConfig,
} from '@tezos-domains/core';
import { TezosDomainsResolver, Resolver } from '@tezos-domains/resolver';
import { mock, instance, when, anyString, verify } from 'ts-mockito';
import { Tezos, TezosToolkit } from '@taquito/taquito';
import FakePromise from 'fake-promise';

describe('TezosDomainsResolver', () => {
    let resolver: TezosDomainsResolver;
    let tezosClientMock: TezosClient;
    let tezosProxyClientMock: TezosProxyClient;
    let proxyAddressResolverMock: ProxyContractAddressResolver;
    let proxyAddressConfig: ProxyAddressConfig;
    let noopTracerMock: NoopTracer;
    let consoleTracerMock: ConsoleTracer;
    let resolverMock: Resolver;

    beforeEach(() => {
        tezosProxyClientMock = mock(TezosProxyClient);
        tezosClientMock = mock(TezosClient);
        proxyAddressResolverMock = mock(ProxyContractAddressResolver);
        proxyAddressConfig = mock(ProxyAddressConfig);
        noopTracerMock = mock(NoopTracer);
        consoleTracerMock = mock(ConsoleTracer);
        resolverMock = mock(Resolver);

        (TezosClient as jest.Mock).mockReturnValue(instance(tezosClientMock));
        (ProxyContractAddressResolver as jest.Mock).mockReturnValue(instance(proxyAddressResolverMock));
        (TezosProxyClient as jest.Mock).mockReturnValue(instance(tezosProxyClientMock));
        (ProxyAddressConfig as jest.Mock).mockReturnValue(instance(proxyAddressConfig));
        (ConsoleTracer as jest.Mock).mockReturnValue(instance(consoleTracerMock));
        (NoopTracer as jest.Mock).mockReturnValue(instance(noopTracerMock));
        (Resolver as jest.Mock).mockReturnValue(instance(resolverMock));
    });

    describe('config', () => {
        it('should setup with default config', () => {
            console.log(TezosDomainsResolver);
            new TezosDomainsResolver();

            expect(TezosClient).toHaveBeenCalledWith(Tezos, instance(noopTracerMock));
            expect(ProxyAddressConfig).toHaveBeenCalledWith(undefined);
            expect(ProxyContractAddressResolver).toHaveBeenCalledWith(instance(proxyAddressConfig), instance(tezosClientMock), instance(noopTracerMock));
            expect(TezosProxyClient).toHaveBeenCalledWith(instance(tezosClientMock), instance(proxyAddressResolverMock));
            expect(Resolver).toHaveBeenCalledWith(instance(tezosProxyClientMock), instance(noopTracerMock));
        });

        it('should setup with custom config', () => {
            const customTezosToolkit = mock(TezosToolkit);
            const config: TezosDomainsConfig = { tezos: instance(customTezosToolkit), network: 'carthagenet', tracing: true };
            new TezosDomainsResolver(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(customTezosToolkit), instance(consoleTracerMock));
            expect(ProxyAddressConfig).toHaveBeenCalledWith(config);
            expect(ProxyContractAddressResolver).toHaveBeenCalledWith(instance(proxyAddressConfig), instance(tezosClientMock), instance(consoleTracerMock));
            expect(TezosProxyClient).toHaveBeenCalledWith(instance(tezosClientMock), instance(proxyAddressResolverMock));
            expect(Resolver).toHaveBeenCalledWith(instance(tezosProxyClientMock), instance(consoleTracerMock));
        });
    });

    describe('functionality', () => {
        let resolve: FakePromise<string | null>;
        let reverseResolve: FakePromise<string | null>;

        beforeEach(() => {
            resolve = new FakePromise();
            reverseResolve = new FakePromise();

            when(resolverMock.resolve(anyString())).thenReturn(resolve);
            when(resolverMock.reverseResolve(anyString())).thenReturn(reverseResolve);

            resolver = new TezosDomainsResolver();
        });

        describe('resolve()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.resolve('necroskillz.tez');

                verify(resolverMock.resolve('necroskillz.tez'));

                resolve.resolve('tz1xxx');

                await expect(address).resolves.toBe('tz1xxx');
            });
        });

        describe('reverseResolve()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.reverseResolve('tz1xxx');

                verify(resolverMock.reverseResolve('tz1xxx'));

                reverseResolve.resolve('necroskillz.tez');

                await expect(address).resolves.toBe('necroskillz.tez');
            });
        });
    });
});
