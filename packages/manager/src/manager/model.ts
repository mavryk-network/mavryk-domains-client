import { RpcRequest, encoder, BytesEncoder, RpcResponse, DateEncoder, MapEncoder, RecordMetadata } from '@tezos-domains/core';
import BigNumber from 'bignumber.js';

@RpcRequest()
export class SetChildRecordRequest {
    /** The first part of the domain name (e.g. `bob` if full domain name is `bob.alice.tez`) */
    @encoder(BytesEncoder) label!: string;
    /** The parent part of the domain name (e.g. `alice.tez` if full domain name is `bob.alice.tez`) */
    @encoder(BytesEncoder) parent!: string;
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
    @encoder(BytesEncoder) name!: string;
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
    @encoder(BytesEncoder) label!: string;
    /** The address of the future buyer. */
    owner!: string;
}

@RpcRequest()
export class BuyRequest {
    /** The first part of the domain name (e.g. `alice` if full domain name is `alice.tez`) */
    @encoder(BytesEncoder) label!: string;
    /** The address of the buyer. */
    owner!: string;
    /** The duration of the domain registration in days. */
    duration!: number;
    /** The address that is resolved when resolving the domain name. */
    address!: string | null;
    /** Additional metadata. */
    @encoder(MapEncoder) data!: RecordMetadata;
}

@RpcRequest()
export class RenewRequest {
    /** The first part of the domain name (e.g. `alice` if full domain name is `alice.tez`) */
    @encoder(BytesEncoder) label!: string;
    /** The duration of the domain renewal in days. */
    duration!: number;
}

@RpcRequest()
export class ReverseRecordRequest {
    /** The name that is resolved when resolving the senders address. */
    @encoder(BytesEncoder) name?: string | null;
    /** The address that should be set as the owner of the reverse record. */
    owner!: string;
    /** Additional metadata. */
    @encoder(MapEncoder) data!: RecordMetadata;
}

@RpcRequest()
export class UpdateReverseRecordRequest {
    /** The name that is resolved when resolving the [[`address`]]. */
    @encoder(BytesEncoder) name?: string | null;
    /** The address that should be set as the owner of the reverse record. */
    owner!: string;
    /** The address that the reverse record is associated with. */
    address!: string;
    /** Additional metadata. */
    @encoder(MapEncoder) data!: RecordMetadata;
}

@RpcResponse()
export class TLDRecord {
    price_per_day!: BigNumber;
    @encoder(DateEncoder) expiration_date!: Date;
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

    async waitUntilUsable(): Promise<void> {
        await new Promise(resolve => setTimeout(() => resolve(), this._usableFrom.getTime() - Date.now()));
    }
}
