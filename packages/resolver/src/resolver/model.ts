import { RecordMetadata } from '@tezos-domains/core';

export interface DomainRecordInfo<TAddress> {
    name: string;
    expiry: Date | null;
    data: RecordMetadata;
    address: TAddress;
}

export type DomainInfo = DomainRecordInfo<string | null>;
export type ReverseRecordDomainInfo = DomainRecordInfo<string>;
