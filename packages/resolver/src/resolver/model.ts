import { RecordMetadata } from '@tezos-domains/core';

export interface DomainInfo {
    name: string;
    expiry: Date | null;
    owner: string;
    data: RecordMetadata;
    address: string | null;
}

export interface ReverseRecordInfo {
    owner: string;
    data: RecordMetadata;
    domain: DomainInfo | null;
}