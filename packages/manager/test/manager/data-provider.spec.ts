import { ConstantsResponse } from '@taquito/rpc';
import { MichelsonMap, TransactionWalletOperation } from '@taquito/taquito';
import {
    AddressBook,
    BytesEncoder,
    DomainNameValidationResult,
    DomainNameValidator,
    Exact,
    RpcRequestScalarData,
    RpcResponseData,
    SmartContractType,
    TezosDomainsDataProvider,
    Tracer
} from '@tezos-domains/core';
import { CommitmentGenerator, CommitmentRequest, DomainAcquisitionState, TaquitoManagerDataProvider } from '@tezos-domains/manager';
import { TaquitoClient } from '@tezos-domains/taquito';
import BigNumber from 'bignumber.js';
import MockDate from 'mockdate';
import { anyFunction, anyString, anything, deepEqual, instance, mock, when } from 'ts-mockito';
import { TLDConfigProperty } from '../../../core/src/model';
import { AuctionState, TLDRecord } from '../../src/manager/model';

interface FakeTLDRegistrarStorage {
    store: {
        records: Record<string, Exact<TLDRecord>>;
        commitments: Record<string, string>;
        config: MichelsonMap<string, any>;
        auctions: Record<string, AuctionState>;
        bidder_balances: Record<string, BigNumber>;
    };
}

interface FakeOracleRegistrarStorage {
    set_child_record: string;
    admin: string;
    max_timestamp_age: number;
    claim_price: BigNumber;
    treasury: string;
}

const e = (s: string) => new BytesEncoder().encode(s)!;

