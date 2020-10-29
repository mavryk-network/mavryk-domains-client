import { TezosDomainsConfig, TezosClient, AddressBook, ConsoleTracer, NoopTracer, DomainNameValidator } from '@tezos-domains/core';

import { NameResolver } from './name-resolver';
import { BlockchainNameResolver } from './blockchain-name-resolver';
import { CachedNameResolver } from './cached-name-resolver';
import { DomainInfo, ReverseRecordInfo } from './model';
import { NameNormalizingNameResolver } from './name-normalizing-name-resolver';

export type CachingConfig = { enabled: boolean; defaultRecordTtl?: number; defaultReverseRecordTtl?: number };

export type ResolverConfig = TezosDomainsConfig & {
    caching?: CachingConfig;
};

export class TezosDomainsResolver implements NameResolver {
    private resolver: NameResolver;

    constructor(config: ResolverConfig) {
        const tracer = config.tracing ? new ConsoleTracer() : new NoopTracer();
        const tezos = new TezosClient(config.tezos, tracer);
        const addressBook = new AddressBook(tezos, config);
        const validator = new DomainNameValidator(config);
        const blockchainResolver = new BlockchainNameResolver(tezos, addressBook, tracer, validator);
        if (config.caching) {
            this.resolver = new CachedNameResolver(blockchainResolver, tracer, {
                defaultRecordTtl: config.caching.defaultRecordTtl || 600,
                defaultReverseRecordTtl: config.caching.defaultReverseRecordTtl || 600,
            });
        } else {
            this.resolver = blockchainResolver;
        }

        this.resolver = new NameNormalizingNameResolver(this.resolver, tracer);
    }

    async resolveDomainRecord(name: string): Promise<DomainInfo | null> {
        return this.resolver.resolveDomainRecord(name);
    }

    async resolveNameToAddress(name: string): Promise<string | null> {
        return this.resolver.resolveNameToAddress(name);
    }

    async resolveReverseRecord(address: string): Promise<ReverseRecordInfo | null> {
        return this.resolver.resolveReverseRecord(address);
    }

    async resolveAddressToName(address: string): Promise<string | null> {
        return this.resolver.resolveAddressToName(address);
    }

    clearCache(): void {
        this.resolver.clearCache();
    }
}
