import { BigMapAbstraction, TezosToolkit } from "@taquito/taquito";
import { encoders, decode } from './utils/convert';

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

export class ReverseRecord {
    @decode(encoders.string) name!: string;
    owner!: string;
}

export class DomainRecord {
    address!: string;
}

export class RecordValidity {
    @decode(encoders.date) timestamp!: Date;
}
