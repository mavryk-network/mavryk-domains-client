jest.mock('@tezos-domains/core');
jest.mock('@taquito/taquito');

import {
    TezosClient,
    TezosProxyClient,
    ProxyContractAddressResolver,
    smartContract,
    SmartContractType,
    Exact,
    DomainRecord,
    ReverseRecord,
    TezosDomainsConfig,
    ConsoleTracer,
    RpcRequestScalarData,
    NoopTracer,
    RpcRequestData,
    BytesEncoder,
    RpcResponseData,
    ProxyAddressConfig,
    DateEncoder,
} from '@tezos-domains/core';
import { TezosDomainsResolver } from '@tezos-domains/resolver';
import { mock, instance, when, anyFunction, anything } from 'ts-mockito';
import { Tezos, TezosToolkit } from '@taquito/taquito';
import MockDate from 'mockdate';

interface FakeNameRegistryStorage {
    records: Record<string, Exact<DomainRecord>>;
    reverse_records: Record<string, Exact<ReverseRecord>>;
    validity_map: Record<string, Date>;
}

function unmockCtor(type: any) {
    (type as jest.Mock).mockImplementation((...args: string[]) => {
        const ctor = jest.requireActual('@tezos-domains/core')[type.name];
        return new ctor(...args);
    });
}

function unmockFn(fn: any) {
    (fn as jest.Mock).mockImplementation((...args: string[]) => jest.requireActual('@tezos-domains/core')[fn.name](...args));
}

function unmockStatic(type: any, fn: string) {
    type[fn] = jest.requireActual('@tezos-domains/core')[type.name][fn];
}

