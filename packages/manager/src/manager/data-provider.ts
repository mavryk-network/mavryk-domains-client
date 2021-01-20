import {
    Tracer,
    Exact,
    SmartContractType,
    RpcRequestData,
    DateEncoder,
    getTld,
    RpcResponseData,
    AddressBook,
    DomainNameValidationResult,
    DomainNameValidator,
    getLevel,
} from '@tezos-domains/core';
import { BytesEncoder, getLabel } from '@tezos-domains/core';
import { TaquitoClient, TLDRegistrarStorage, MapEncoder, BigNumberEncoder } from '@tezos-domains/taquito';
import BigNumber from 'bignumber.js';

import { CommitmentRequest, CommitmentInfo, TLDRecord, DomainAcquisitionState, AuctionState, DomainAcquisitionInfo } from './model';
import { CommitmentGenerator } from './commitment-generator';

export class TaquitoManagerDataProvider {
    constructor(
        private tezos: TaquitoClient,
        private addressBook: AddressBook,
        private tracer: Tracer,
        private commitmentGenerator: CommitmentGenerator,
        private validator: DomainNameValidator
    ) {}

    async getCommitment(tld: string, request: Exact<CommitmentRequest>): Promise<CommitmentInfo | null> {
        this.assertDomainName(`${request.label}.${tld}`);

        this.tracer.trace('=> Getting existing commitment.', tld, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld);
        const commitmentHash = await this.commitmentGenerator.generate(request);
        const constants = await this.tezos.getConstants();
        const timeBetweenBlocks = constants.time_between_blocks[0].toNumber() * 1000;

        this.tracer.trace('!! Calculated commitment hash for given parameters.', commitmentHash);

        const commitmentResponse = await this.tezos.getBigMapValue<TLDRegistrarStorage>(
            address,
            s => s.store.commitments,
            RpcRequestData.fromValue(commitmentHash)
        );
        const commitment = commitmentResponse.scalar(DateEncoder);

        if (!commitment) {
            this.tracer.trace('<= Commitment not found.');

            return null;
        }

        const tldStorage = await this.tezos.storage<TLDRegistrarStorage>(address);
        const config = new RpcResponseData(tldStorage.store.config).scalar(MapEncoder)!;
        const minAge = config.get('min_commitment_age', BigNumberEncoder)! * 1000;
        const maxAge = config.get('max_commitment_age', BigNumberEncoder)! * 1000;

        const usableFrom = new Date(commitment.getTime() + Math.max(0, minAge - timeBetweenBlocks));
        const usableUntil = new Date(commitment.getTime() + maxAge);

        this.tracer.trace(
            `<= Commitment found with timestamp ${commitment.toISOString()}. Based on TLDRegistrar it's usable from ${usableFrom.toISOString()} to ${usableUntil.toISOString()}.`
        );

        return new CommitmentInfo(commitment, usableFrom, usableUntil);
    }

    async getAcquisitionInfo(name: string): Promise<DomainAcquisitionInfo> {
        if (getLevel(name) !== 2) {
            throw new Error(`'${name}' cannot be acquired. Only 2nd level domains (e.g. 'alice.${this.validator.supportedTLDs[0]}') can be acquired.`);
        }
        this.assertDomainName(name);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, getTld(name));
        const tldStorage = await this.tezos.storage<TLDRegistrarStorage>(address);
        const now = new Date();
        const config = new RpcResponseData(tldStorage.store.config).scalar(MapEncoder)!;
        const launchDate = new Date(config.get<BigNumber>('launch_date')!.toNumber() * 1000);

        if (!tldStorage.store.enabled) {
            return createUnobtainableInfo();
        }

        const label = getLabel(name);
        const tldRecordResponse = await this.tezos.getBigMapValue<TLDRegistrarStorage>(
            address,
            s => s.store.records,
            RpcRequestData.fromValue(label, BytesEncoder)
        );
        const tldRecord = tldRecordResponse.decode(TLDRecord);
        const minDuration = config.get<BigNumber>('min_duration')!.toNumber();
        const minBid = getPricePerMinDuration(config.get<BigNumber>('min_bid_per_day')!);

        if (tldRecord && tldRecord.expiry > now) {
            return createBuyOrRenewInfo(DomainAcquisitionState.Taken, getPricePerMinDuration(tldRecord.price_per_day));
        }

