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
import { DomainsManager, CommitmentGenerator, BlockchainDomainsManager, DomainAcquisitionState, CommitmentRequest } from '@tezos-domains/manager';
import { mock, when, anyFunction, anything, instance, anyString, verify, anyOfClass, deepEqual, anyNumber, capture } from 'ts-mockito';
import MockDate from 'mockdate';
import BigNumber from 'bignumber.js';

import { TLDRecord, AuctionState } from '../../src/manager/model';

interface FakeTLDRegistrarStorage {
    store: {
        records: Record<string, Exact<TLDRecord>>;
        commitments: Record<string, string>;
        config: MichelsonMap<string, any>;
        auctions: Record<string, AuctionState>;
        bidder_balances: Record<string, BigNumber>;
        enabled: boolean;
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

    const now = new Date(2020, 8, 11, 20, 0, 0);
    const config = new MichelsonMap<string, any>();
    config.set('min_bid_per_day', new BigNumber(1e12));
    config.set('min_commitment_age', new BigNumber(60));
    config.set('max_commitment_age', new BigNumber(60 * 60));
    config.set('min_duration', new BigNumber(5));
    config.set('launch_date', new BigNumber(1593561600));
    config.set('min_bid_increase_ratio', new BigNumber(20));
    config.set('min_auction_period', new BigNumber(30 * 24 * 60 * 60));

    let storage: FakeTLDRegistrarStorage;

    beforeEach(() => {
        tezosClientMock = mock(TezosClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock<Tracer>();
        commitmentGeneratorMock = mock(CommitmentGenerator);
        operation = mock(TransactionWalletOperation);

        storage = {
            store: {
                records: {},
                commitments: {},
                auctions: {},
                bidder_balances: {},
                config,
                enabled: true,
            },
        };

        storage.store.commitments['commitment'] = '2020-10-01T10:00:00.000Z';

        storage.store.records[e('necroskillz')] = { price_per_day: new BigNumber(20 * 1e12), expiry: new Date(2021, 1, 1) };
        storage.store.records[e('expired')] = { price_per_day: new BigNumber(50 * 1e12), expiry: new Date(2019, 1, 1) };

        storage.store.auctions[e('auction')] = {
            ends_at: new Date(2020, 7, 3, 0, 0, 0),
            last_bid: new BigNumber(1e7) as any,
            last_bidder: 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix',
            ownership_period: new BigNumber(20) as any,
        };

        storage.store.bidder_balances['tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix'] = new BigNumber(2e6);

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

        MockDate.set(now);

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
                expiry: new Date(new Date(2021, 10, 11, 8).getTime() - new Date(2021, 10, 11).getTimezoneOffset() * 60000),
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
                label: 'alice',
                owner: 'tz1xxx',
                address: 'tz1yyy',
                data: new RecordMetadata({ ttl: '31' }),
            });

            verify(
                tezosClientMock.call(
                    `${SmartContractType.TLDRegistrar}addrtezbuy`,
                    'buy',
                    deepEqual([e('alice'), 365, 'tz1xxx', 'tz1yyy', anyOfClass(MichelsonMap)]),
                    1e6 * 365
                )
            ).called();

            expect(capture(tezosClientMock.call).last()[2][4].get('ttl')).toBe('31');

            expect(op).toBe(instance(operation));
        });
    });

    describe('renew()', () => {
        it('should call smart contract with price', async () => {
            const op = await manager.renew('tez', {
                duration: 365,
                label: 'necroskillz2',
            });

            verify(tezosClientMock.call(`${SmartContractType.TLDRegistrar}addrtezrenew`, 'renew', deepEqual([e('necroskillz2'), 365]), 365 * 1e6)).called();

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

    describe('getAcquisitionInfo()', () => {
        it('should get info about a new domain that can be bought', async () => {
            const info = await manager.getAcquisitionInfo('alice.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeBought);
            expect(info.buyOrRenewDetails.minDuration).toBe(5);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(5e6);
            expect(() => info.auctionDetails).toThrowError();
        });

        it('should get info about an expired domain that can be bought', async () => {
            const info = await manager.getAcquisitionInfo('expired.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeBought);
            expect(info.buyOrRenewDetails.minDuration).toBe(5);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(5e6);
            expect(() => info.auctionDetails).toThrowError();
        });

        it('should get info about a domain that is already owned', async () => {
            const info = await manager.getAcquisitionInfo('necroskillz.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.Taken);
            expect(info.buyOrRenewDetails.minDuration).toBe(5);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(1e8);
            expect(() => info.auctionDetails).toThrowError();
        });

        it('should return unobtainable if tld is disabled', async () => {
            storage.store.enabled = false;

            const info = await manager.getAcquisitionInfo('alice.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.Unobtainable);
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.buyOrRenewDetails).toThrowError();
        });

        it('should return unobtainable if tld is not launched yet', async () => {
            MockDate.set(new Date(2020, 5, 30, 0, 0, 0));

            const info = await manager.getAcquisitionInfo('alice.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.Unobtainable);
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.buyOrRenewDetails).toThrowError();
        });

        it('should return info about auction if within auction period', async () => {
            MockDate.set(new Date(2020, 6, 2, 0, 0, 0));

            const info = await manager.getAcquisitionInfo('alice.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeAuctioned);
            expect(info.auctionDetails.auctionEnd.toISOString()).toBe(
                new Date(new Date(2020, 6, 31, 0, 0, 0).getTime() - new Date(2020, 6, 31).getTimezoneOffset() * 60000).toISOString()
            );
            expect(info.auctionDetails.lastBid).toBe(0);
            expect(info.auctionDetails.lastBidder).toBeNull();
            expect(info.auctionDetails.nextMinimumBid).toBe(5e6);
            expect(info.auctionDetails.registrationDuration).toBe(5);
            expect(() => info.buyOrRenewDetails).toThrowError();
        });

        it('should return info about auction in progress', async () => {
            MockDate.set(new Date(2020, 6, 2, 0, 0, 0));

            const info = await manager.getAcquisitionInfo('auction.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.AuctionInProgress);
            expect(info.auctionDetails.auctionEnd.toISOString()).toBe(new Date(2020, 7, 3, 0, 0, 0).toISOString());
            expect(info.auctionDetails.lastBid).toBe(1e7);
            expect(info.auctionDetails.lastBidder).toBe('tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');
            expect(info.auctionDetails.nextMinimumBid).toBe(1.2e7);
            expect(info.auctionDetails.registrationDuration).toBe(5);
            expect(() => info.buyOrRenewDetails).toThrowError();
        });

        it('should return info about auction with expired settlement that can be auctioned again', async () => {
            MockDate.set(new Date(2020, 8, 4, 0, 0, 0));

            const info = await manager.getAcquisitionInfo('auction.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeAuctioned);
            expect(info.auctionDetails.auctionEnd.toISOString()).toBe(new Date(2020, 8, 22).toISOString());
            expect(info.auctionDetails.lastBid).toBe(0);
            expect(info.auctionDetails.lastBidder).toBeNull();
            expect(info.auctionDetails.nextMinimumBid).toBe(5e6);
            expect(info.auctionDetails.registrationDuration).toBe(5);
            expect(() => info.buyOrRenewDetails).toThrowError();
        });

        it('should return info about auction with expired settlement and expired next auction that can be bought', async () => {
            MockDate.set(new Date(2020, 8, 22, 0, 0, 0));

            const info = await manager.getAcquisitionInfo('auction.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeBought);
            expect(info.buyOrRenewDetails.minDuration).toBe(5);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(5e6);
            expect(() => info.auctionDetails).toThrowError();
        });

        it('should return info about auction that can be settled', async () => {
            MockDate.set(new Date(2020, 7, 4, 0, 0, 0));

            const info = await manager.getAcquisitionInfo('auction.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeSettled);
            expect(info.auctionDetails.auctionEnd.toISOString()).toBe(new Date(2020, 7, 3, 0, 0, 0).toISOString());
            expect(info.auctionDetails.lastBid).toBe(1e7);
            expect(info.auctionDetails.lastBidder).toBe('tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');
            expect(info.auctionDetails.nextMinimumBid).toBe(NaN);
            expect(info.auctionDetails.registrationDuration).toBe(5);
            expect(() => info.buyOrRenewDetails).toThrowError();
        });
    });

    describe('getBidderBalance()', () => {
        it('should get balance for existing bidder', async () => {
            const balance = await manager.getBidderBalance('tez', 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');

            expect(balance).toBe(2e6);
        });

        it('should return 0 for unknown bidder', async () => {
            const balance = await manager.getBidderBalance('tez', 'tz1VBLpuDKMoJuHRLZ4HrCgRuiLpEr7zZx2E');

            expect(balance).toBe(0);
        });
    });

    describe('bid()', () => {
        it('should call smart contract with bid amount', async () => {
            const op = await manager.bid('tez', {
                label: 'necroskillz',
                bid: 5e6,
            });

            verify(tezosClientMock.call(`${SmartContractType.TLDRegistrar}addrtezbid`, 'bid', deepEqual([e('necroskillz'), 5e6]), 5e6)).called();

            expect(op).toBe(instance(operation));
        });

        it('should call smart contract bid with subtracted bidder balance', async () => {
            when(tezosClientMock.getPkh()).thenResolve('tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');

            const op = await manager.bid('tez', {
                label: 'necroskillz',
                bid: 5e6,
            });

            verify(tezosClientMock.call(`${SmartContractType.TLDRegistrar}addrtezbid`, 'bid', deepEqual([e('necroskillz'), 5e6]), 3e6)).called();

            expect(op).toBe(instance(operation));
        });

        it('should call smart contract with 0 amount if bidder balance is more than the bid', async () => {
            when(tezosClientMock.getPkh()).thenResolve('tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');

            const op = await manager.bid('tez', {
                label: 'necroskillz',
                bid: 1e6,
            });

            verify(tezosClientMock.call(`${SmartContractType.TLDRegistrar}addrtezbid`, 'bid', deepEqual([e('necroskillz'), 1e6]), 0)).called();

            expect(op).toBe(instance(operation));
        });
    });

    describe('settle()', () => {
        it('should call smart contract', async () => {
            const op = await manager.settle('tez', {
                label: 'necroskillz',
                owner: 'tz1xxx',
                address: 'tz1yyy',
                data: new RecordMetadata({ ttl: '31' }),
            });

            verify(
                tezosClientMock.call(
                    `${SmartContractType.TLDRegistrar}addrtezsettle`,
                    'settle',
                    deepEqual([e('necroskillz'), 'tz1xxx', 'tz1yyy', anyOfClass(MichelsonMap)])
                )
            ).called();

            expect(capture(tezosClientMock.call).last()[2][3].get('ttl')).toBe('31');

            expect(op).toBe(instance(operation));
        });
    });

    describe('withdraw()', () => {
        it('should call smart contract', async () => {
            const op = await manager.withdraw('tez', 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');

            verify(
                tezosClientMock.call(`${SmartContractType.TLDRegistrar}addrtezwithdraw`, 'withdraw', deepEqual(['tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix']))
            ).called();

            expect(op).toBe(instance(operation));
        });
    });
});
