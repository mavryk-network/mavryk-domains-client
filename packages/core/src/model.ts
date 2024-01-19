import { RecordMetadata } from './rpc-data/record-metadata';
import { DomainNameValidatorFn } from './validator/validators';
import { SupportedNetworkType } from './utils/support';

export enum SmartContractType {
    TLDRegistrar = 'tldRegistrar',
    NameRegistry = 'nameRegistry',
    OracleRegistrar = 'oracleRegistrar',
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

export type CustomNetworkConfig = { network?: 'custom'; contractAddresses: ContractConfig; tlds: TLDConfig[]; claimableTlds?: TLDConfig[] } & CommonConfig;

export type DefaultNetworkConfig = {
    network?: SupportedNetworkType;
    contractAddresses?: ContractConfig;
    tlds?: TLDConfig[];
    claimableTlds?: TLDConfig[];
} & CommonConfig;

export type MavrykDomainsConfig = DefaultNetworkConfig | CustomNetworkConfig;

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
    tzip12_token_id: number | null;
}

export interface DomainRecordInfo<TAddress> {
    name: string;
    expiry: Date | null;
    data: RecordMetadata;
    address: TAddress;
}

export type DomainInfo = DomainRecordInfo<string | null>;
export type ReverseRecordDomainInfo = DomainRecordInfo<string>;

export enum TLDConfigProperty {
    MAX_COMMITMENT_AGE = '0',
    MIN_COMMITMENT_AGE = '1',
    MIN_BID_PER_DAY = '2',
    MIN_DURATION = '3',
    MIN_BID_INCREASE_RATIO = '4',
    MIN_AUCTION_PERIOD = '5',
    BID_ADDITIONAL_PERIOD = '6',
    DEFAULT_LAUNCH_DATE = '1000',
    DEFAULT_STANDARD_PRICE = '2000',
}

export class NotSupportedError extends Error {
    constructor() {
        super('Method not supported.');
    }
}

export interface AdditionalOperationParams {
    storageLimit?: number;
    gasLimit?: number;
    fee?: number;
}
