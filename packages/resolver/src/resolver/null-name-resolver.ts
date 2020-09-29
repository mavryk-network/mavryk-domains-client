import { NameResolver } from './name-resolver';
import { DomainInfo, ReverseRecordInfo } from './model';

export class NullNameResovler implements NameResolver {
    resolve(): Promise<DomainInfo | null> {
        return Promise.resolve(null);
    }

    resolveAddress(): Promise<string | null> {
        return Promise.resolve(null);
    }

    reverseResolve(): Promise<ReverseRecordInfo | null> {
        return Promise.resolve(null);
    }

    reverseResolveName(): Promise<string | null> {
        return Promise.resolve(null);
    }

    clearCache(): void {
        return void 0;
    }
}
