import { BigMapAbstraction, TezosToolkit } from "@taquito/taquito";

export type NetworkType = 'mainnet' | 'carthagenet' | 'custom';

export enum SmartContractType {
    TLDRegistrar = 'tldRegistrar',
    NameRegistry = 'nameRegistry',
}

export type TezosDomainsConfig = {
    network?: NetworkType;
    contractAddresses?: ContractConfig;
    tezos?: TezosToolkit;
};

export interface ProxyStorage {
    contract: string;
}

export type ContractConfig = {
    [type: string]: string;
    nameRegistry: string;
};

export interface NameRegistryStorage {
    records: BigMapAbstraction;
    reverse_records: BigMapAbstraction;
    validity_map: BigMapAbstraction;
}

export interface ReverseRecord {
    name: string;
    owner: string;
}

export interface DomainRecord {
    address: string;
}

export interface RecordValidity {
    timestamp: Date;
}