        const auctionStateResponse = await this.tezos.getBigMapValue<TLDRegistrarStorage>(
            address,
            s => s.store.auctions,
            RpcRequestData.fromValue(label, BytesEncoder)
        );
        const auctionState = auctionStateResponse.decode(AuctionState);
        const minAuctionPeriod = config.get<BigNumber>('min_auction_period')!.toNumber() * 1000;
        const minBidIncreaseCoef = config.get<BigNumber>('min_bid_increase_ratio')!.dividedBy(100).plus(1).toNumber();
        const bidAdditionalPeriod = config.get<BigNumber>('bid_additional_period')!.toNumber() * 1000;

        if (auctionState) {
            const maxSettlementDate = new Date(auctionState.ends_at.getTime() + auctionState.ownership_period * 24 * 60 * 60 * 1000);
            if (now >= maxSettlementDate) {
                const maxNewAuctionDate = new Date(maxSettlementDate.getTime() + minAuctionPeriod);
                if (now < maxNewAuctionDate) {
                    return createAuctionInfo(DomainAcquisitionState.CanBeAuctioned, maxNewAuctionDate, minBid);
                } else {
                    return createBuyOrRenewInfo(DomainAcquisitionState.CanBeBought, minBid);
                }
            } else if (now < auctionState.ends_at) {
                return createAuctionInfo(
                    DomainAcquisitionState.AuctionInProgress,
                    auctionState.ends_at,
                    Math.ceil((auctionState.last_bid * minBidIncreaseCoef) / 1e6) * 1e6,
                    auctionState.last_bid,
                    auctionState.last_bidder
                );
            } else {
                return createAuctionInfo(DomainAcquisitionState.CanBeSettled, auctionState.ends_at, NaN, auctionState.last_bid, auctionState.last_bidder);
            }
        } else {
            if (now < launchDate) {
                return createUnobtainableInfo();
            }

            const periodEndDate = new Date(launchDate.getTime() + minAuctionPeriod);
            if (now < periodEndDate) {
                return createAuctionInfo(DomainAcquisitionState.CanBeAuctioned, periodEndDate, minBid);
            } else {
                return createBuyOrRenewInfo(DomainAcquisitionState.CanBeBought, minBid);
            }
        }

        function createAuctionInfo(
            state: DomainAcquisitionState.CanBeAuctioned | DomainAcquisitionState.AuctionInProgress | DomainAcquisitionState.CanBeSettled,
            auctionEnd: Date,
            nextMinimumBid: number,
            lastBid?: number,
            lastBidder?: string
        ) {
            return DomainAcquisitionInfo.createAuction(state, {
                auctionEnd,
                nextMinimumBid,
                registrationDuration: minDuration,
                lastBid: lastBid == null ? 0 : lastBid,
                lastBidder: lastBidder || null,
                bidAdditionalPeriod,
            });
        }

        function createBuyOrRenewInfo(state: DomainAcquisitionState.CanBeBought | DomainAcquisitionState.Taken, pricePerMinDuration: number) {
            return DomainAcquisitionInfo.createBuyOrRenew(state, { pricePerMinDuration, minDuration });
        }

        function createUnobtainableInfo() {
            return DomainAcquisitionInfo.createUnobtainable({ enabled: tldStorage.store.enabled, launchDate });
        }

        function getPricePerMinDuration(pricePerDay: BigNumber) {
            return pricePerDay.dividedBy(1e6).multipliedBy(minDuration).decimalPlaces(0, BigNumber.ROUND_HALF_UP).toNumber();
        }
    }

    async getBidderBalance(tld: string, address: string): Promise<number> {
        if (!this.validator.supportedTLDs.includes(tld)) {
            throw new Error(`TLD '${tld}' is not supported.`);
        }

        const contractAddress = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld);

        const balanceResponse = await this.tezos.getBigMapValue<TLDRegistrarStorage>(
            contractAddress,
            s => s.store.bidder_balances,
            RpcRequestData.fromValue(address)
        );

        return balanceResponse.scalar(BigNumberEncoder) || 0;
    }

    private assertDomainName(name: string) {
        const validation = this.validator.validateDomainName(name);

        if (validation === DomainNameValidationResult.VALID) {
            return;
        }

        this.tracer.trace('!! Domain name validation failed.', validation);

        throw new Error(`'${name}' is not a valid domain name.`);
    }
}
