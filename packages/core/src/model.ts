import { BigMapAbstraction, TezosToolkit } from '@taquito/taquito';

import { RpcResponse, encoder } from './rpc-data/decorators';
import { BytesEncoder } from './rpc-data/encoders/bytes-encoder';
import { DateEncoder } from './rpc-data/encoders/date-encoder';

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

@RpcResponse()
export class RecordValidity {
    @encoder(DateEncoder) timestamp!: Date;
}
