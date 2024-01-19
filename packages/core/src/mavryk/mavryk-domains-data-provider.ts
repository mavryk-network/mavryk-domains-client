import { DomainRecord, ReverseRecord } from '../model';

export interface MavrykDomainsDataProvider {
    getDomainRecord(name: string): Promise<DomainRecord | null>;
    getReverseRecord(address: string): Promise<ReverseRecord | null>;
    getDomainExpiry(key: string): Promise<Date | null>;
}
