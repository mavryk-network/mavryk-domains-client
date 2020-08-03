import { ResolverConfig } from './../../src/resolver/tezos-domains-resolver';
jest.mock('@tezos-domains/core');
jest.mock('../../src/resolver/blockchain-name-resolver');
jest.mock('../../src/resolver/cached-name-resolver');
jest.mock('@taquito/taquito');

import {
    TezosClient,
    TezosProxyClient,
    ProxyContractAddressResolver,
    ConsoleTracer,
    NoopTracer,
    ProxyAddressConfig,
} from '@tezos-domains/core';
import { TezosDomainsResolver, BlockchainNameResolver, CachedNameResolver } from '@tezos-domains/resolver';
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
    let blockchainNameResolverMock: BlockchainNameResolver;
    let cachedNameResolver: CachedNameResolver;

    beforeEach(() => {
        tezosProxyClientMock = mock(TezosProxyClient);
        tezosClientMock = mock(TezosClient);
        proxyAddressResolverMock = mock(ProxyContractAddressResolver);
        proxyAddressConfig = mock(ProxyAddressConfig);
        noopTracerMock = mock(NoopTracer);
        consoleTracerMock = mock(ConsoleTracer);
        blockchainNameResolverMock = mock(BlockchainNameResolver);
        cachedNameResolver = mock(CachedNameResolver);

        (TezosClient as jest.Mock).mockReturnValue(instance(tezosClientMock));
        (ProxyContractAddressResolver as jest.Mock).mockReturnValue(instance(proxyAddressResolverMock));
        (TezosProxyClient as jest.Mock).mockReturnValue(instance(tezosProxyClientMock));
        (ProxyAddressConfig as jest.Mock).mockReturnValue(instance(proxyAddressConfig));
        (ConsoleTracer as jest.Mock).mockReturnValue(instance(consoleTracerMock));
        (NoopTracer as jest.Mock).mockReturnValue(instance(noopTracerMock));
        (BlockchainNameResolver as jest.Mock).mockReturnValue(instance(blockchainNameResolverMock));
        (CachedNameResolver as jest.Mock).mockReturnValue(instance(cachedNameResolver));
    });

    describe('config', () => {
        it('should setup with default config', () => {
            new TezosDomainsResolver();

            expect(TezosClient).toHaveBeenCalledWith(Tezos, instance(noopTracerMock));
            expect(ProxyAddressConfig).toHaveBeenCalledWith(undefined);
            expect(ProxyContractAddressResolver).toHaveBeenCalledWith(instance(proxyAddressConfig), instance(tezosClientMock), instance(noopTracerMock));
            expect(TezosProxyClient).toHaveBeenCalledWith(instance(tezosClientMock), instance(proxyAddressResolverMock));
            expect(BlockchainNameResolver).toHaveBeenCalledWith(instance(tezosProxyClientMock), instance(noopTracerMock));
            expect(CachedNameResolver).not.toHaveBeenCalled();
        });

        it('should setup with custom config', () => {
            const customTezosToolkit = mock(TezosToolkit);
            const config: ResolverConfig = {
                tezos: instance(customTezosToolkit),
                network: 'carthagenet',
                tracing: true,
                caching: { enabled: true, recordTtl: 50, reverseRecordTtl: 60 },
            };
            new TezosDomainsResolver(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(customTezosToolkit), instance(consoleTracerMock));
            expect(ProxyAddressConfig).toHaveBeenCalledWith(config);
            expect(ProxyContractAddressResolver).toHaveBeenCalledWith(instance(proxyAddressConfig), instance(tezosClientMock), instance(consoleTracerMock));
            expect(TezosProxyClient).toHaveBeenCalledWith(instance(tezosClientMock), instance(proxyAddressResolverMock));
            expect(BlockchainNameResolver).toHaveBeenCalledWith(instance(tezosProxyClientMock), instance(consoleTracerMock));
            expect(CachedNameResolver).toHaveBeenCalledWith(instance(blockchainNameResolverMock), instance(consoleTracerMock), {
                recordTtl: 50,
                reverseRecordTtl: 60,
            });
        });
    });

    describe('functionality', () => {
        let resolve: FakePromise<string | null>;
        let reverseResolve: FakePromise<string | null>;

        beforeEach(() => {
            resolve = new FakePromise();
            reverseResolve = new FakePromise();

            when(blockchainNameResolverMock.resolve(anyString())).thenReturn(resolve);
            when(blockchainNameResolverMock.reverseResolve(anyString())).thenReturn(reverseResolve);
            when(cachedNameResolver.resolve(anyString())).thenReturn(resolve);
            when(cachedNameResolver.reverseResolve(anyString())).thenReturn(reverseResolve);

            resolver = new TezosDomainsResolver();
        });

        describe('resolve()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.resolve('necroskillz.tez');

                verify(blockchainNameResolverMock.resolve('necroskillz.tez'));

                resolve.resolve('tz1xxx');

                await expect(address).resolves.toBe('tz1xxx');
            });

            it('should call actual resolver (with caching)', async () => {
                resolver = new TezosDomainsResolver({ caching: { enabled: true } });

                const address = resolver.resolve('necroskillz.tez');

                verify(cachedNameResolver.resolve('necroskillz.tez'));

                resolve.resolve('tz1xxx');

                await expect(address).resolves.toBe('tz1xxx');
            });
        });

        describe('reverseResolve()', () => {
            it('should call actual resolver', async () => {
                const address = resolver.reverseResolve('tz1xxx');

                verify(blockchainNameResolverMock.reverseResolve('tz1xxx'));

                reverseResolve.resolve('necroskillz.tez');

                await expect(address).resolves.toBe('necroskillz.tez');
            });

            it('should call actual resolver (with caching)', async () => {
                resolver = new TezosDomainsResolver({ caching: { enabled: true } });

                const address = resolver.reverseResolve('tz1xxx');

                verify(cachedNameResolver.reverseResolve('tz1xxx'));

                reverseResolve.resolve('necroskillz.tez');

                await expect(address).resolves.toBe('necroskillz.tez');
            });
        });
    });
});
