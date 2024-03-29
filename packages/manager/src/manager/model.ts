import { DateEncoder, encoder, NormalizeBytesEncoder, RecordMetadata, RpcRequest, RpcResponse } from '@tezos-domains/core';
import { BigNumberEncoder, MapEncoder } from '@tezos-domains/taquito';
import BigNumber from 'bignumber.js';

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

@RpcRequest()
export class Tzip12TransferDestination {
    to_!: string;
    token_id!: number;
    amount!: number;
}

@RpcRequest()
export class Tzip12TransferRequest {
    from_!: string;
    txs!: Tzip12TransferDestination[];
}

@RpcResponse()
export class TLDRecord {
    @encoder(DateEncoder) expiry!: Date;
}

@RpcResponse()
export class AuctionState {
    @encoder(BigNumberEncoder) last_bid!: number;
    last_bidder!: string;
    @encoder(DateEncoder) ends_at!: Date;
    @encoder(BigNumberEncoder) ownership_period!: number;
}

@RpcRequest()
export class ClaimRequest {
    /** The first part of the domain name (e.g. `alice` if full domain name is `alice.com`) */
    @encoder(NormalizeBytesEncoder) label!: string;

    /** The tld of the domain (e.g. `com` if full domain name is `alice.com`) */
    @encoder(NormalizeBytesEncoder) tld!: string;

    /** The address that should be set as the owner of the domain record. */
    owner!: string;

    /** The ISO Timestamp of when the payload was signed */
    timestamp!: string;
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

export interface TLDConfiguration {
    maxCommitmentAge: BigNumber;
    minCommitmentAge: BigNumber;
    minDuration: BigNumber;
    minBidIncreaseRatio: BigNumber;
    minAuctionPeriod: BigNumber;
    bidAdditionalPeriod: BigNumber;
    launchDates: Record<string, Date | null>;
    standardPrices: Record<string, BigNumber>;
    isClaimable?: boolean;
    claimPrice?: BigNumber;
}

export const DEFAULT_STORAGE_LIMITS = {
    set_child_record: 400,
    update_record: 400,
    claim_reverse_record: 400,
    update_reverse_record: 200,
    commit: 200,
    buy: 800,
    bid: 200,
    settle: 800,
};
