import { ManagerConfig, DomainsManager, CommitmentGenerator, BlockchainDomainsManager } from '@tezos-domains/manager';
import { ResolverConfig, NameResolver, BlockchainNameResolver, CachedNameResolver } from '@tezos-domains/resolver';
import { TezosClient, AddressBook, ConsoleTracer, NoopTracer, DomainNameValidator } from '@tezos-domains/core';
import { Tezos } from '@taquito/taquito';

export type ClientConfig = ManagerConfig & ResolverConfig;

/**
 * Facade class that surfaces all of the libraries capability and allow it's configuration.
 */
export class TezosDomainsClient {
    private _manager!: DomainsManager;
    private _resolver!: NameResolver;
    private _validator!: DomainNameValidator;

    /**
     * Gets the manager instance. The manager contains functions for buying and updating domains and reverse records.
     */
    get manager(): DomainsManager {
        return this._manager;
    }

    /**
     * Gets the resolver instance. The resolver contains functions for resolving names and addresses.
     */
    get resolver(): NameResolver {
        return this._resolver;
    }

    /**
     * Gets the validator instance. The validator contains functions for validating domain names.
     */
    get validator(): DomainNameValidator {
        return this._validator;
    }

    /**
     * Creates a new instance of the `TezosDomainsClient` class with the specified `config`.
     *
     * @example
     * ```
     * const tezosDomains = new TezosDomainsClient({ network: 'carthagenet', caching: { enabled: true } });
     * ```
     */
    constructor(config?: ClientConfig) {
        this.setConfig(config);
    }

    /**
     * Sets a new configuration for this instance. All components are recreated with the new `config`.
     */
    setConfig(config?: ClientConfig): void {
        const tracer = config?.tracing ? new ConsoleTracer() : new NoopTracer();
        const tezosToolkit = config?.tezos || Tezos;
        const tezos = new TezosClient(config?.tezos || Tezos, tracer);
        const addressBook = new AddressBook(tezos, config);
        const commitmentGenerator = new CommitmentGenerator(tezosToolkit);

        this._validator = new DomainNameValidator(config);
        this._manager = new BlockchainDomainsManager(tezos, addressBook, tracer, commitmentGenerator);

        const blockchainResolver = new BlockchainNameResolver(tezos, addressBook, tracer, this._validator);
        if (config?.caching) {
            this._resolver = new CachedNameResolver(blockchainResolver, tracer, {
                defaultRecordTtl: config.caching.defaultRecordTtl || 600,
                defaultReverseRecordTtl: config.caching.defaultReverseRecordTtl || 600,
            });
        } else {
            this._resolver = blockchainResolver;
        }
    }

    /**
     * Clears the name/address resolution cache. (Only applies when `caching` is set to `true`).
     */
    clearResolverCache(): void {
        this._resolver.clearCache();
    }
}
