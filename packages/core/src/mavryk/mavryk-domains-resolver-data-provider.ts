import { DomainInfo, ReverseRecordDomainInfo } from '../model';

export interface MavrykDomainsResolverDataProvider {
    resolveDomainInfo(name: string): Promise<DomainInfo | null>;
    resolveReverseRecordDomainInfo(address: string): Promise<ReverseRecordDomainInfo | null>;
}
