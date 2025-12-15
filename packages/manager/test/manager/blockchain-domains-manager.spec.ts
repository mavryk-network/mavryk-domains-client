import { TransactionWalletOperation, WalletTransferParams, WalletOperation } from '@mavrykdynamics/taquito';
import { Exact, Tracer, RecordMetadata, AdditionalOperationParams } from '@mavrykdynamics/mavryk-domains-core';
import { TaquitoClient } from '@mavrykdynamics/mavryk-domains-taquito';
import {
    DomainsManager,
    BlockchainDomainsManager,
    DomainAcquisitionState,
    CommitmentRequest,
    MavrykDomainsOperationFactory,
    DomainAcquisitionInfo,
    TaquitoManagerDataProvider,
} from '@mavrykdynamics/mavryk-domains-manager';
import { mock, when, anything, instance, verify, deepEqual, anyString } from 'ts-mockito';
import MockDate from 'mockdate';

describe('BlockchainDomainsManager', () => {
    let manager: DomainsManager;
    let taquitoClientMock: TaquitoClient;
    let tracerMock: Tracer;
    let dataProviderMock: TaquitoManagerDataProvider;
    let operationFactory: MavrykDomainsOperationFactory<WalletTransferParams>;
    let operation: TransactionWalletOperation;
    let batchOperation: WalletOperation;
    let params: WalletTransferParams;
    let additionalParams: AdditionalOperationParams;

    beforeEach(() => {
        taquitoClientMock = mock(TaquitoClient);
        tracerMock = mock<Tracer>();
        dataProviderMock = mock(TaquitoManagerDataProvider);
        operationFactory = mock<MavrykDomainsOperationFactory<WalletTransferParams>>();
        operation = mock(TransactionWalletOperation);
        batchOperation = mock(WalletOperation);
        additionalParams = { storageLimit: 666, gasLimit: 420, fee: 69 };

        when(tracerMock.trace(anything(), anything(), anything()));

        when(operationFactory.bid(anyString(), anything(), anything())).thenResolve(params);
        when(operationFactory.buy(anyString(), anything(), anything())).thenResolve(params);
        when(operationFactory.claimReverseRecord(anything(), anything())).thenResolve(params);
        when(operationFactory.commit(anyString(), anything(), anything())).thenResolve(params);
        when(operationFactory.renew(anyString(), anything(), anything())).thenResolve(params);
        when(operationFactory.setChildRecord(anything(), anything())).thenResolve(params);
        when(operationFactory.settle(anyString(), anything(), anything())).thenResolve(params);
        when(operationFactory.updateRecord(anything(), anything())).thenResolve(params);
        when(operationFactory.updateReverseRecord(anything(), anything())).thenResolve(params);
        when(operationFactory.withdraw(anyString(), anyString(), anything())).thenResolve(params);
        when(operationFactory.transfer(anyString(), anyString(), anything())).thenResolve(params);

        when(taquitoClientMock.call(deepEqual(params))).thenResolve(instance(operation));
        when(taquitoClientMock.batch(deepEqual([params]))).thenResolve(instance(batchOperation));

        when(operation.opHash).thenReturn('op_hash');

        manager = new BlockchainDomainsManager(instance(taquitoClientMock), instance(tracerMock), instance(operationFactory), instance(dataProviderMock));
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('setChildRecord()', () => {
        it('should call smart contract', async () => {
            const request = {
                label: 'necroskillz',
                parent: 'mav',
                data: new RecordMetadata({ ttl: '31' }),
                owner: 'mv1xxx',
                address: 'mv1yyy',
                expiry: new Date(new Date(2021, 10, 11, 8).getTime() - new Date(2021, 10, 11).getTimezoneOffset() * 60000),
            };

            const op = await manager.setChildRecord(request, additionalParams);

            verify(operationFactory.setChildRecord(request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('updateRecord()', () => {
        it('should call smart contract', async () => {
            const request = {
                name: 'necroskillz.mav',
                data: new RecordMetadata({ ttl: '31' }),
                owner: 'mv1xxx',
                address: 'mv1yyy',
            };

            const op = await manager.updateRecord(request, additionalParams);

            verify(operationFactory.updateRecord(request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('commit()', () => {
        it('should call smart contract', async () => {
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'mv1xxx', nonce: 1 };

            const op = await manager.commit('mav', params, additionalParams);

            verify(operationFactory.commit('mav', params, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('buy()', () => {
        it('should call smart contract with price', async () => {
            const request = {
                duration: 365,
                label: 'alice',
                owner: 'mv1xxx',
                address: 'mv1yyy',
                data: new RecordMetadata({ ttl: '31' }),
                nonce: 1,
            };

            const op = await manager.buy('mav', request, additionalParams);

            verify(operationFactory.buy('mav', request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('renew()', () => {
        it('should call smart contract with price', async () => {
            const request = {
                duration: 365,
                label: 'necroskillz2',
            };

            const op = await manager.renew('mav', request, additionalParams);

            verify(operationFactory.renew('mav', request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('claimReverseRecord()', () => {
        it('should call smart contract', async () => {
            const request = {
                name: 'necroskillz.mav',
                owner: 'mv1xxx',
            };

            const op = await manager.claimReverseRecord(request, additionalParams);

            verify(operationFactory.claimReverseRecord(request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('updateReverseRecord()', () => {
        it('should call smart contract', async () => {
            const request = {
                address: 'mv1xxx',
                name: 'necroskillz.mav',
                owner: 'mv1yyy',
            };

            const op = await manager.updateReverseRecord(request, additionalParams);

            verify(operationFactory.updateReverseRecord(request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('getCommitment()', () => {
        it('should get existing commitment from data provider and return info', async () => {
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'mv1xxx', nonce: 1 };
            const commitment = {
                created: new Date(),
            };

            when(dataProviderMock.getCommitment('mav', params)).thenResolve(commitment as any);

            const c = await manager.getCommitment('mav', params);

            expect(c).toBe(commitment);
        });
    });

    describe('getAcquisitionInfo()', () => {
        it('should get info about a new domain that can be bought', async () => {
            const info = DomainAcquisitionInfo.createBuyOrRenew(DomainAcquisitionState.Taken, { minDuration: 1, pricePerMinDuration: 1 });

            when(dataProviderMock.getAcquisitionInfo('alice.mav')).thenResolve(info);

            const i = await manager.getAcquisitionInfo('alice.mav');

            expect(i).toBe(info);
        });
    });

    describe('getBidderBalance()', () => {
        it('should get balance for existing bidder', async () => {
            when(dataProviderMock.getBidderBalance('mav', 'mv1PZMMCSSwAgDy5cgNTBMtanUn6QB9wrvqm')).thenResolve(10);

            const balance = await manager.getBidderBalance('mav', 'mv1PZMMCSSwAgDy5cgNTBMtanUn6QB9wrvqm');

            expect(balance).toBe(10);
        });
    });

    describe('getTldConfiguration()', () => {
        it('should get tld config', async () => {
            const config = { prop: 'a' };
            when(dataProviderMock.getTldConfiguration('mav')).thenResolve(config as any);

            const configuration = await manager.getTldConfiguration('mav');

            expect(configuration).toBe(config);
        });
    });

    describe('bid()', () => {
        it('should call smart contract with bid amount', async () => {
            const request = {
                label: 'necroskillz',
                bid: 5e6,
            };

            const op = await manager.bid('mav', request, additionalParams);

            verify(operationFactory.bid('mav', request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('settle()', () => {
        it('should call smart contract', async () => {
            const request = {
                label: 'necroskillz',
                owner: 'mv1xxx',
                address: 'mv1yyy',
                data: new RecordMetadata({ ttl: '31' }),
            };

            const op = await manager.settle('mav', request, additionalParams);

            verify(operationFactory.settle('mav', request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('withdraw()', () => {
        it('should call smart contract', async () => {
            const op = await manager.withdraw('mav', 'mv1PZMMCSSwAgDy5cgNTBMtanUn6QB9wrvqm', additionalParams);

            verify(operationFactory.withdraw('mav', 'mv1PZMMCSSwAgDy5cgNTBMtanUn6QB9wrvqm', deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('transfer()', () => {
        it('should call smart contract', async () => {
            const op = await manager.transfer('alice.mav', 'mv1PZMMCSSwAgDy5cgNTBMtanUn6QB9wrvqm', additionalParams);

            verify(operationFactory.transfer('alice.mav', 'mv1PZMMCSSwAgDy5cgNTBMtanUn6QB9wrvqm', deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('getTokenId()', () => {
        it('should get tokenId', async () => {
            when(dataProviderMock.getTokenId('alice.mav')).thenResolve(1);

            const tokenId = await manager.getTokenId('alice.mav');

            expect(tokenId).toBe(1);
        });
    });

    describe('batch()', () => {
        it('should call batch', async () => {
            const op = await manager.batch(() => Promise.resolve([params]));

            expect(op).toBe(instance(batchOperation));
        });
    });
});