describe('TaquitoManagerDataProvider', () => {
    let dataProvider: TaquitoManagerDataProvider;
    let taquitoClientMock: TaquitoClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;
    let commitmentGeneratorMock: CommitmentGenerator;
    let validatorMock: DomainNameValidator;
    let tezosDomainsDataProviderMock: TezosDomainsDataProvider;
    let operation: TransactionWalletOperation;
    let config: MichelsonMap<string, any>;

    const now = new Date(2020, 8, 11, 20, 0, 0);

    let storage: FakeTLDRegistrarStorage;
    let constants: ConstantsResponse;

    beforeEach(() => {
        taquitoClientMock = mock(TaquitoClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock<Tracer>();
        commitmentGeneratorMock = mock(CommitmentGenerator);
        validatorMock = mock<DomainNameValidator>();
        tezosDomainsDataProviderMock = mock<TezosDomainsDataProvider>();
        operation = mock(TransactionWalletOperation);

        config = new MichelsonMap<string, any>();
        config.set(TLDConfigProperty.MIN_BID_PER_DAY, new BigNumber(1e12));
        config.set(TLDConfigProperty.MIN_COMMITMENT_AGE, new BigNumber(60));
        config.set(TLDConfigProperty.MAX_COMMITMENT_AGE, new BigNumber(60 * 60));
        config.set(TLDConfigProperty.MIN_DURATION, new BigNumber(5));
        config.set(TLDConfigProperty.MIN_BID_INCREASE_RATIO, new BigNumber(20));
        config.set(TLDConfigProperty.MIN_AUCTION_PERIOD, new BigNumber(30 * 24 * 60 * 60));
        config.set(TLDConfigProperty.BID_ADDITIONAL_PERIOD, new BigNumber(24 * 60 * 60));
        config.set(TLDConfigProperty.DEFAULT_LAUNCH_DATE, new BigNumber(1593561600));
        config.set('1001', new BigNumber(1596240000));
        config.set('1002', new BigNumber(1593043200));
        config.set('1003', new BigNumber(0));
        config.set('2004', new BigNumber(2e12));

        constants = { time_between_blocks: [new BigNumber('30')], minimal_block_delay: new BigNumber('15') } as any;

        storage = {
            store: {
                records: {},
                commitments: {},
                auctions: {},
                bidder_balances: {},
                config,
            },
        };

        storage.store.commitments['commitment'] = '2020-10-01T10:00:00.000Z';

        storage.store.records[e('necroskillz')] = { expiry: new Date(2021, 0, 1) };
        storage.store.records[e('expired')] = { expiry: new Date(2019, 1, 1) };

        storage.store.records[e('settlement-expired')] = { expiry: new Date(2022, 1, 1) };
        storage.store.auctions[e('settlement-expired')] = {
            ends_at: new Date(2020, 1, 1, 0, 0, 0),
            last_bid: new BigNumber(1e7) as any,
            last_bidder: 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix',
            ownership_period: new BigNumber(365) as any,
        };

        storage.store.auctions[e('auction')] = {
            ends_at: new Date(2020, 7, 3, 0, 0, 0),
            last_bid: new BigNumber(1e7) as any,
            last_bidder: 'tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix',
            ownership_period: new BigNumber(20) as any,
        };

        storage.store.bidder_balances['tz1Q4vimV3wsfp21o7Annt64X7Hs6MXg9Wix'] = new BigNumber(2e6);

        when(tracerMock.trace(anything(), anything(), anything()));

        const validationFunction = (name: string) => {
            if (name === 'invalid.tez') {
                return DomainNameValidationResult.INVALID_NAME;
            }

            return DomainNameValidationResult.VALID;
        };
        when(validatorMock.isValidWithKnownTld(anyString())).thenCall(validationFunction);
        when(validatorMock.validateDomainName(anyString())).thenCall(validationFunction);
        when(validatorMock.supportedTLDs).thenReturn(['tez']);

        when(addressBookMock.lookup(anything())).thenCall(type => Promise.resolve(`${type}addr`));
        when(addressBookMock.lookup(anything(), anything())).thenCall((type, p1) => Promise.resolve(`${type}addr${p1 || ''}`));
        when(addressBookMock.lookup(anything(), anything(), anything())).thenCall((type, p1, p2) => Promise.resolve(`${type}addr${p1 || ''}${p2 || ''}`));

        when(
            taquitoClientMock.getBigMapValue(`${SmartContractType.TLDRegistrar}addrtez`, anyFunction(), anything())
        ).thenCall((_, selector, key: RpcRequestScalarData<string>) => Promise.resolve(new RpcResponseData(selector(storage)[key.encode()!])));
        when(taquitoClientMock.storage(`${SmartContractType.TLDRegistrar}addrtez`)).thenResolve(storage);
        when(taquitoClientMock.storage(`${SmartContractType.OracleRegistrar}addr`)).thenResolve(<FakeOracleRegistrarStorage>{
            claim_price: new BigNumber(1_500_000),
        });
        when(taquitoClientMock.getConstants()).thenResolve(constants);

        when(operation.opHash).thenReturn('op_hash');

        when(tezosDomainsDataProviderMock.getDomainRecord('alice.tez')).thenResolve({ tzip12_token_id: 1 } as any);

        MockDate.set(now);

        dataProvider = new TaquitoManagerDataProvider(
            instance(taquitoClientMock),
            instance(addressBookMock),
            instance(tracerMock),
            instance(commitmentGeneratorMock),
            instance(validatorMock),
            instance(tezosDomainsDataProviderMock)
        );
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('getCommitment()', () => {
        it('should get existing commitment from storage and return info', async () => {
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 };

            when(commitmentGeneratorMock.generate(deepEqual(params))).thenReturn('commitment');

            const commitment = await dataProvider.getCommitment('tez', params);

            expect(commitment!.created.toISOString()).toBe('2020-10-01T10:00:00.000Z');
            expect(commitment!.usableFrom.toISOString()).toBe('2020-10-01T10:00:45.000Z');
            expect(commitment!.usableUntil.toISOString()).toBe('2020-10-01T11:00:00.000Z');
        });

        it('should return null if no commitment is found', async () => {
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 };

            when(commitmentGeneratorMock.generate(deepEqual(params))).thenReturn('commitment1');

            const commitment = await dataProvider.getCommitment('tez', params);

            expect(commitment).toBeNull();
        });

        it('should not set usableFrom before created', async () => {
            constants.minimal_block_delay = new BigNumber('90');
            const params: Exact<CommitmentRequest> = { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 };

            when(commitmentGeneratorMock.generate(deepEqual(params))).thenReturn('commitment');

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

        it('should get info about a new expensive domain that can be bought (4 letter)', async () => {
            const info = await dataProvider.getAcquisitionInfo('alic.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeBought);
            expect(info.buyOrRenewDetails.minDuration).toBe(5);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(10e6);
            expect(info.calculatePrice(365)).toBe(730e6);
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
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(5e6);
            expect(info.calculatePrice(365)).toBe(365e6);
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
        });

        it('should return unobtainable if tld is not launched yet', async () => {
            MockDate.set(new Date(2020, 5, 30, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('alice.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.Unobtainable);
            expect(info.unobtainableDetails.launchDate!.toISOString()).toBe(
                new Date(new Date(2020, 6, 1, 0, 0, 0).getTime() - new Date(2020, 6, 1).getTimezoneOffset() * 60000).toISOString()
            );
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.buyOrRenewDetails).toThrowError();
            expect(() => info.calculatePrice(365)).toThrowError();
        });

        it('should return info about domain even if tld is not launched yet', async () => {
            config.set(TLDConfigProperty.DEFAULT_LAUNCH_DATE, 0);

            const info = await dataProvider.getAcquisitionInfo('necroskillz.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.Taken);
            expect(info.buyOrRenewDetails.minDuration).toBe(5);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(5e6);
            expect(info.calculatePrice(365)).toBe(365e6);
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
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

        it('should return info about auction if within auction period after domain expiration', async () => {
            MockDate.set(new Date(2021, 0, 5, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('necroskillz.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeAuctioned);
            expect(info.auctionDetails.auctionEnd.toISOString()).toBe(new Date(new Date(2021, 0, 31, 0, 0, 0).getTime()).toISOString());
            expect(info.auctionDetails.lastBid).toBe(0);
            expect(info.auctionDetails.lastBidder).toBeNull();
            expect(info.auctionDetails.nextMinimumBid).toBe(5e6);
            expect(info.auctionDetails.registrationDuration).toBe(5);
            expect(info.auctionDetails.bidAdditionalPeriod).toBe(24 * 60 * 60 * 1000);
            expect(() => info.buyOrRenewDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
            expect(() => info.calculatePrice(365)).toThrowError();
        });

        it('should get info about an expired domain that can be bought after domain expiration and once auction period has passed', async () => {
            MockDate.set(new Date(2021, 1, 5, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('necroskillz.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeBought);
            expect(info.buyOrRenewDetails.minDuration).toBe(5);
            expect(info.buyOrRenewDetails.pricePerMinDuration).toBe(5e6);
            expect(info.calculatePrice(365)).toBe(365e6);
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.unobtainableDetails).toThrowError();
        });

        it('should get info about an auction if domain expired after an unsettled auction', async () => {
            MockDate.set(new Date(2022, 1, 6, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('settlement-expired.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeAuctioned);

            expect(info.auctionDetails.auctionEnd.toISOString()).toBe(new Date(new Date(2022, 2, 3, 0, 0, 0).getTime()).toISOString());
            expect(info.auctionDetails.lastBid).toBe(0);
            expect(info.auctionDetails.lastBidder).toBeNull();
            expect(info.auctionDetails.nextMinimumBid).toBe(5e6);
            expect(info.auctionDetails.registrationDuration).toBe(5);
            expect(info.auctionDetails.bidAdditionalPeriod).toBe(24 * 60 * 60 * 1000);

            expect(() => info.unobtainableDetails).toThrowError();
            expect(() => info.buyOrRenewDetails).toThrowError();
            expect(() => info.calculatePrice(365)).toThrowError();
        });

        it('should return unobtainable if launch date for particular label length is not launched yet', async () => {
            MockDate.set(new Date(2020, 6, 2, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('a.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.Unobtainable);
            expect(info.unobtainableDetails.launchDate!.toISOString()).toBe(
                new Date(new Date(2020, 7, 1, 0, 0, 0).getTime() - new Date(2020, 7, 1).getTimezoneOffset() * 60000).toISOString()
            );
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.buyOrRenewDetails).toThrowError();
            expect(() => info.calculatePrice(365)).toThrowError();
        });

        it('should return info about auction if within auction period for particular label length, even if default hasnt started', async () => {
            MockDate.set(new Date(2020, 5, 26, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('aa.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.CanBeAuctioned);
        });

        it('should return unobtainable if launch date is 0', async () => {
            MockDate.set(new Date(2020, 6, 2, 0, 0, 0));

            const info = await dataProvider.getAcquisitionInfo('aaa.tez');

            expect(info.acquisitionState).toBe(DomainAcquisitionState.Unobtainable);
            expect(info.unobtainableDetails.launchDate).toBeNull();
            expect(() => info.auctionDetails).toThrowError();
            expect(() => info.buyOrRenewDetails).toThrowError();
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

        it('should return claimable state', async () => {
            when(validatorMock.isClaimableTld('com')).thenReturn(true);
            const state = await dataProvider.getAcquisitionInfo('claimable.com');
            expect(state.acquisitionState).toBe(DomainAcquisitionState.CanBeClaimed);
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() => dataProvider.getAcquisitionInfo('invalid.tez')).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });

        it('should throw if domain name not 2nd level', async () => {
            await expect(() => dataProvider.getAcquisitionInfo('bob.alice.tez')).rejects.toThrowError(
                "Domain 'bob.alice.tez' cannot be acquired. Only 2nd level domains (e.g. 'alice.tez') can be acquired."
            );
        });

        const NEXT_BID_TEST_DATA = [
            { lastBid: 1e6, nextBid: 1.2e6 },
            { lastBid: 1.3e6, nextBid: 1.6e6 },
        ];

        NEXT_BID_TEST_DATA.forEach(d => {
            it(`should calculate next bid for ${d.lastBid}`, async () => {
                MockDate.set(new Date(2020, 6, 2, 0, 0, 0));
                storage.store.auctions[e('auction')].last_bid = new BigNumber(d.lastBid) as any;

                const info = await dataProvider.getAcquisitionInfo('auction.tez');

                expect(info.auctionDetails.nextMinimumBid).toBe(d.nextBid);
            });
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
            await expect(() => dataProvider.getBidderBalance('ble', 'tz1VBLpuDKMoJuHRLZ4HrCgRuiLpEr7zZx2E')).rejects.toThrowError(
                "TLD 'ble' is not supported."
            );
        });
    });

    describe('getTokenId()', () => {
        it('should return tokenId for a domain', async () => {
            const tokenId = await dataProvider.getTokenId('alice.tez');

            expect(tokenId).toBe(1);
        });

        it('should return null for non existent domain', async () => {
            const tokenId = await dataProvider.getTokenId('bob.tez');

            expect(tokenId).toBeNull();
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() => dataProvider.getTokenId('invalid.tez')).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });

        it('should throw if domain name not 2nd level', async () => {
            await expect(() => dataProvider.getTokenId('bob.alice.tez')).rejects.toThrowError(
                "Domain 'bob.alice.tez' does not have a tokenId. Only 2nd level domains (e.g. 'alice.tez') are NFTs."
            );
        });
    });

    describe('getDomainRecord()', () => {
        it('should return tokenId for a domain', async () => {
            const domain = await dataProvider.getDomainRecord('alice.tez');

            expect(domain).toEqual({ tzip12_token_id: 1 });
        });

        it('should return null for non existent domain', async () => {
            const tokenId = await dataProvider.getDomainRecord('bob.tez');

            expect(tokenId).toBeNull();
        });

        it('should throw if domain name is invalid', async () => {
            await expect(() => dataProvider.getTokenId('invalid.tez')).rejects.toThrowError("'invalid.tez' is not a valid domain name.");
        });
    });
});
