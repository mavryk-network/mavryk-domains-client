import { TransactionWalletOperation, WalletTransferParams, WalletOperation } from '@taquito/taquito';
import { Exact, Tracer, AddressBook, RecordMetadata, AdditionalOperationParams } from '@tezos-domains/core';
import { TaquitoClient } from '@tezos-domains/taquito';
import {
    DomainsManager,
    BlockchainDomainsManager,
    DomainAcquisitionState,
    CommitmentRequest,
    TezosDomainsOperationFactory,
    DomainAcquisitionInfo,
    TaquitoManagerDataProvider,
} from '@tezos-domains/manager';
import { mock, when, anything, instance, verify, deepEqual, anyString } from 'ts-mockito';
import MockDate from 'mockdate';

describe('BlockchainDomainsManager', () => {
    let manager: DomainsManager;
    let taquitoClientMock: TaquitoClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;
    let dataProviderMock: TaquitoManagerDataProvider;
    let operationFactory: TezosDomainsOperationFactory<WalletTransferParams>;
    let operation: TransactionWalletOperation;
    let batchOperation: WalletOperation;
    let params: WalletTransferParams;
    let additionalParams: AdditionalOperationParams;

    beforeEach(() => {
        taquitoClientMock = mock(TaquitoClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock<Tracer>();
        dataProviderMock = mock(TaquitoManagerDataProvider);
        operationFactory = mock<TezosDomainsOperationFactory<WalletTransferParams>>();
        operation = mock(TransactionWalletOperation);
        batchOperation = mock(WalletOperation);
        additionalParams = { storageLimit: 666, gasLimit: 420, fee: 69 };

        when(tracerMock.trace(anything(), anything(), anything()));

        when(addressBookMock.lookup(anything(), anything())).thenCall((type, p1) => Promise.resolve(`${type}addr${p1 || ''}`));
        when(addressBookMock.lookup(anything(), anything(), anything())).thenCall((type, p1, p2) => Promise.resolve(`${type}addr${p1 || ''}${p2 || ''}`));

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
                parent: 'tez',
                data: new RecordMetadata({ ttl: '31' }),
                owner: 'tz1xxx',
                address: 'tz1yyy',
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
                name: 'necroskillz.tez',
                data: new RecordMetadata({ ttl: '31' }),
                owner: 'tz1xxx',
                address: 'tz1yyy',
            };

            const op = await manager.updateRecord(request, additionalParams);

            verify(operationFactory.updateRecord(request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('commit()', () => {
        it('should call smart contract', async () => {
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 };

            const op = await manager.commit('tez', params, additionalParams);

            verify(operationFactory.commit('tez', params, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('buy()', () => {
        it('should call smart contract with price', async () => {
            const request = {
                duration: 365,
                label: 'alice',
                owner: 'tz1xxx',
                address: 'tz1yyy',
                data: new RecordMetadata({ ttl: '31' }),
                nonce: 1,
            };

            const op = await manager.buy('tez', request, additionalParams);

            verify(operationFactory.buy('tez', request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('renew()', () => {
        it('should call smart contract with price', async () => {
            const request = {
                duration: 365,
                label: 'necroskillz2',
            };

            const op = await manager.renew('tez', request, additionalParams);

            verify(operationFactory.renew('tez', request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('claimReverseRecord()', () => {
        it('should call smart contract', async () => {
            const request = {
                name: 'necroskillz.tez',
                owner: 'tz1xxx',
            };

            const op = await manager.claimReverseRecord(request, additionalParams);

            verify(operationFactory.claimReverseRecord(request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('updateReverseRecord()', () => {
        it('should call smart contract', async () => {
            const request = {
                address: 'tz1xxx',
                name: 'necroskillz.tez',
                owner: 'tz1yyy',
            };

            const op = await manager.updateReverseRecord(request, additionalParams);

            verify(operationFactory.updateReverseRecord(request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('getCommitment()', () => {
        it('should get existing commitment from data provider and return info', async () => {
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 };
            const commitment = {
                created: new Date(),
            };

            when(dataProviderMock.getCommitment('tez', params)).thenResolve(commitment as any);

            const c = await manager.getCommitment('tez', params);

            expect(c).toBe(commitment);
        });
    });

    describe('getAcquisitionInfo()', () => {
        it('should get info about a new domain that can be bought', async () => {
            const info = DomainAcquisitionInfo.createBuyOrRenew(DomainAcquisitionState.Taken, { minDuration: 1, pricePerMinDuration: 1 });

            when(dataProviderMock.getAcquisitionInfo('alice.tez')).thenResolve(info);

            const i = await manager.getAcquisitionInfo('alice.tez');

            expect(i).toBe(info);
        });
    });

    describe('getBidderBalance()', () => {
        it('should get balance for existing bidder', async () => {
            when(dataProviderMock.getBidderBalance('tez', 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix')).thenResolve(10);

            const balance = await manager.getBidderBalance('tez', 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');

            expect(balance).toBe(10);
        });
    });

    describe('getTldConfiguration()', () => {
        it('should get tld config', async () => {
            const config = { prop: 'a' };
            when(dataProviderMock.getTldConfiguration('tez')).thenResolve(config as any);

            const configuration = await manager.getTldConfiguration('tez');

            expect(configuration).toBe(config);
        });
    });

    describe('bid()', () => {
        it('should call smart contract with bid amount', async () => {
            const request = {
                label: 'necroskillz',
                bid: 5e6,
            };

            const op = await manager.bid('tez', request, additionalParams);

            verify(operationFactory.bid('tez', request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('settle()', () => {
        it('should call smart contract', async () => {
            const request = {
                label: 'necroskillz',
                owner: 'tz1xxx',
                address: 'tz1yyy',
                data: new RecordMetadata({ ttl: '31' }),
            };

            const op = await manager.settle('tez', request, additionalParams);

            verify(operationFactory.settle('tez', request, deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('withdraw()', () => {
        it('should call smart contract', async () => {
            const op = await manager.withdraw('tez', 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix', additionalParams);

            verify(operationFactory.withdraw('tez', 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix', deepEqual(additionalParams))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('batch()', () => {
        it('should call batch', async () => {
            const op = await manager.batch(() => Promise.resolve([params]));

            expect(op).toBe(instance(batchOperation));
        });
    });
});
