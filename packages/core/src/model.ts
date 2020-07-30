import { BigMapAbstraction, TezosToolkit } from '@taquito/taquito';
import BigNumber from 'bignumber.js';

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
