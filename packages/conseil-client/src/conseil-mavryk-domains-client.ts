import {
    AddressBook,
    MavrykDomainsValidator,
    createTracer,
    DomainNameValidator,
    UnsupportedDomainNameValidator,
    ResolverDataProviderAdapter,
} from '@mavrykdynamics/mavryk-domains-core';
import { NameResolver, NullNameResolver, createResolver } from '@mavrykdynamics/mavryk-domains-resolver';

import { ConseilMavrykDomainsProxyContractAddressResolver } from './conseil-proxy-contract-address-resolver';
import { ConseilMavrykDomainsDataProvider } from './conseil-data-provider';
import { ConseilMavrykDomainsConfig } from './model';
import { ConseilClient } from './conseil/client';

/**
 * Facade class that surfaces all of the libraries capability and allow it's configuration.
 * Uses conseiljs framework.
 */
export class ConseilMavrykDomainsClient {
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
     * Gets the resolver instance. The resolver contains functions for resolving names and addresses.
     */
    get resolver(): NameResolver {
        return this._resolver;
    }

    /** Whether this is supported instance of `ConseilMavrykDomainsClient` (as opposed to `ConseilMavrykDomainsClient.Unsupported`) */
    get isSupported(): boolean {
        return this._supported;
    }

    constructor(config: ConseilMavrykDomainsConfig) {
        if (config) {
            this.setConfig(config);
        }
    }

    setConfig(config: ConseilMavrykDomainsConfig): void {
        if (!this._supported) {
            throw new Error('Invalid operation. Unsupported client cannot be modified.');
        }

        this._validator = new MavrykDomainsValidator(config);

        const tracer = createTracer(config);
        const conseil = new ConseilClient(config.conseil, tracer);
        const proxyContractAddressResolver = new ConseilMavrykDomainsProxyContractAddressResolver(conseil);
        const addressBook = new AddressBook(proxyContractAddressResolver, config);
        const dataProvider = new ConseilMavrykDomainsDataProvider(conseil, addressBook, tracer);

        this._resolver = createResolver(config, new ResolverDataProviderAdapter(dataProvider, tracer), tracer, this.validator);
    }

    /**
     * Gets a singleton instance with method that are stubbed and return null or default value, or throw an exception.
     * This instance can be used in an app that supports multiple networks where on some of them Mavryk Domains are supported
     * and on other not supported (contracts are not deployed etc.).
     *
     * @example
     * ```
     * function getClient(network: string) {
     *     if(isMavrykDomainsSupportedNetwork(network)) {
     *          return new ConseilMavrykDomainsClient({ network, tezos });
     *     } else {
     *          return ConseilMavrykDomainsClient.Unsupported;
     *     }
     * }
     *
     * const client = getClient('unsupportednetwork');
     *
     * if (client.isSupported) { // not executed
     *     // ...
     * }
     *
     * await client.resolver.resolveNameToAddress('alice.mav'); // returns null
     * ```
     */
    static get Unsupported(): ConseilMavrykDomainsClient {
        const client = new ConseilMavrykDomainsClient(null as any);
        client.setUnsupported();
        return client;
    }

    private setUnsupported(): void {
        this._supported = false;
        this._resolver = new NullNameResolver();
        this._validator = new UnsupportedDomainNameValidator();
    }
}
