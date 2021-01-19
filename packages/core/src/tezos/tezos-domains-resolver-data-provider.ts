import { DomainInfo, ReverseRecordDomainInfo } from '../model';

export interface TezosDomainsResolverDataProvider {
    resolveDomainInfo(name: string): Promise<DomainInfo | null>;
    resolveReverseRecordDomainInfo(address: string): Promise<ReverseRecordDomainInfo | null>;
}
