import { Tezos } from '@taquito/taquito';
import {
    TezosDomainsConfig,
    TezosClient,
    AddressBook,
    ConsoleTracer,
    NoopTracer,
} from '@tezos-domains/core';

import { NameResolver } from './name-resolver';
import { BlockchainNameResolver } from './blockchain-name-resolver';
import { CachedNameResolver } from './cached-name-resolver';

export type CachingConfig = { enabled: boolean; recordTtl?: number; reverseRecordTtl?: number };

export type ResolverConfig = TezosDomainsConfig & {
    caching?: CachingConfig;
};

export class TezosDomainsResolver implements NameResolver {
    private resolver: NameResolver;

    constructor(config?: ResolverConfig) {
        const tracer = config?.tracing ? new ConsoleTracer() : new NoopTracer();
        const tezos = new TezosClient(config?.tezos || Tezos, tracer);
        const addressBook = new AddressBook(config);
        const blockchainResolver = new BlockchainNameResolver(tezos, addressBook, tracer);
        if (config?.caching) {
            this.resolver = new CachedNameResolver(blockchainResolver, tracer, {
                recordTtl: config.caching.recordTtl || 600,
                reverseRecordTtl: config.caching.reverseRecordTtl || 600,
            });
        } else {
            this.resolver = blockchainResolver;
        }
    }

    async resolve(name: string): Promise<string | null> {
        return this.resolver.resolve(name);
    }

    async reverseResolve(address: string): Promise<string | null> {
        return this.resolver.reverseResolve(address);
    }
}