describe('TezosDomainsResolver', () => {
    let resolver: TezosDomainsResolver;
    let tezosClientMock: TezosClient;
    let tezosProxyClientMock: TezosProxyClient;
    let proxyAddressResolverMock: ProxyContractAddressResolver;
    let proxyAddressConfig: ProxyAddressConfig;
    let noopTracerMock: NoopTracer;
    let consoleTracerMock: ConsoleTracer;

    beforeEach(() => {
        tezosProxyClientMock = mock(TezosProxyClient);
        tezosClientMock = mock(TezosClient);
        proxyAddressResolverMock = mock(ProxyContractAddressResolver);
        proxyAddressConfig = mock(ProxyAddressConfig);
        noopTracerMock = mock(NoopTracer);
        consoleTracerMock = mock(ConsoleTracer);

        MockDate.set(new Date(2020, 10, 11, 20, 0, 0));

        (TezosClient as jest.Mock).mockReturnValue(instance(tezosClientMock));
        (ProxyContractAddressResolver as jest.Mock).mockReturnValue(instance(proxyAddressResolverMock));
        (TezosProxyClient as jest.Mock).mockReturnValue(instance(tezosProxyClientMock));
        (ProxyAddressConfig as jest.Mock).mockReturnValue(instance(proxyAddressConfig));
        (ConsoleTracer as jest.Mock).mockReturnValue(instance(consoleTracerMock));
        (NoopTracer as jest.Mock).mockReturnValue(instance(noopTracerMock));

        unmockFn(smartContract);
        unmockCtor(RpcResponseData);
        unmockCtor(RpcRequestScalarData);
        unmockCtor(BytesEncoder);
        unmockCtor(DateEncoder);
        unmockStatic(RpcRequestData, 'fromValue');
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('config', () => {
        it('should setup with default config', () => {
            new TezosDomainsResolver();

            expect(TezosClient).toHaveBeenCalledWith(Tezos, instance(noopTracerMock));
            expect(ProxyAddressConfig).toHaveBeenCalledWith(undefined);
            expect(ProxyContractAddressResolver).toHaveBeenCalledWith(instance(proxyAddressConfig), instance(tezosClientMock), instance(noopTracerMock));
            expect(TezosProxyClient).toHaveBeenCalledWith(instance(tezosClientMock), instance(proxyAddressResolverMock));
        });

        it('should setup with custom config', () => {
            const customTezosToolkit = mock(TezosToolkit);
            const config: TezosDomainsConfig = { tezos: instance(customTezosToolkit), network: 'carthagenet', tracing: true };
            new TezosDomainsResolver(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(customTezosToolkit), instance(consoleTracerMock));
            expect(ProxyAddressConfig).toHaveBeenCalledWith(config);
            expect(ProxyContractAddressResolver).toHaveBeenCalledWith(instance(proxyAddressConfig), instance(tezosClientMock), instance(consoleTracerMock));
            expect(TezosProxyClient).toHaveBeenCalledWith(instance(tezosClientMock), instance(proxyAddressResolverMock));
        });
    });

    describe('functionality', () => {
        const storage: FakeNameRegistryStorage = {
            records: {
                'play.necroskillz.tez': {
                    validity_key: 'necroskillz.tez',
                    address: 'tz1xxx',
                },
                'expired.tez': {
                    validity_key: 'expired.tez',
                    address: 'tz1eee',
                },
                'no-address.tez': {
                    validity_key: 'no-address.tez',
                },
            },
            validity_map: {
                'necroskillz.tez': new Date(2021, 1, 1),
                'expired.tez': new Date(2019, 1, 1),
            },
            reverse_records: {
                tz1xxx: {
                    name: 'play.necroskillz.tez',
                    owner: 'tz1zzz',
                },
                tz1eee: {
                    name: 'expired.tez',
                    owner: 'tz1ezz',
                },
                orphan: {
                    name: 'orphan.tez',
                    owner: 'tz1aaa',
                },
                'no-name': {
                    owner: 'tz1aaa',
                },
            },
        };

        beforeEach(() => {
            resolver = new TezosDomainsResolver();

            when(
                tezosProxyClientMock.getBigMapValue(SmartContractType.NameRegistry, anyFunction(), anything())
            ).thenCall((_, selector, key: RpcRequestScalarData<string>) => Promise.resolve(new RpcResponseData(selector(storage)[key.originalValue])));
        });

        describe('resolve()', () => {
            it('should resolve name', async () => {
                const address = await resolver.resolve('play.necroskillz.tez');

                expect(address).toBe('tz1xxx');
            });

            it('should return null if record does not exist', async () => {
                const address = await resolver.resolve('404.tez');

                expect(address).toBe(null);
            });

            it('should return null if record is expired', async () => {
                const address = await resolver.resolve('expired.tez');

                expect(address).toBe(null);
            });

            it('should return null if record has no address', async () => {
                const address = await resolver.resolve('no-address.tez');

                expect(address).toBe(null);
            });

            it('should throw when name is null', async () => {
                await expect(() => resolver.resolve(null as any)).rejects.toEqual(new Error(`Argument 'name' was not specified.`));
            });
        });

        describe('reverseResolve()', () => {
            it('should resolve address', async () => {
                const name = await resolver.reverseResolve('tz1xxx');

                expect(name).toBe('play.necroskillz.tez');
            });

            it('should return null if reverse record does not exist', async () => {
                const name = await resolver.reverseResolve('404');

                expect(name).toBe(null);
            });

            it('should return null if associated record is expired', async () => {
                const name = await resolver.reverseResolve('tz1eee');

                expect(name).toBe(null);
            });

            it('should return null if associated record does not exist', async () => {
                const name = await resolver.reverseResolve('orphan');

                expect(name).toBe(null);
            });

            it('should return null if reverse record has no name', async () => {
                const name = await resolver.reverseResolve('no-name');

                expect(name).toBe(null);
            });
            
            it('should throw when address is null', async () => {
                await expect(() => resolver.reverseResolve(null as any)).rejects.toEqual(new Error(`Argument 'address' was not specified.`));
            });
        });
    });
});
