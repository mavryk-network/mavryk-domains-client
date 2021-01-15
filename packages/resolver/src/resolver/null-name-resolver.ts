import { NameResolver } from './name-resolver';
import { DomainInfo, ReverseRecordDomainInfo } from './model';

export class NullNameResolver implements NameResolver {
    resolveDomainRecord(): Promise<DomainInfo | null> {
        return Promise.resolve(null);
    }

    resolveNameToAddress(): Promise<string | null> {
        return Promise.resolve(null);
    }

    resolveReverseRecord(): Promise<ReverseRecordDomainInfo | null> {
        return Promise.resolve(null);
    }

    resolveAddressToName(): Promise<string | null> {
        return Promise.resolve(null);
    }

    clearCache(): void {
        return void 0;
    }
}
