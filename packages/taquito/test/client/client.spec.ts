import { Tracer, RpcRequestData, BytesEncoder } from '@tezos-domains/core';
import { TaquitoClient } from '@tezos-domains/taquito';
import { RpcClient, ConstantsResponse } from '@taquito/rpc';
import { TezosToolkit, BigMapAbstraction, ContractAbstraction, Wallet, WalletContract, ContractMethod, TransactionWalletOperation } from '@taquito/taquito';
import { mock, instance, when, verify, anything, deepEqual } from 'ts-mockito';
import FakePromise from 'fake-promise';
import BigNumber from 'bignumber.js';
import { Tzip16ContractAbstraction, tzip16, View } from '@taquito/tzip16';

class TZip16ContractMock extends ContractAbstraction<Wallet> {
    tzip16(): Tzip16ContractAbstraction {
        throw new Error();
    }
}

describe('TaquitoClient', () => {
    let client: TaquitoClient;
    let tezosToolkitMock: TezosToolkit;
    let walletProviderMock: Wallet;
    let contractMock: WalletContract;
    let tzip16ContractMock: TZip16ContractMock;
    let tzip16Mock: Tzip16ContractAbstraction;
    let rpcClientMock: RpcClient;
    let tracerMock: Tracer;
    let storage: {
        bm: BigMapAbstraction;
        val: number;
    };
    let bigMapGet: FakePromise<string>;
    let methods: {
        method: () => ContractMethod<Wallet>;
    };
    let view: View;
    let views: Record<string, () => View>;
    let method: ContractMethod<Wallet>;
    let operation: TransactionWalletOperation;
    let constants: ConstantsResponse;

    beforeEach(() => {
        tezosToolkitMock = mock(TezosToolkit);
        tracerMock = mock<Tracer>();
        walletProviderMock = mock(Wallet);
        contractMock = mock(ContractAbstraction);
        tzip16ContractMock = mock(TZip16ContractMock);
        tzip16Mock = mock(Tzip16ContractAbstraction);
        const bigMap = mock(BigMapAbstraction);
        bigMapGet = new FakePromise();
        method = mock(ContractMethod);
        operation = mock(TransactionWalletOperation);
        rpcClientMock = mock(RpcClient);
        view = mock<View>();
        views = { 'test-view': () => instance(view) };

        when(bigMap.get('6161')).thenReturn(bigMapGet);
        storage = {
            bm: instance(bigMap),
            val: 1,
        };

        methods = {
            method: jest.fn(() => instance(method)),
        };

        constants = { time_between_blocks: [new BigNumber('60')] } as any;

        when(method.send(anything())).thenResolve(instance(operation));

        when(tezosToolkitMock.wallet).thenReturn(instance(walletProviderMock));
        when(tezosToolkitMock.rpc).thenReturn(instance(rpcClientMock));
        when(walletProviderMock.at('KT1xxx')).thenResolve(instance(contractMock));
        when(walletProviderMock.at('KT1xxx', tzip16)).thenResolve(instance(tzip16ContractMock));
        when(contractMock.storage()).thenResolve(storage);
        when(contractMock.methods).thenReturn(methods);
        when(tzip16ContractMock.tzip16()).thenReturn(instance(tzip16Mock));
        when(tzip16Mock.metadataViews()).thenResolve(views);
        when(view.executeView('param')).thenResolve('test-value');
        when(rpcClientMock.getConstants()).thenResolve(constants);
        when(tracerMock.trace(anything(), anything()));

        client = new TaquitoClient(instance(tezosToolkitMock), instance(tracerMock));
    });

    describe('storage()', () => {
        it('should return contract storage', async () => {
            const result = client.storage('KT1xxx');

            await expect(result).resolves.toBe(storage);
        });

        it('should get storage from cache', async () => {
            const result1 = await client.storage('KT1xxx');
            const result2 = await client.storage('KT1xxx');

            verify(contractMock.storage()).once();
            expect(result1).toBe(result2);
        });

        it('should get fresh storage if parameter is specified', async () => {
            const result1 = await client.storage('KT1xxx');
            const result2 = await client.storage('KT1xxx', true);

            verify(contractMock.storage()).twice();
            expect(result1).toBe(result2);
        });

        it('should not cache failed response', async () => {
            const err = new Error();
            let eresult: Error | null = null;
            when(contractMock.storage()).thenReject(err).thenResolve(storage);

            try {
                await client.storage('KT1xxx');
            } catch (e) {
                eresult = e;
            }
            const result = await client.storage('KT1xxx');

            expect(eresult).toBe(err);
            expect(result).toBe(storage);
        });
    });

    describe('getConstants()', () => {
        it('should return constants', async () => {
            const result = client.getConstants();

            await expect(result).resolves.toBe(constants);
        });

        it('should get constants from cache', async () => {
            const result1 = await client.getConstants();
            const result2 = await client.getConstants();

            verify(rpcClientMock.getConstants()).once();
            expect(result1).toBe(result2);
        });

        it('should not cache failed response', async () => {
            const err = new Error();
            let eresult: Error | null = null;
            when(rpcClientMock.getConstants()).thenReject(err).thenResolve(constants);

            try {
                await client.getConstants();
            } catch (e) {
                eresult = e;
            }
            const result = await client.getConstants();

            expect(eresult).toBe(err);
            expect(result).toBe(constants);
        });
    });

    describe('getBigMapValue()', () => {
        it('should get value from bigmap', async () => {
            const promise = client.getBigMapValue<{ bm: BigMapAbstraction }>('KT1xxx', s => s.bm, RpcRequestData.fromValue('aa', BytesEncoder));
            bigMapGet.resolve('value');

            const value = await promise;
            expect(value.scalar()).toBe('value');
        });

        it('should throw if bigmap is undefined', async () => {
            const promise = client.getBigMapValue<{ bad: BigMapAbstraction }>('KT1xxx', s => s.bad, RpcRequestData.fromValue('aa', BytesEncoder));

            await expect(promise).rejects.toEqual(new Error('Specified big map s => s.bad does not exist on contract with address KT1xxx.'));
        });
    });

    describe('call()', () => {
        it('should call contract method', async () => {
            const op = await client.call('KT1xxx', 'method', ['p1', 'p2'], 1);

            expect(methods.method).toHaveBeenCalledWith('p1', 'p2');

            verify(method.send(deepEqual({ amount: 1, mutez: true }))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('getPkh()', () => {
        it('should get pkh', async () => {
            when(walletProviderMock.pkh()).thenResolve('pkh');

            const pkh = await client.getPkh();

            expect(pkh).toBe('pkh');
        });
    });

    describe('executeView()', () => {
        it('should return result from view', async () => {
            const result = await client.executeView('KT1xxx', 'test-view', ['param']);

            expect(result.scalar()).toBe('test-value');
        });
    });
});
