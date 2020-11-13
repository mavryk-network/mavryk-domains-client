import { DomainRecord, ReverseRecord } from '../model';

export interface TezosDomainsDataProvider {
    getDomainRecord(name: string): Promise<DomainRecord | null>;
    getReverseRecord(address: string): Promise<ReverseRecord | null>;
    getDomainExpiry(key: string): Promise<Date | null>;
}
