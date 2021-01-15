import { RpcRequest, encoder, RpcResponse, DateEncoder, RecordMetadata, NormalizeBytesEncoder } from '@tezos-domains/core';
import BigNumber from 'bignumber.js';
import { MapEncoder, BigNumberEncoder } from '@tezos-domains/taquito';

@RpcRequest()
export class SetChildRecordRequest {
    /** The first part of the domain name (e.g. `bob` if full domain name is `bob.alice.tez`) */
    @encoder(NormalizeBytesEncoder) label!: string;
    /** The parent part of the domain name (e.g. `alice.tez` if full domain name is `bob.alice.tez`) */
    @encoder(NormalizeBytesEncoder) parent!: string;
    /** The address that should be set as the owner of the domain record. */
    owner!: string;
    /** The address that is resolved when resolving the domain name. */
    address!: string | null;
    /** Additional metadata. */
    @encoder(MapEncoder) data!: RecordMetadata;
    /** The expiry of the record. Only used by the TLD registrar to set expiry for 2nd level domains. Should not be used for subdomains. */
    @encoder(DateEncoder) expiry?: Date | null;
}

@RpcRequest()
export class UpdateRecordRequest {
    /** The name of the domain (e.g. `alice.tez`) */
    @encoder(NormalizeBytesEncoder) name!: string;
    /** The address that should be set as the owner of the domain record. */
    owner!: string;
    /** The address that is resolved when resolving the domain name. */
    address!: string | null;
    /** Additional metadata. */
    @encoder(MapEncoder) data!: RecordMetadata;
}

@RpcRequest()
export class CommitmentRequest {
    /** The first part of the domain name (e.g. `alice` if full domain name is `alice.tez`) */
    @encoder(NormalizeBytesEncoder) label!: string;
    /** The address of the future buyer. */
    owner!: string;
    /** A random number that salts the commitment hash. Send the same value to `buy()`. */
    nonce!: number;
}

@RpcRequest()
export class BuyRequest {
    /** The first part of the domain name (e.g. `alice` if full domain name is `alice.tez`) */
    @encoder(NormalizeBytesEncoder) label!: string;
    /** The address of the buyer. */
    owner!: string;
    /** The duration of the domain registration in days. */
    duration!: number;
    /** The address that is resolved when resolving the domain name. */
    address!: string | null;
    /** Additional metadata. */
    @encoder(MapEncoder) data!: RecordMetadata;
    /** A random number that salted the commitment hash prior to this buy. */
    nonce!: number;
}

@RpcRequest()
export class RenewRequest {
    /** The first part of the domain name (e.g. `alice` if full domain name is `alice.tez`) */
    @encoder(NormalizeBytesEncoder) label!: string;
    /** The duration of the domain renewal in days. */
    duration!: number;
}

@RpcRequest()
export class ReverseRecordRequest {
    /** The name that is resolved when resolving the senders address. */
    @encoder(NormalizeBytesEncoder) name!: string | null;
    /** The address that should be set as the owner of the reverse record. */
    owner!: string;
}

@RpcRequest()
export class UpdateReverseRecordRequest {
    /** The name that is resolved when resolving the [[`address`]]. */
    @encoder(NormalizeBytesEncoder) name!: string | null;
    /** The address that should be set as the owner of the reverse record. */
    owner!: string;
    /** The address that the reverse record is associated with. */
    address!: string;
}

@RpcRequest()
export class BidRequest {
    /** The first part of the domain name (e.g. `alice` if full domain name is `alice.tez`) */
    @encoder(NormalizeBytesEncoder) label!: string;
    /** The new amount to bid in mutez. */
    bid!: number;
}

@RpcRequest()
export class SettleRequest {
    /** The first part of the domain name (e.g. `alice` if full domain name is `alice.tez`) */
    @encoder(NormalizeBytesEncoder) label!: string;
    /** The address of the buyer. */
    owner!: string;
    /** The address that is resolved when resolving the domain name. */
    address!: string | null;
    /** Additional metadata. */
    @encoder(MapEncoder) data!: RecordMetadata;
}

@RpcResponse()
export class TLDRecord {
    price_per_day!: BigNumber;
    @encoder(DateEncoder) expiry!: Date;
}

@RpcResponse()
export class AuctionState {
    @encoder(BigNumberEncoder) last_bid!: number;
    last_bidder!: string;
    @encoder(DateEncoder) ends_at!: Date;
    @encoder(BigNumberEncoder) ownership_period!: number;
}

export enum DomainAcquisitionState {
    Unobtainable = 'Unobtainable',
    Taken = 'Taken',
    CanBeBought = 'CanBeBought',
    CanBeAuctioned = 'CanBeAuctioned',
    AuctionInProgress = 'AuctionInProgress',
    CanBeSettled = 'CanBeSettled',
}

