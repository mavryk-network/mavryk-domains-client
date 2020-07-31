import { Tezos } from '@taquito/taquito';
import {
    ProxyContractAddressResolver,
    TezosDomainsConfig,
    TezosClient,
    TezosProxyClient,
    ProxyAddressConfig,
    ConsoleTracer,
    NoopTracer,
} from '@tezos-domains/core';

import { NameResolver } from './name-resolver';
import { BlockchainNameResolver } from './blockchain-name-resolver';
import { CachedNameResolver } from './cached-name-resolver';

export class TezosDomainsResolver implements NameResolver {
    private resolver: NameResolver;

    constructor(config?: TezosDomainsConfig) {
        const tracer = config?.tracing ? new ConsoleTracer() : new NoopTracer();
        const tezosClient = new TezosClient(config?.tezos || Tezos, tracer);
        const contractAddressResolver = new ProxyContractAddressResolver(new ProxyAddressConfig(config), tezosClient, tracer);
        const tezos = new TezosProxyClient(tezosClient, contractAddressResolver);
        const blockchainResolver = new BlockchainNameResolver(tezos, tracer);
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
