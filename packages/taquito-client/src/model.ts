import { RecordMetadata, RpcResponse, BytesEncoder, encoder, DateEncoder } from '@tezos-domains/core';
import { MapEncoder, BigNumberEncoder } from '@tezos-domains/taquito';

@RpcResponse()
export class TaquitoReverseRecord {
    @encoder(BytesEncoder) name!: string | null;
    owner!: string;
    @encoder(MapEncoder) data!: RecordMetadata;
}

@RpcResponse()
export class TaquitoDomainRecord {
    @encoder(BytesEncoder) expiry_key!: string | null;
    @encoder(BigNumberEncoder) level!: number;
    @encoder(BigNumberEncoder) validator!: number;
    owner!: string;
    @encoder(MapEncoder) data!: RecordMetadata;
    address!: string | null;
}

@RpcResponse()
export class TaquitoDomainInfoResponse {
    @encoder(BytesEncoder) name!: string;
    @encoder(DateEncoder) expiry!: Date | null;
    @encoder(MapEncoder) data!: RecordMetadata;
    address!: string | null;
}
