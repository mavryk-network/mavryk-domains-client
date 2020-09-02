import { DomainRecord, ReverseRecord } from '@tezos-domains/core';

import { NameResolver } from './name-resolver';

export class NullNameResovler implements NameResolver {
    resolve(): Promise<DomainRecord | null> {
        return Promise.resolve(null);
    }

    resolveAddress(): Promise<string | null> {
        return Promise.resolve(null);
    }

    reverseResolve(): Promise<ReverseRecord | null> {
        return Promise.resolve(null);
    }

    reverseResolveName(): Promise<string | null> {
        return Promise.resolve(null);
    }

    clearCache(): void {
        return void 0;
    }
}
