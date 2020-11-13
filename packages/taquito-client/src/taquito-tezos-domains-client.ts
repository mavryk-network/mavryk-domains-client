import { TezosDomainsConfig, NoopTracer, ConsoleTracer, AddressBook, TezosDomainsValidator } from '@tezos-domains/core';
import { TezosToolkit } from '@taquito/taquito';
import { BlockchainNameResolver, NameResolver, CachedNameResolver, NameNormalizingNameResolver, NullNameResolver } from '@tezos-domains/resolver';
import { DomainsManager, CommitmentGenerator, BlockchainDomainsManager, UnsupportedDomainsManager } from '@tezos-domains/manager';
import { TaquitoClient } from '@tezos-domains/taquito';

import { TaquitoTezosDomainsProxyContractAddressResolver } from './taquito-proxy-contract-address-resolver';
import { TaquitoTezosDomainsDataProvider } from './taquito-data-provider';
import { DomainNameValidator } from '@tezos-domains/core';
import { UnsupportedDomainNameValidator } from '@tezos-domains/core';

export type TaquitoTezosDomainsConfig = TezosDomainsConfig & { tezos: TezosToolkit };

/**
 * Facade class that surfaces all of the libraries capability and allow it's configuration.
 * Uses taquito framework.
 */
export class TaquitoTezosDomainsClient {
    private _manager!: DomainsManager;
    private _resolver!: NameResolver;
    private _validator!: DomainNameValidator;
    private _supported = true;

    /**
     * Gets the validator instance. The validator contains functions for validating domain names.
     */
    get validator(): DomainNameValidator {
        return this._validator;
    }

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

    /** Whether this is supported instance of `TezosDomainsClient` (as opposed to `TezosDomainsClient.Unsupported`) */
    get isSupported(): boolean {
        return this._supported;
    }

    constructor(config: TaquitoTezosDomainsConfig) {
        if (config) {
            this.setConfig(config);
        }
    }

    setConfig(config: TaquitoTezosDomainsConfig): void {
        if (!this._supported) {
            throw new Error('Invalid operation. Unsupported client cannot be modified.');
        }

        this._validator = new TezosDomainsValidator(config);

        const tracer = config.tracing ? new ConsoleTracer() : new NoopTracer();
        const tezos = new TaquitoClient(config.tezos, tracer);
        const proxyContractAddressResolver = new TaquitoTezosDomainsProxyContractAddressResolver(tezos);
        const addressBook = new AddressBook(proxyContractAddressResolver, config);
        const dataProvider = new TaquitoTezosDomainsDataProvider(tezos, addressBook, tracer);
        const commitmentGenerator = new CommitmentGenerator(config.tezos);

        this._manager = new BlockchainDomainsManager(tezos, addressBook, tracer, commitmentGenerator);

        const blockchainResolver = new BlockchainNameResolver(dataProvider, tracer, this.validator);
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
     * Gets a singleton instance with method that are stubbed and return null or default value, or throw an exception.
     * This instance can be used in an app that supports multiple networks where on some of them Tezos Domains are supported
     * and on other not supported (contracts are not deployed etc.).
     *
     * @example
     * ```
     * function getClient(network: string) {
     *     if(isTezosDomainsSupportedNetwork(network)) {
     *          return new TaquitoTezosDomainsClient({ network, tezos });
     *     } else {
     *          return TaquitoTezosDomainsClient.Unsupported;
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
    static get Unsupported(): TaquitoTezosDomainsClient {
        const client = new TaquitoTezosDomainsClient(null as any);
        client.setUnsupported();
        return client;
    }

    private setUnsupported(): void {
        this._supported = false;
        this._manager = new UnsupportedDomainsManager();
        this._resolver = new NullNameResolver();
        this._validator = new UnsupportedDomainNameValidator();
    }
}
