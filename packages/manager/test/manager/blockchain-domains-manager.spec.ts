import { TransactionWalletOperation, MichelsonMap } from '@taquito/taquito';
import {
    SmartContractType,
    Exact,
    RpcRequestScalarData,
    RpcResponseData,
    Tracer,
    AddressBook,
    TezosClient,
    BytesEncoder,
    RecordMetadata,
} from '@tezos-domains/core';
import { DomainsManager, CommitmentGenerator, BlockchainDomainsManager } from '@tezos-domains/manager';
import { mock, when, anyFunction, anything, instance, anyString, verify, anyOfClass, deepEqual, anyNumber, capture } from 'ts-mockito';
import MockDate from 'mockdate';
import BigNumber from 'bignumber.js';

import { TLDRecord, CommitmentRequest } from './../../src/manager/model';

interface FakeTLDRegistrarStorage {
    store: {
        records: Record<string, Exact<TLDRecord>>;
        commitments: Record<string, string>;
        config: MichelsonMap<string, any>;
    };
}

const e = (s: string) => new BytesEncoder().encode(s)!;

describe('BlockchainDomainsManager', () => {
    let manager: DomainsManager;
    let tezosClientMock: TezosClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;
    let commitmentGeneratorMock: CommitmentGenerator;
    let operation: TransactionWalletOperation;

    const config = new MichelsonMap<string, any>();
    config.set('min_bid_per_day', new BigNumber(3 * 1e12));
    config.set('min_commitment_age', new BigNumber(60));
    config.set('max_commitment_age', new BigNumber(60 * 60));

    const storage: FakeTLDRegistrarStorage = {
        store: {
            records: {},
            commitments: {},
            config
        },
    };

    beforeEach(() => {
        tezosClientMock = mock(TezosClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock<Tracer>();
        commitmentGeneratorMock = mock(CommitmentGenerator);
        operation = mock(TransactionWalletOperation);

        storage.store.commitments['commitment'] = '2020-10-01T10:00:00.000Z';

        storage.store.records[e('necroskillz.tez')] = { price_per_day: new BigNumber(20 * 1e12), expiration_date: new Date(2021, 1, 1) };
        storage.store.records[e('expired.tez')] = { price_per_day: new BigNumber(50 * 1e12), expiration_date: new Date(2019, 1, 1) };

        when(tracerMock.trace(anything(), anything(), anything()));

        when(addressBookMock.lookup(anything(), anything())).thenCall((type, p1) => Promise.resolve(`${type}addr${p1 || ''}`));
        when(addressBookMock.lookup(anything(), anything(), anything())).thenCall((type, p1, p2) => Promise.resolve(`${type}addr${p1 || ''}${p2 || ''}`));

        when(
            tezosClientMock.getBigMapValue(`${SmartContractType.TLDRegistrar}addrtez`, anyFunction(), anything())
        ).thenCall((_, selector, key: RpcRequestScalarData<string>) => Promise.resolve(new RpcResponseData(selector(storage)[key.encode()!])));
        when(tezosClientMock.storage(`${SmartContractType.TLDRegistrar}addrtez`)).thenResolve(storage);
        when(tezosClientMock.call(anyString(), anyString(), anything())).thenResolve(instance(operation));
        when(tezosClientMock.call(anyString(), anyString(), anything(), anyNumber())).thenResolve(instance(operation));

        when(operation.opHash).thenReturn('op_hash');

        MockDate.set(new Date(2020, 10, 11, 20, 0, 0));

        manager = new BlockchainDomainsManager(instance(tezosClientMock), instance(addressBookMock), instance(tracerMock), instance(commitmentGeneratorMock));
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('setChildRecord()', () => {
        it('should call smart contract', async () => {
            const op = await manager.setChildRecord({
                label: 'necroskillz',
                parent: 'tez',
                data: new RecordMetadata({ ttl: '31' }),
                owner: 'tz1xxx',
                address: 'tz1yyy',
                expiry: new Date(new Date(2021, 10, 11, 8).getTime() - new Date().getTimezoneOffset() * 60000),
            });

            verify(
                tezosClientMock.call(
                    `${SmartContractType.NameRegistry}addrset_child_record`,
                    'set_child_record',
                    deepEqual([e('necroskillz'), e('tez'), 'tz1yyy', 'tz1xxx', anyOfClass(MichelsonMap), '2021-11-11T08:00:00.000Z'])
                )
            ).called();

            expect(capture(tezosClientMock.call).last()[2][4].get('ttl')).toBe('31');

            expect(op).toBe(instance(operation));
        });
    });

    describe('updateRecord()', () => {
        it('should call smart contract', async () => {
            const op = await manager.updateRecord({
                name: 'necroskillz.tez',
                data: new RecordMetadata({ ttl: '31' }),
                owner: 'tz1xxx',
                address: 'tz1yyy',
            });

            verify(
                tezosClientMock.call(
                    `${SmartContractType.NameRegistry}addrupdate_record`,
                    'update_record',
                    deepEqual([e('necroskillz.tez'), 'tz1yyy', 'tz1xxx', anyOfClass(MichelsonMap)])
                )
            ).called();
            expect(capture(tezosClientMock.call).last()[2][3].get('ttl')).toBe('31');

            expect(op).toBe(instance(operation));
        });
    });

    describe('commit()', () => {
        it('should call smart contract', async () => {
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx' };

            when(commitmentGeneratorMock.generate(deepEqual(params))).thenResolve('commitment');

            const op = await manager.commit('tez', params);

            verify(tezosClientMock.call(`${SmartContractType.TLDRegistrar}addrtezcommit`, 'commit', deepEqual(['commitment']))).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('buy()', () => {
        it('should call smart contract with price', async () => {
            const op = await manager.buy('tez', {
                duration: 365,
                label: 'necroskillz',
                owner: 'tz1xxx',
            });

            verify(tezosClientMock.call(`${SmartContractType.TLDRegistrar}addrtezbuy`, 'buy', deepEqual([e('necroskillz'), 365, 'tz1xxx']), 7300)).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('renew()', () => {
        it('should call smart contract with price', async () => {
            const op = await manager.renew('tez', {
                duration: 365,
                label: 'necroskillz2',
            });

            verify(tezosClientMock.call(`${SmartContractType.TLDRegistrar}addrtezrenew`, 'renew', deepEqual([e('necroskillz2'), 365]), 1095)).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('claimReverseRecord()', () => {
        it('should call smart contract', async () => {
            const op = await manager.claimReverseRecord({
                name: 'necroskillz.tez',
                owner: 'tz1xxx',
                data: new RecordMetadata({ ttl: '31' }),
            });

            verify(
                tezosClientMock.call(
                    `${SmartContractType.NameRegistry}addrclaim_reverse_record`,
                    'claim_reverse_record',
                    deepEqual([e('necroskillz.tez'), 'tz1xxx', anyOfClass(MichelsonMap)])
                )
            ).called();
            expect(capture(tezosClientMock.call).last()[2][2].get('ttl')).toBe('31');

            expect(op).toBe(instance(operation));
        });
    });

    describe('updateReverseRecord()', () => {
        it('should call smart contract', async () => {
            const op = await manager.updateReverseRecord({
                address: 'tz1xxx',
                name: 'necroskillz.tez',
                owner: 'tz1yyy',
                data: new RecordMetadata({ ttl: '31' }),
            });

            verify(
                tezosClientMock.call(
                    `${SmartContractType.NameRegistry}addrupdate_reverse_record`,
                    'update_reverse_record',
                    deepEqual(['tz1xxx', e('necroskillz.tez'), 'tz1yyy', anyOfClass(MichelsonMap)])
                )
            ).called();
            expect(capture(tezosClientMock.call).last()[2][3].get('ttl')).toBe('31');

            expect(op).toBe(instance(operation));
        });
    });

    describe('getCommitment()', () => {
        it('should get existing commitment from storage and return info', async () => {
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx' };

            when(commitmentGeneratorMock.generate(deepEqual(params))).thenResolve('commitment');

            const commitment = await manager.getCommitment('tez', params);

            expect(commitment!.created.toISOString()).toBe('2020-10-01T10:00:00.000Z');
            expect(commitment!.usableFrom.toISOString()).toBe('2020-10-01T10:01:00.000Z');
            expect(commitment!.usableUntil.toISOString()).toBe('2020-10-01T11:00:00.000Z');
        });

        it('should return null if no commitment is found', async () => {
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx' };

            when(commitmentGeneratorMock.generate(deepEqual(params))).thenResolve('commitment1');

            const commitment = await manager.getCommitment('tez', params);

            expect(commitment).toBeNull();
        });
    });

    describe('getPrice()', () => {
        it('should get price based on existing record', async () => {
            const price = await manager.getPrice('necroskillz.tez', 365);

            expect(price).toBe(7300);
        });

        it('should get default price if record is has not been registered', async () => {
            const price = await manager.getPrice('alice.tez', 365);

            expect(price).toBe(1095);
        });

        it('should get default price if record is expired', async () => {
            const price = await manager.getPrice('expired.tez', 365);

            expect(price).toBe(1095);
        });
    });
});
