import { TransactionWalletOperation, MichelsonMap } from '@taquito/taquito';
import {
    SmartContractType,
    Exact,
    RpcRequestScalarData,
    RpcResponseData,
    Tracer,
    AddressBook,
    BytesEncoder,
    DomainNameValidator,
    DomainNameValidationResult,
} from '@tezos-domains/core';
import { TaquitoClient } from '@tezos-domains/taquito';
import { ConstantsResponse } from '@taquito/rpc';
import { CommitmentGenerator, DomainAcquisitionState, CommitmentRequest, TaquitoManagerDataProvider } from '@tezos-domains/manager';
import { mock, when, anyFunction, anything, instance, deepEqual, anyString } from 'ts-mockito';
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

describe('TaquitoManagerDataProvider', () => {
    let dataProvider: TaquitoManagerDataProvider;
    let taquitoClientMock: TaquitoClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;
    let commitmentGeneratorMock: CommitmentGenerator;
    let validatorMock: DomainNameValidator;
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
    config.set('bid_additional_period', new BigNumber(24 * 60 * 60));

    let storage: FakeTLDRegistrarStorage;
    let constants: ConstantsResponse;

    beforeEach(() => {
        taquitoClientMock = mock(TaquitoClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock<Tracer>();
        commitmentGeneratorMock = mock(CommitmentGenerator);
        validatorMock = mock<DomainNameValidator>();
        operation = mock(TransactionWalletOperation);

        constants = { time_between_blocks: [new BigNumber('30')] } as any;

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

        when(validatorMock.validateDomainName(anyString())).thenCall(name => {
            if (name === 'invalid.tez') {
                return DomainNameValidationResult.INVALID_NAME;
            }

            return DomainNameValidationResult.VALID;
        });
        when(validatorMock.supportedTLDs).thenReturn(['tez']);

        when(addressBookMock.lookup(anything(), anything())).thenCall((type, p1) => Promise.resolve(`${type}addr${p1 || ''}`));
        when(addressBookMock.lookup(anything(), anything(), anything())).thenCall((type, p1, p2) => Promise.resolve(`${type}addr${p1 || ''}${p2 || ''}`));

        when(
            taquitoClientMock.getBigMapValue(`${SmartContractType.TLDRegistrar}addrtez`, anyFunction(), anything())
        ).thenCall((_, selector, key: RpcRequestScalarData<string>) => Promise.resolve(new RpcResponseData(selector(storage)[key.encode()!])));
        when(taquitoClientMock.storage(`${SmartContractType.TLDRegistrar}addrtez`)).thenResolve(storage);
        when(taquitoClientMock.getConstants()).thenResolve(constants);

        when(operation.opHash).thenReturn('op_hash');

        MockDate.set(now);

        dataProvider = new TaquitoManagerDataProvider(
            instance(taquitoClientMock),
            instance(addressBookMock),
            instance(tracerMock),
            instance(commitmentGeneratorMock),
            instance(validatorMock)
        );
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('getCommitment()', () => {
        it('should get existing commitment from storage and return info', async () => {
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 };

            when(commitmentGeneratorMock.generate(deepEqual(params))).thenResolve('commitment');

            const commitment = await dataProvider.getCommitment('tez', params);

            expect(commitment!.created.toISOString()).toBe('2020-10-01T10:00:00.000Z');
            expect(commitment!.usableFrom.toISOString()).toBe('2020-10-01T10:00:30.000Z');
            expect(commitment!.usableUntil.toISOString()).toBe('2020-10-01T11:00:00.000Z');
        });

        it('should return null if no commitment is found', async () => {
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 };

            when(commitmentGeneratorMock.generate(deepEqual(params))).thenResolve('commitment1');

            const commitment = await dataProvider.getCommitment('tez', params);

            expect(commitment).toBeNull();
        });

        it('should not set usableFrom before created', async () => {
            constants.time_between_blocks = [new BigNumber('90')];
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 };

            when(commitmentGeneratorMock.generate(deepEqual(params))).thenResolve('commitment');

            const commitment = await dataProvider.getCommitment('tez', params);

            expect(commitment!.created.toISOString()).toBe('2020-10-01T10:00:00.000Z');
            expect(commitment!.usableFrom.toISOString()).toBe('2020-10-01T10:00:00.000Z');
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() => dataProvider.getCommitment('tez', { label: 'invalid', owner: 'tz1xxx', nonce: 1 })).rejects.toThrowError(
                "'invalid.tez' is not a valid domain name."
            );
        });
    });

    describe('getAcquisitionInfo()', () => {
        it('should get info about a new domain that can be bought', async () => {
            const info = await dataProvider.getAcquisitionInfo('alice.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeBought);
            expect(info.buyOrRenewDetails.minDuration).toBe(5);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(5e6);
            expect(info.calculatePrice(365)).toBe(365e6);
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
        });

        it('should get info about an expired domain that can be bought', async () => {
            const info = await dataProvider.getAcquisitionInfo('expired.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeBought);
            expect(info.buyOrRenewDetails.minDuration).toBe(5);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(5e6);
            expect(info.calculatePrice(365)).toBe(365e6);
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
        });

        it('should get info about a domain that is already owned', async () => {
            const info = await dataProvider.getAcquisitionInfo('necroskillz.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.Taken);
            expect(info.buyOrRenewDetails.minDuration).toBe(5);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(1e8);
            expect(info.calculatePrice(365)).toBe(73e8);
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
        });

        it('should return unobtainable if tld is disabled', async () => {
            storage.store.enabled = false;

            const info = await dataProvider.getAcquisitionInfo('alice.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.Unobtainable);
            expect(info.unobtainableDetails.enabled).toBe(false);
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.buyOrRenewDetails).toThrowError();
            expect(() => info.calculatePrice(365)).toThrowError();
        });

        it('should return unobtainable if tld is not launched yet', async () => {
            MockDate.set(new Date(2020, 5, 30, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('alice.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.Unobtainable);
            expect(info.unobtainableDetails.enabled).toBe(true);
            expect(info.unobtainableDetails.launchDate.toISOString()).toBe(
                new Date(new Date(2020, 6, 1, 0, 0, 0).getTime() - new Date(2020, 6, 31).getTimezoneOffset() * 60000).toISOString()
            );
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.buyOrRenewDetails).toThrowError();
            expect(() => info.calculatePrice(365)).toThrowError();
        });

        it('should return info about auction if within auction period', async () => {
            MockDate.set(new Date(2020, 6, 2, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('alice.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeAuctioned);
            expect(info.auctionDetails.auctionEnd.toISOString()).toBe(
                new Date(new Date(2020, 6, 31, 0, 0, 0).getTime() - new Date(2020, 6, 31).getTimezoneOffset() * 60000).toISOString()
            );
            expect(info.auctionDetails.lastBid).toBe(0);
            expect(info.auctionDetails.lastBidder).toBeNull();
            expect(info.auctionDetails.nextMinimumBid).toBe(5e6);
            expect(info.auctionDetails.registrationDuration).toBe(5);
            expect(info.auctionDetails.bidAdditionalPeriod).toBe(24 * 60 * 60 * 1000);
            expect(() => info.buyOrRenewDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
            expect(() => info.calculatePrice(365)).toThrowError();
        });

        it('should return info about auction in progress', async () => {
            MockDate.set(new Date(2020, 6, 2, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('auction.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.AuctionInProgress);
            expect(info.auctionDetails.auctionEnd.toISOString()).toBe(new Date(2020, 7, 3, 0, 0, 0).toISOString());
            expect(info.auctionDetails.lastBid).toBe(1e7);
            expect(info.auctionDetails.lastBidder).toBe('tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');
            expect(info.auctionDetails.nextMinimumBid).toBe(1.2e7);
            expect(info.auctionDetails.registrationDuration).toBe(5);
            expect(info.auctionDetails.bidAdditionalPeriod).toBe(24 * 60 * 60 * 1000);
            expect(() => info.buyOrRenewDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
            expect(() => info.calculatePrice(365)).toThrowError();
        });

        it('should return info about auction with expired settlement that can be auctioned again', async () => {
            MockDate.set(new Date(2020, 8, 4, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('auction.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeAuctioned);
            expect(info.auctionDetails.auctionEnd.toISOString()).toBe(new Date(2020, 8, 22).toISOString());
            expect(info.auctionDetails.lastBid).toBe(0);
            expect(info.auctionDetails.lastBidder).toBeNull();
            expect(info.auctionDetails.nextMinimumBid).toBe(5e6);
            expect(info.auctionDetails.registrationDuration).toBe(5);
            expect(info.auctionDetails.bidAdditionalPeriod).toBe(24 * 60 * 60 * 1000);
            expect(() => info.buyOrRenewDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
            expect(() => info.calculatePrice(365)).toThrowError();
        });

        it('should return info about auction with expired settlement and expired next auction that can be bought', async () => {
            MockDate.set(new Date(2020, 8, 22, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('auction.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeBought);
            expect(info.buyOrRenewDetails.minDuration).toBe(5);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(5e6);
            expect(info.calculatePrice(365)).toBe(365e6);
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
        });

        it('should return info about auction that can be settled', async () => {
            MockDate.set(new Date(2020, 7, 4, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('auction.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeSettled);
            expect(info.auctionDetails.auctionEnd.toISOString()).toBe(new Date(2020, 7, 3, 0, 0, 0).toISOString());
            expect(info.auctionDetails.lastBid).toBe(1e7);
            expect(info.auctionDetails.lastBidder).toBe('tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');
            expect(info.auctionDetails.nextMinimumBid).toBe(NaN);
            expect(info.auctionDetails.registrationDuration).toBe(5);
            expect(info.auctionDetails.bidAdditionalPeriod).toBe(24 * 60 * 60 * 1000);
            expect(() => info.buyOrRenewDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
            expect(() => info.calculatePrice(365)).toThrowError();
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() => dataProvider.getAcquisitionInfo('invalid.tez')).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });

        it('should throw if domain name not 2nd level', async () => {
            await expect(() => dataProvider.getAcquisitionInfo('bob.alice.tez')).rejects.toThrowError(
                "'bob.alice.tez' cannot be acquired. Only 2nd level domains (e.g. 'alice.tez') can be acquired."
            );
        });
    });

    describe('getBidderBalance()', () => {
        it('should get balance for existing bidder', async () => {
            const balance = await dataProvider.getBidderBalance('tez', 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix');

            expect(balance).toBe(2e6);
        });

        it('should return 0 for unknown bidder', async () => {
            const balance = await dataProvider.getBidderBalance('tez', 'tz1VBLpuDKMoJuHRLZ4HrCgRuiLpEr7zZx2E');

            expect(balance).toBe(0);
        });

        it('should throw if tld is not supported', async () => {
            await expect(() => dataProvider.getBidderBalance('ble', 'tz1VBLpuDKMoJuHRLZ4HrCgRuiLpEr7zZx2E')).rejects.toThrowError("TLD 'ble' is not supported.");
        });
    });
});