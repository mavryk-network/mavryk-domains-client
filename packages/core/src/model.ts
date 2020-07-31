import { BigMapAbstraction, TezosToolkit } from '@taquito/taquito';
import BigNumber from 'bignumber.js';

import { RpcResponse, encoder } from './rpc-data/decorators';
import { BigNumberEncoder } from './rpc-data/encoders/big-number-encoder';
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
    owner: string;
    trusted_senders: string[];
    validators: string[];
}

export interface TLDRegistrarStorage {
    records: BigMapAbstraction;
    commitments: BigMapAbstraction;
    max_commitment_age: BigNumber;
    min_commitment_age: BigNumber;
    min_bid_per_day: BigNumber;
}

@RpcResponse()
export class ReverseRecord {
    @encoder(BytesEncoder) name?: string;
    owner!: string;
}

@RpcResponse()
export class DomainRecord {
    @encoder(BytesEncoder) validity_key!: string;
    @encoder(BigNumberEncoder) level!: number;
    @encoder(BigNumberEncoder) validator!: number;
    owner!: string;
    address?: string;
}

