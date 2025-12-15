import { MavrykDomainsConfig, MavrykDomainsResolverDataProvider, Tracer, DomainNameValidator } from '@mavrykdynamics/mavryk-domains-core';

import { NameResolver } from './name-resolver';
import { BlockchainNameResolver } from './blockchain-name-resolver';
import { CachedNameResolver } from './cached-name-resolver';
import { NameNormalizingNameResolver } from './name-normalizing-name-resolver';

export function createResolver(
    config: MavrykDomainsConfig,
    dataProvider: MavrykDomainsResolverDataProvider,
    tracer: Tracer,
    validator: DomainNameValidator
): NameResolver {
    let resolver: NameResolver = new BlockchainNameResolver(dataProvider, tracer, validator);
    if (config.caching) {
        resolver = new CachedNameResolver(resolver, tracer, {
            defaultRecordTtl: config.caching.defaultRecordTtl || 600,
            defaultReverseRecordTtl: config.caching.defaultReverseRecordTtl || 600,
        });
    }

    resolver = new NameNormalizingNameResolver(resolver, tracer);

    return resolver;
}
