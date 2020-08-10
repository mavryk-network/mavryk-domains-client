import { TezosClient, Tracer, RpcRequestData, BytesEncoder } from '@tezos-domains/core';
import { TezosToolkit, BigMapAbstraction, ContractAbstraction, Wallet, WalletContract, ContractMethod, TransactionWalletOperation } from '@taquito/taquito';
import { mock, instance, when, verify, anything, deepEqual } from 'ts-mockito';
import FakePromise from 'fake-promise';

describe('TezosClient', () => {
    let client: TezosClient;
    let tezosToolkitMock: TezosToolkit;
    let walletProviderMock: Wallet;
    let contractMock: WalletContract;
    let tracerMock: Tracer;
    let storage: {
        bm: BigMapAbstraction;
        val: number;
    };
    let bigMapGet: FakePromise<string>;
    let methods: {
        method: () => ContractMethod<Wallet>
    };
    let method: ContractMethod<Wallet>;
    let operation: TransactionWalletOperation;

    beforeEach(() => {
        tezosToolkitMock = mock(TezosToolkit);
        tracerMock = mock<Tracer>();
        walletProviderMock = mock(Wallet);
        contractMock = mock(ContractAbstraction);
        const bigMap = mock(BigMapAbstraction);
        bigMapGet = new FakePromise();
        method = mock(ContractMethod);
        operation = mock(TransactionWalletOperation);

        when(bigMap.get('6161')).thenReturn(bigMapGet);
        storage = {
            bm: instance(bigMap),
            val: 1,
        };

        methods = {
            method: jest.fn(() => instance(method))
        };

        when(method.send(anything())).thenResolve(instance(operation))

        when(tezosToolkitMock.wallet).thenReturn(instance(walletProviderMock));
        when(walletProviderMock.at('KT1xxx')).thenResolve(instance(contractMock));
        when(contractMock.storage()).thenResolve(storage);
        when(contractMock.methods).thenReturn(methods)
        when(tracerMock.trace(anything(), anything()));

        client = new TezosClient(instance(tezosToolkitMock), instance(tracerMock));
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
    });

    describe('getBigMapValue()', () => {
        it('should get value from bigmap', async () => {
            const promise = client.getBigMapValue<{ bm: BigMapAbstraction }>('KT1xxx', s => s.bm, RpcRequestData.fromValue('aa', BytesEncoder));
            bigMapGet.resolve('value');

            const value = await promise;
            expect(value.scalar()).toBe('value');
        });
    });

    describe('call', () => {
        it('should', async () => {
            const op = await client.call('KT1xxx', 'method', ['p1', 'p2'], 1);

            expect(methods.method).toHaveBeenCalledWith('p1', 'p2');

            verify(method.send(deepEqual({ amount: 1 }))).called();

            expect(op).toBe(instance(operation));
        });
    });
});
