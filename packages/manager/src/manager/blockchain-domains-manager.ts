import { TransactionWalletOperation } from '@taquito/taquito';
import {
    Tracer,
    TezosClient,
    AddressBook,
    Exact,
    SmartContractType,
    RpcRequestData,
    TLDRegistrarStorage,
    DateEncoder,
    getTld,
    MapEncoder,
    RpcResponseData,
    BigNumberEncoder,
} from '@tezos-domains/core';
import { BytesEncoder, getLabel } from '@tezos-domains/core';
import BigNumber from 'bignumber.js';

import {
    SetChildRecordRequest,
    UpdateRecordRequest,
    CommitmentRequest,
    BuyRequest,
    RenewRequest,
    ReverseRecordRequest,
    CommitmentInfo,
    TLDRecord,
    UpdateReverseRecordRequest,
    BidRequest,
    SettleRequest,
    DomainAcquisitionState,
    AuctionState,
    DomainAcquisitionInfo,
} from './model';
import { DomainsManager } from './domains-manager';
import { CommitmentGenerator } from './commitment-generator';

export class BlockchainDomainsManager implements DomainsManager {
    constructor(private tezos: TezosClient, private addressBook: AddressBook, private tracer: Tracer, private commitmentGenerator: CommitmentGenerator) {}

    async setChildRecord(request: Exact<SetChildRecordRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'set_child_record';

        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(SetChildRecordRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [
            encodedRequest.label,
            encodedRequest.parent,
            encodedRequest.address,
            encodedRequest.owner,
            encodedRequest.data,
            encodedRequest.expiry,
        ]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async updateRecord(request: Exact<UpdateRecordRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'update_record';
        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(UpdateRecordRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [encodedRequest.name, encodedRequest.address, encodedRequest.owner, encodedRequest.data]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async commit(tld: string, request: Exact<CommitmentRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'commit';
        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const commitmentHash = await this.commitmentGenerator.generate(request);
        const operation = await this.tezos.call(address, entrypoint, [commitmentHash]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async buy(tld: string, request: Exact<BuyRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'buy';
        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const info = await this.getAcquisitionInfo(`${request.label}.${tld}`);
        const price = Math.ceil(info.buyOrRenewDetails.pricePerMinDuration * (request.duration / info.buyOrRenewDetails.minDuration));
        const encodedRequest = RpcRequestData.fromObject(BuyRequest, request).encode();

        const operation = await this.tezos.call(
            address,
            entrypoint,
            [encodedRequest.label, encodedRequest.duration, encodedRequest.owner, encodedRequest.address, encodedRequest.data],
            price
        );

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async renew(tld: string, request: Exact<RenewRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'renew';

        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const info = await this.getAcquisitionInfo(`${request.label}.${tld}`);
        const price = Math.ceil(info.buyOrRenewDetails.pricePerMinDuration * (request.duration / info.buyOrRenewDetails.minDuration));
        const encodedRequest = RpcRequestData.fromObject(RenewRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [encodedRequest.label, encodedRequest.duration], price);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async claimReverseRecord(request: Exact<ReverseRecordRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'claim_reverse_record';

        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(ReverseRecordRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [encodedRequest.name, encodedRequest.owner, encodedRequest.data]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async updateReverseRecord(request: Exact<UpdateReverseRecordRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'update_reverse_record';

        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(UpdateReverseRecordRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [encodedRequest.address, encodedRequest.name, encodedRequest.owner, encodedRequest.data]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async getCommitment(tld: string, request: Exact<CommitmentRequest>): Promise<CommitmentInfo | null> {
        this.tracer.trace('=> Getting existing commitment.', tld, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld);
        const commitmentHash = await this.commitmentGenerator.generate(request);

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
        const minAge = config.get('min_commitment_age', BigNumberEncoder)!;
        const maxAge = config.get('max_commitment_age', BigNumberEncoder)!;

        const usableFrom = new Date(commitment.getTime() + minAge * 1000);
        const usableUntil = new Date(commitment.getTime() + maxAge * 1000);

        this.tracer.trace(
            `<= Commitment found with timestamp ${commitment.toISOString()}. Based on TLDRegistrar it's usable from ${usableFrom.toISOString()} to ${usableUntil.toISOString()}.`
        );

        return new CommitmentInfo(commitment, usableFrom, usableUntil);
    }

    async getAcquisitionInfo(name: string): Promise<DomainAcquisitionInfo> {
        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, getTld(name));
        const tldStorage = await this.tezos.storage<TLDRegistrarStorage>(address);
        const now = new Date();

        if (!tldStorage.store.enabled) {
            return DomainAcquisitionInfo.create(DomainAcquisitionState.Unobtainable);
        }

        const label = getLabel(name);
        const tldRecordResponse = await this.tezos.getBigMapValue<TLDRegistrarStorage>(
            address,
            s => s.store.records,
            RpcRequestData.fromValue(label, BytesEncoder)
        );
        const tldRecord = tldRecordResponse.decode(TLDRecord);
        const config = new RpcResponseData(tldStorage.store.config).scalar(MapEncoder)!;
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
            const launchDate = new Date(config.get<BigNumber>('launch_date')!.toNumber() * 1000);
            if (now < launchDate) {
                return DomainAcquisitionInfo.create(DomainAcquisitionState.Unobtainable);
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
            });
        }

        function createBuyOrRenewInfo(state: DomainAcquisitionState.CanBeBought | DomainAcquisitionState.Taken, pricePerMinDuration: number) {
            return DomainAcquisitionInfo.createBuyOrRenew(state, { pricePerMinDuration, minDuration });
        }

        function getPricePerMinDuration(pricePerDay: BigNumber) {
            return pricePerDay.dividedBy(1e6).multipliedBy(minDuration).decimalPlaces(0, BigNumber.ROUND_HALF_UP).toNumber();
        }
    }

    async getBidderBalance(tld: string, address: string): Promise<number> {
        const contractAddress = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld);

        const balanceResponse = await this.tezos.getBigMapValue<TLDRegistrarStorage>(
            contractAddress,
            s => s.store.bidder_balances,
            RpcRequestData.fromValue(address)
        );

        return balanceResponse.scalar(BigNumberEncoder) || 0;
    }

    async bid(tld: string, request: Exact<BidRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'bid';

        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const balance = await this.getBidderBalance(tld, await this.tezos.getPkh());
        const encodedRequest = RpcRequestData.fromObject(BidRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [encodedRequest.label, encodedRequest.bid], encodedRequest.bid - balance);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async settle(tld: string, request: Exact<SettleRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'settle';

        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(SettleRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [encodedRequest.label, encodedRequest.owner, encodedRequest.address, encodedRequest.data]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async withdraw(tld: string, recipient: string): Promise<TransactionWalletOperation> {
        const entrypoint = 'withdraw';

        this.tracer.trace(`=> Executing ${entrypoint}.`, recipient);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const operation = await this.tezos.call(address, entrypoint, [recipient]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }
}
