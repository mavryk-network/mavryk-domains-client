import { ManagerConfig, DomainsManager, CommitmentGenerator, BlockchainDomainsManager } from '@tezos-domains/manager';
import { ResolverConfig, NameResolver, BlockchainNameResolver, CachedNameResolver } from '@tezos-domains/resolver';
import { TezosClient, AddressBook, ConsoleTracer, NoopTracer } from '@tezos-domains/core';
import { Tezos } from '@taquito/taquito';

export type ClientConfig = ManagerConfig & ResolverConfig;

export class TezosDomainsClient {
    private _manager!: DomainsManager;
    private _resolver!: NameResolver;

    get manager(): DomainsManager {
        return this._manager;
    }

    get resolver(): NameResolver {
        return this._resolver;
    }

    constructor(config?: ClientConfig) {
        this.setConfig(config);
    }

    setConfig(config?: ClientConfig): void {
        const tracer = config?.tracing ? new ConsoleTracer() : new NoopTracer();
        const tezosToolkit = config?.tezos || Tezos;
        const tezos = new TezosClient(config?.tezos || Tezos, tracer);
        const addressBook = new AddressBook(tezos, config);
        const commitmentGenerator = new CommitmentGenerator(tezosToolkit);

        this._manager = new BlockchainDomainsManager(tezos, addressBook, tracer, commitmentGenerator);

        const blockchainResolver = new BlockchainNameResolver(tezos, addressBook, tracer);
        if (config?.caching) {
            this._resolver = new CachedNameResolver(blockchainResolver, tracer, {
                defaultRecordTtl: config.caching.defaultRecordTtl || 600,
                defaultReverseRecordTtl: config.caching.defaultReverseRecordTtl || 600,
            });
        } else {
            this._resolver = blockchainResolver;
        }
    }

    clearResolverCache(): void {
        this._resolver.clearCache();
    }
}
