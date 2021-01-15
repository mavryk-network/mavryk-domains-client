import { RecordMetadata } from './rpc-data/record-metadata';
import { DomainNameValidatorFn } from './validator/validators';

export enum SmartContractType {
    TLDRegistrar = 'tldRegistrar',
    NameRegistry = 'nameRegistry',
}

export type CachingConfig = { enabled: boolean; defaultRecordTtl?: number; defaultReverseRecordTtl?: number };

export type CommonConfig = {
    tracing?: boolean;
    caching?: CachingConfig;
};

export type TLDConfig = {
    name: string;
    validator: DomainNameValidatorFn;
};

export type CustomNetworkConfig = { network?: 'custom'; contractAddresses: ContractConfig; tlds: TLDConfig[] } & CommonConfig;
export type DefaultNetworkConfig = { network?: 'mainnet' | 'delphinet'; contractAddresses?: ContractConfig; tlds?: TLDConfig[] } & CommonConfig;

export type TezosDomainsConfig = DefaultNetworkConfig | CustomNetworkConfig;

export type ContractAddressDescriptor = {
    address: string;
    resolveProxyContract?: boolean;
};

export type ContractConfig = {
    [type: string]: ContractAddressDescriptor;
};

export interface ReverseRecord {
    name: string | null;
    owner: string;
}

export interface DomainRecord {
    expiry_key: string | null;
    owner: string;
    data: RecordMetadata;
    address: string | null;
}
