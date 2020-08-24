import { Tezos } from '@taquito/taquito';
import { TezosDomainsConfig, TezosClient, AddressBook, ConsoleTracer, NoopTracer, DomainRecord, ReverseRecord } from '@tezos-domains/core';

import { NameResolver } from './name-resolver';
import { BlockchainNameResolver } from './blockchain-name-resolver';
import { CachedNameResolver } from './cached-name-resolver';

export type CachingConfig = { enabled: boolean; defaultRecordTtl?: number; defaultReverseRecordTtl?: number };

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
                defaultRecordTtl: config.caching.defaultRecordTtl || 600,
                defaultReverseRecordTtl: config.caching.defaultReverseRecordTtl || 600,
            });
        } else {
            this.resolver = blockchainResolver;
        }
    }

    async resolve(name: string): Promise<DomainRecord | null> {
        return this.resolver.resolve(name);
    }

    async resolveAddress(name: string): Promise<string | null> {
        return this.resolver.resolveAddress(name);
    }

    async reverseResolve(address: string): Promise<ReverseRecord | null> {
        return this.resolver.reverseResolve(address);
    }

    async reverseResolveName(address: string): Promise<string | null> {
        return this.resolver.reverseResolveName(address);
    }
}
