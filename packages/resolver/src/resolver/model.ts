import { RecordMetadata } from '@tezos-domains/core';

export interface DomainInfo {
    expiry: Date | null;
    owner: string;
    data: RecordMetadata;
    address: string | null;
}

export interface ReverseRecordInfo {
    name: string | null;
    owner: string;
    data: RecordMetadata;
}