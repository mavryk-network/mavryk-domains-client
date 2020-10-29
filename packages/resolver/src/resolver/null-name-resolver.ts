import { NameResolver } from './name-resolver';
import { DomainInfo, ReverseRecordInfo } from './model';

export class NullNameResovler implements NameResolver {
    resolveDomainRecord(): Promise<DomainInfo | null> {
        return Promise.resolve(null);
    }

    resolveNameToAddress(): Promise<string | null> {
        return Promise.resolve(null);
    }

    resolveReverseRecord(): Promise<ReverseRecordInfo | null> {
        return Promise.resolve(null);
    }

    resolveAddressToName(): Promise<string | null> {
        return Promise.resolve(null);
    }

    clearCache(): void {
        return void 0;
    }
}
