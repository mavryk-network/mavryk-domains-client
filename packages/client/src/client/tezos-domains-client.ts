import { ManagerConfig, DomainsManager, CommitmentGenerator, BlockchainDomainsManager } from '@tezos-domains/manager';
import { ResolverConfig, NameResolver, BlockchainNameResolver, CachedNameResolver } from '@tezos-domains/resolver';
import { TezosClient, AddressBook, ConsoleTracer, NoopTracer } from '@tezos-domains/core';
import { Tezos } from '@taquito/taquito';

export type ClientConfig = ManagerConfig & ResolverConfig;

export class TezosDomainsClient {
    private _manager: DomainsManager;
    private _resolver: NameResolver;

    get manager(): DomainsManager {
        return this._manager;
    }

    get resolver(): NameResolver {
        return this._resolver;
    }

    constructor(config?: ClientConfig) {
        const tracer = config?.tracing ? new ConsoleTracer() : new NoopTracer();
        const tezosToolkit = config?.tezos || Tezos;
        const tezos = new TezosClient(config?.tezos || Tezos, tracer);
        const addressBook = new AddressBook(config);
        const commitmentGenerator = new CommitmentGenerator(tezosToolkit);

        this._manager = new BlockchainDomainsManager(tezos, addressBook, tracer, commitmentGenerator);

        const blockchainResolver = new BlockchainNameResolver(tezos, addressBook, tracer);
        if (config?.caching) {
            this._resolver = new CachedNameResolver(blockchainResolver, tracer, {
                recordTtl: config.caching.recordTtl || 600,
                reverseRecordTtl: config.caching.reverseRecordTtl || 600,
            });
        } else {
            this._resolver = blockchainResolver;
        }
    }
}