export interface DomainAcquisitionAuctionInfo {
    /** The amount of the last bid in mutez. */
    lastBid: number;
    /** The address of the sender of the last bid. */
    lastBidder: string | null;
    /** The minimum amount to outbid the current bid in mutez. (Value is `NaN` when auction is ended and waiting to be settled) */
    nextMinimumBid: number;
    /** The date at which the auction will end. This may change when bids are added towards the end of an auction. */
    auctionEnd: Date;
    /** The number of days that the domain will be registered for after an auction is settled. */
    registrationDuration: number;
    /** When a bid is made on an auction that will end in less milliseconds that this value, the end of auction is moved to this value of milliseconds from now. */
    bidAdditionalPeriod: number;
}

export interface DomainAcquisitionBuyOrRenewInfo {
    /** The price to buy or renew the domain for the minimum period [[`minDuration`]]. */
    pricePerMinDuration: number;
    /** The minimum duration in days for which it is possible to register or renew a domain. */
    minDuration: number;
}

export interface DomainAcquisitionUnobtainableInfo {
    /** Whether the TLD registrar is enabled. */
    enabled: boolean;
    /** The date since when it is possible to auction and buys domains from the TLD registrar. */
    launchDate: Date;
}

export class DomainAcquisitionInfo {
    get acquisitionState(): DomainAcquisitionState {
        return this._state;
    }

    get auctionDetails(): DomainAcquisitionAuctionInfo {
        this.assertState(
            'auctionDetails',
            DomainAcquisitionState.CanBeAuctioned,
            DomainAcquisitionState.AuctionInProgress,
            DomainAcquisitionState.CanBeSettled
        );

        return this._auctionInfo!;
    }

    get buyOrRenewDetails(): DomainAcquisitionBuyOrRenewInfo {
        this.assertState('buyOrRenewDetails', DomainAcquisitionState.CanBeBought, DomainAcquisitionState.Taken);

        return this._buyOrRenewInfo!;
    }

    get unobtainableDetails(): DomainAcquisitionUnobtainableInfo {
        this.assertState('unobtainableDetails', DomainAcquisitionState.Unobtainable);

        return this._unobtainableInfo!;
    }

    /**
     * Calculates buy or renew price for this domain.
     *
     * @param duration The number of days for which to calculate the price.
     * @returns Price for owning the domain for the specified duration in mutez.
     */
    calculatePrice(duration: number): number {
        this.assertState('calculatePrice', DomainAcquisitionState.CanBeBought, DomainAcquisitionState.Taken);

        return this._buyOrRenewInfo!.pricePerMinDuration * (duration / this._buyOrRenewInfo!.minDuration);
    }

    private constructor(
        private _state: DomainAcquisitionState,
        private _auctionInfo?: DomainAcquisitionAuctionInfo,
        private _buyOrRenewInfo?: DomainAcquisitionBuyOrRenewInfo,
        private _unobtainableInfo?: DomainAcquisitionUnobtainableInfo
    ) {}

    /** @internal */
    static createUnobtainable(unobtainableInfo: DomainAcquisitionUnobtainableInfo): DomainAcquisitionInfo {
        return new DomainAcquisitionInfo(DomainAcquisitionState.Unobtainable, undefined, undefined, unobtainableInfo);
    }

    /** @internal */
    static createAuction(state: DomainAcquisitionState, auctionInfo: DomainAcquisitionAuctionInfo): DomainAcquisitionInfo {
        return new DomainAcquisitionInfo(state, auctionInfo);
    }

    /** @internal */
    static createBuyOrRenew(state: DomainAcquisitionState, fifsInfo: DomainAcquisitionBuyOrRenewInfo): DomainAcquisitionInfo {
        return new DomainAcquisitionInfo(state, undefined, fifsInfo);
    }

    private assertState(description: string, ...allowedStates: DomainAcquisitionState[]) {
        if (!allowedStates.includes(this._state)) {
            throw new Error(`${description} is only available for states ${allowedStates.join(', ')}.`);
        }
    }
}

export class CommitmentInfo {
    /**
     * Date and time when it becomes possible to buy the domain by the commitment sender
     */
    get usableFrom(): Date {
        return this._usableFrom;
    }

    /**
     * Date and time when the commitment is expired and can no longer be used.
     */
    get usableUntil(): Date {
        return this._usableUntil;
    }

    /**
     * Date and time when the commitment was created.
     */
    get created(): Date {
        return this._created;
    }

    constructor(private _created: Date, private _usableFrom: Date, private _usableUntil: Date) {}

    /**
     * Returns a promise that is resolved when commitment can be spent to buy a domain.
     */
    async waitUntilUsable(): Promise<void> {
        await new Promise(resolve => setTimeout(() => resolve(), this._usableFrom.getTime() - Date.now()));
    }
}
