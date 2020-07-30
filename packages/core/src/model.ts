import { BigMapAbstraction, TezosToolkit } from '@taquito/taquito';

import { RpcResponse, encoder } from './rpc-data/decorators';
import { BytesEncoder } from './rpc-data/encoders/bytes-encoder';

export type NetworkType = 'mainnet' | 'carthagenet' | 'custom';

export enum SmartContractType {
    TLDRegistrar = 'tldRegistrar',
    NameRegistry = 'nameRegistry',
}

export type CommonConfig = {
    tezos?: TezosToolkit;
    tracing?: boolean;
};

export type CustomNetworkConfig = { network?: 'custom'; contractAddresses: ContractConfig } & CommonConfig;
export type DefaultNetworkConfig = { network?: 'mainnet' | 'carthagenet'; contractAddresses?: ContractConfig } & CommonConfig;

export type TezosDomainsConfig = DefaultNetworkConfig | CustomNetworkConfig;

export type ContractConfig = {
    [type: string]: string;
    nameRegistry: string;
};

export interface ProxyStorage {
    contract: string;
}

export interface NameRegistryStorage {
    records: BigMapAbstraction;
    reverse_records: BigMapAbstraction;
    validity_map: BigMapAbstraction;
}

@RpcResponse()
export class ReverseRecord {
    @encoder(BytesEncoder) name?: string;
    owner!: string;
}

@RpcResponse()
export class DomainRecord {
    @encoder(BytesEncoder) validity_key!: string;
    address?: string;
}
