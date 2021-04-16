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
    TLDConfigProperty,
} from '@tezos-domains/core';
import { BytesEncoder, getLabel } from '@tezos-domains/core';
import { TaquitoClient, TLDRegistrarStorage, MapEncoder, BigNumberEncoder } from '@tezos-domains/taquito';
import BigNumber from 'bignumber.js';

import { CommitmentRequest, CommitmentInfo, TLDRecord, AuctionState, TLDConfiguration } from './model';
import { CommitmentGenerator } from './commitment-generator';
import { AcquisitionInfoInput, calculateAcquisitionInfo, DomainAcquisitionInfo } from './acquisition-info';

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
        const commitmentHash = this.commitmentGenerator.generate(request);
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

        const tldConfiguration = await this.getTldConfiguration(tld);
        const minAge = tldConfiguration.minCommitmentAge.times(1000).toNumber();
        const maxAge = tldConfiguration.maxCommitmentAge.times(1000).toNumber();

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
        const label = getLabel(name);
        const tldRecordResponse = await this.tezos.getBigMapValue<TLDRegistrarStorage>(
            address,
            s => s.store.records,
            RpcRequestData.fromValue(label, BytesEncoder)
        );
        const tldRecord = tldRecordResponse.decode(TLDRecord);

        const auctionStateResponse = await this.tezos.getBigMapValue<TLDRegistrarStorage>(
            address,
            s => s.store.auctions,
            RpcRequestData.fromValue(label, BytesEncoder)
        );
        const auctionState = auctionStateResponse.decode(AuctionState);

        let existingAuction: AcquisitionInfoInput['existingAuction'];
        if (auctionState) {
            existingAuction = {
                endsAt: auctionState.ends_at,
                lastBid: auctionState.last_bid,
                lastBidder: auctionState.last_bidder,
                ownedUntil: new Date(auctionState.ends_at.getTime() + auctionState.ownership_period * 24 * 60 * 60 * 1000),
            };
        }

        return calculateAcquisitionInfo({
            tldConfiguration: await this.getTldConfiguration(getTld(name)),
            name: name,
            existingDomain: tldRecord ? { expiry: tldRecord.expiry } : undefined,
            existingAuction,
        });
    }

    async getTldConfiguration(tld: string): Promise<TLDConfiguration> {
        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld);
        const tldStorage = await this.tezos.storage<TLDRegistrarStorage>(address);
        const config = new RpcResponseData(tldStorage.store.config).scalar(MapEncoder)!;

        const defaultProperties = Object.values(TLDConfigProperty) as string[];
        const launchDateKeys = [TLDConfigProperty.DEFAULT_LAUNCH_DATE as string].concat(config.keys().filter(k => !defaultProperties.includes(k)));

        const launchDates: Record<string, Date | null> = {};
        for (const launchDateKey of launchDateKeys) {
            const timestamp = config.get<BigNumber>(launchDateKey)?.toNumber();
            launchDates[launchDateKey] = timestamp ? new Date(timestamp * 1000) : null;
        }

        return {
            minCommitmentAge: config.get<BigNumber>(TLDConfigProperty.MIN_COMMITMENT_AGE)!,
            maxCommitmentAge: config.get<BigNumber>(TLDConfigProperty.MAX_COMMITMENT_AGE)!,
            minDuration: config.get<BigNumber>(TLDConfigProperty.MIN_DURATION)!,
            minBidPerDay: config.get<BigNumber>(TLDConfigProperty.MIN_BID_PER_DAY)!,
            minAuctionPeriod: config.get<BigNumber>(TLDConfigProperty.MIN_AUCTION_PERIOD)!,
            minBidIncreaseRatio: config.get<BigNumber>(TLDConfigProperty.MIN_BID_INCREASE_RATIO)!,
            bidAdditionalPeriod: config.get<BigNumber>(TLDConfigProperty.BID_ADDITIONAL_PERIOD)!,
            launchDates,
        };
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
