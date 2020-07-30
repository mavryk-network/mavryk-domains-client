import { TezosProxyClient, TezosClient, ProxyContractAddressResolver, RpcResponseData, RpcRequestScalarData, RpcRequestData } from '@tezos-domains/core';
import { BigMapAbstraction } from '@taquito/taquito';
import { mock, instance, when, anything, anyFunction, capture } from 'ts-mockito';
import FakePromise from 'fake-promise';

describe('TezosProxyClient', () => {
    let client: TezosProxyClient;
    let tezosClientMock: TezosClient;
    let proxyAddressResolver: ProxyContractAddressResolver;
    let storage: FakePromise<any>;
    let bigMapGet: FakePromise<any>;
    let key: RpcRequestScalarData<string>;

    beforeEach(() => {
        tezosClientMock = mock(TezosClient);
        proxyAddressResolver = mock(ProxyContractAddressResolver);
        storage = new FakePromise();
        bigMapGet = new FakePromise();
        key = RpcRequestData.fromValue('key');

        when(proxyAddressResolver.resolve('smc')).thenResolve('KT1xxx');
        when(tezosClientMock.storage('KT1xxx', anything())).thenReturn(storage);
        when(tezosClientMock.getBigMapValue('KT1xxx', anyFunction(), key)).thenReturn(bigMapGet as any);

        client = new TezosProxyClient(instance(tezosClientMock), instance(proxyAddressResolver));
    });

    describe('storage()', () => {
        it('should return contract storage', async () => {
            const result = client.storage('smc');

            storage.resolve({ value: 'val' });

            await expect(result).resolves.toEqual({ value: 'val' });
        });
    });

    describe('getBigMapValue()', () => {
        it('should get value from bigmap', async () => {
            const promise = client.getBigMapValue<{ bm: BigMapAbstraction }>('smc', s => s.bm, key);

            bigMapGet.resolve(new RpcResponseData('value'));

            const value = await promise;
            expect(value.scalar()).toBe('value');

            const contractStorageShape = { bm: 'a' };
            expect(capture<string, (storage: any) => any, RpcRequestScalarData<string>>(tezosClientMock.getBigMapValue).first()[1](contractStorageShape)).toBe(
                'a'
            );
        });
    });
});
