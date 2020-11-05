import { BigMapAbstraction, TezosToolkit, MichelsonMap } from '@taquito/taquito';

import { RpcResponse, encoder } from './rpc-data/decorators';
import { BigNumberEncoder } from './rpc-data/encoders/big-number-encoder';
import { BytesEncoder } from './rpc-data/encoders/bytes-encoder';
import { MapEncoder } from './rpc-data/encoders/map-encoder';
import { RecordMetadata } from './rpc-data/record-metadata';
import { DomainNameValidatorFn } from './validator/validators';

export enum SmartContractType {
    TLDRegistrar = 'tldRegistrar',
    NameRegistry = 'nameRegistry',
}

export type CommonConfig = {
    tezos: TezosToolkit;
    tracing?: boolean;
};

export type TLDConfig = {
    name: string;
    validator: DomainNameValidatorFn;
};

export type CustomNetworkConfig = { network?: 'custom'; contractAddresses: ContractConfig; tlds: TLDConfig[] } & CommonConfig;
export type DefaultNetworkConfig = { network?: 'mainnet' | 'carthagenet' | 'delphinet'; contractAddresses?: ContractConfig; tlds?: TLDConfig[] } & CommonConfig;

export type TezosDomainsConfig = DefaultNetworkConfig | CustomNetworkConfig;

export type ContractAddressDescriptor = {
    address: string;
    resolveProxyContract?: boolean;
};

export type ContractConfig = {
    [type: string]: ContractAddressDescriptor;
};

export interface NameRegistryStorage {
    actions: BigMapAbstraction;
    store: {
        records: BigMapAbstraction;
        reverse_records: BigMapAbstraction;
        expiry_map: BigMapAbstraction;
        owner: string;
        validators: string[];
    };
    trusted_senders: string[];
}

export interface TLDRegistrarStorage {
    store: {
        records: BigMapAbstraction;
        commitments: BigMapAbstraction;
        bidder_balances: BigMapAbstraction;
        auctions: BigMapAbstraction;
        owner: string;
        enabled: boolean;
        config: MichelsonMap<string, any>;
    };
    trusted_senders: string[];
}

export interface ProxyStorage {
    contract: string;
}

@RpcResponse()
export class ReverseRecord {
    @encoder(BytesEncoder) name?: string;
    owner!: string;
    @encoder(MapEncoder) data!: RecordMetadata;
}

@RpcResponse()
export class DomainRecord {
    @encoder(BytesEncoder) expiry_key!: string | null;
    @encoder(BigNumberEncoder) level!: number;
    @encoder(BigNumberEncoder) validator!: number;
    owner!: string;
    @encoder(MapEncoder) data!: RecordMetadata;
    address!: string | null;
}
