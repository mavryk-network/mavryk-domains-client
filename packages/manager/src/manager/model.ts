import { RpcRequest, encoder, BytesEncoder, RpcResponse, DateEncoder, MapEncoder, RecordMetadata } from '@tezos-domains/core';
import BigNumber from 'bignumber.js';

@RpcRequest()
export class SetChildRecordRequest {
    @encoder(BytesEncoder) label!: string;
    @encoder(BytesEncoder) parent!: string;
    owner!: string;
    address?: string | null;
    @encoder(MapEncoder) data!: RecordMetadata;
    @encoder(DateEncoder) validity?: Date | null;
}

@RpcRequest()
export class UpdateRecordRequest {
    @encoder(BytesEncoder) name!: string;
    owner!: string;
    address?: string | null;
    @encoder(MapEncoder) data!: RecordMetadata;
}

@RpcRequest()
export class CommitmentRequest {
    @encoder(BytesEncoder) label!: string;
    owner!: string;
}

@RpcRequest()
export class BuyRequest {
    @encoder(BytesEncoder) label!: string;
    owner!: string;
    duration!: number;
}

@RpcRequest()
export class RenewRequest {
    @encoder(BytesEncoder) label!: string;
    duration!: number;
}

@RpcRequest()
export class ReverseRecordRequest {
    @encoder(BytesEncoder) name?: string | null;
    owner!: string;
}

@RpcRequest()
export class UpdateReverseRecordRequest {
    @encoder(BytesEncoder) name?: string | null;
    owner!: string;
    address!: string;
}

@RpcResponse()
export class TLDRecord {
    price_per_day!: BigNumber;
    @encoder(DateEncoder) expiration_date!: Date;
}

export interface CommitmentInfo {
    usableFrom: Date;
    usableUntil: Date;
    created: Date;
}
