import { ManagerConfig, DomainsManager, CommitmentGenerator, BlockchainDomainsManager, UnsupportedDomainsManager } from '@tezos-domains/manager';
import {
    ResolverConfig,
    NameResolver,
    BlockchainNameResolver,
    CachedNameResolver,
    NameNormalizingNameResolver,
    NullNameResolver,
} from '@tezos-domains/resolver';
import {
    TezosClient,
    AddressBook,
    ConsoleTracer,
    NoopTracer,
    DomainNameValidator,
    TezosDomainsValidator,
    UnsupportedDomainNameValidator,
} from '@tezos-domains/core';

export type ClientConfig = ManagerConfig & ResolverConfig;

/**
 * Facade class that surfaces all of the libraries capability and allow it's configuration.
 */
export class TezosDomainsClient {
    private _manager!: DomainsManager;
    private _resolver!: NameResolver;
    private _validator!: DomainNameValidator;
    private _supported = true;

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

    /** Whether this is supported instance of `TezosDomainsClient` (as opposed to `TezosDomainsClient.Unsupported`) */
    get isSupported(): boolean {
        return this._supported;
    }

    /**
     * Creates a new instance of the `TezosDomainsClient` class with the specified `config`.
     *
     * @example
     * ```
     * const tezosDomains = new TezosDomainsClient({ network: 'delphinet', caching: { enabled: true } });
     * ```
     */
    constructor(config: ClientConfig) {
        if (config) {
            this.setConfig(config);
        }
    }

    /**
     * Sets a new configuration for this instance. All components are recreated with the new `config`.
     */
    setConfig(config: ClientConfig): void {
        if (!this._supported) {
            throw new Error('Invalid operation. Unsupported client cannot be modified.');
        }

        const tracer = config.tracing ? new ConsoleTracer() : new NoopTracer();
        const tezosToolkit = config.tezos;
        const tezos = new TezosClient(config.tezos, tracer);
        const addressBook = new AddressBook(tezos, config);
        const commitmentGenerator = new CommitmentGenerator(tezosToolkit);

        this._validator = new TezosDomainsValidator(config);
        this._manager = new BlockchainDomainsManager(tezos, addressBook, tracer, commitmentGenerator);

        const blockchainResolver = new BlockchainNameResolver(tezos, addressBook, tracer, this._validator);
        if (config.caching) {
            this._resolver = new CachedNameResolver(blockchainResolver, tracer, {
                defaultRecordTtl: config.caching.defaultRecordTtl || 600,
                defaultReverseRecordTtl: config.caching.defaultReverseRecordTtl || 600,
            });
        } else {
            this._resolver = blockchainResolver;
        }

        this._resolver = new NameNormalizingNameResolver(this._resolver, tracer);
    }

    /**
     * Clears the name/address resolution cache. (Only applies when `caching` is set to `true`).
     */
    clearResolverCache(): void {
        this._resolver.clearCache();
    }

    /**
     * Gets a singleton instance with method that are stubbed and return null or default value, or throw an exception.
     * This instance can be used in an app that supports multiple networks where on some of them Tezos Domains are supported
     * and on other not supported (contracts are not deployed etc.).
     * 
     * @example
     * ```
     * function getClient(network: string) {
     *     if(isTezosDomainsSupportedNetwork(network)) {
     *          return new TezosDomainsClient({ network, tezos });
     *     } else {
     *          return TezosDomainsClient.Unsupported;
     *     }
     * }
     * 
     * const client = getClient('unsupportednetwork');
     * 
     * if (client.isSupported) { // not executed
     *     console.log(await client.manager.getAcquisitionInfo('alice.tez'));
     * }
     * 
     * await client.resolver.resolveNameToAddress('alice.tez'); // returns null
     * ```
     */
    static get Unsupported(): TezosDomainsClient {
        const client = new TezosDomainsClient(null as any);
        client.setUnsupported();
        return client;
    }

    /** @internal */
    setUnsupported(): void {
        this._validator = new UnsupportedDomainNameValidator();
        this._manager = new UnsupportedDomainsManager();
        this._resolver = new NullNameResolver();
        this._supported = false;
    }
}
