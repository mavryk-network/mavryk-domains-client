import { MavrykDomainsConfig, AddressBook, MavrykDomainsValidator, createTracer, DomainNameValidator, UnsupportedDomainNameValidator } from '@mavrykdynamics/mavryk-domains-core';
import { TezosToolkit } from '@mavrykdynamics/taquito';
import { NameResolver, NullNameResolver, createResolver } from '@mavrykdynamics/mavryk-domains-resolver';
import {
    DomainsManager,
    CommitmentGenerator,
    BlockchainDomainsManager,
    UnsupportedDomainsManager,
    TaquitoManagerDataProvider,
    TaquitoMavrykDomainsOperationFactory,
} from '@mavrykdynamics/mavryk-domains-manager';
import { TaquitoClient } from '@mavrykdynamics/mavryk-domains-taquito';

import { TaquitoMavrykDomainsProxyContractAddressResolver } from './taquito-proxy-contract-address-resolver';
import { TaquitoMavrykDomainsResolverDataProvider } from './taquito-resolver-data-provider';
import { TaquitoMavrykDomainsDataProvider } from './taquito-data-provider';

export type TaquitoMavrykDomainsConfig = MavrykDomainsConfig & { tezos: TezosToolkit };

/**
 * Facade class that surfaces all of the libraries capability and allow it's configuration.
 * Uses taquito framework.
 */
export class TaquitoMavrykDomainsClient {
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

    /** Whether this is supported instance of `TaquitoMavrykDomainsClient` (as opposed to `TaquitoMavrykDomainsClient.Unsupported`) */
    get isSupported(): boolean {
        return this._supported;
    }

    constructor(config: TaquitoMavrykDomainsConfig) {
        if (config) {
            this.setConfig(config);
        }
    }

    setConfig(config: TaquitoMavrykDomainsConfig): void {
        if (!this._supported) {
            throw new Error('Invalid operation. Unsupported client cannot be modified.');
        }

        this._validator = new MavrykDomainsValidator(config);

        const tracer = createTracer(config);
        const tezos = new TaquitoClient(config.tezos, tracer);
        const proxyContractAddressResolver = new TaquitoMavrykDomainsProxyContractAddressResolver(tezos);
        const addressBook = new AddressBook(proxyContractAddressResolver, config);
        const dataProvider = new TaquitoMavrykDomainsResolverDataProvider(tezos, addressBook, tracer);
        const commitmentGenerator = new CommitmentGenerator();
        const bigMapDataProvider = new TaquitoMavrykDomainsDataProvider(tezos, addressBook, tracer);
        const managerDataProvider = new TaquitoManagerDataProvider(tezos, addressBook, tracer, commitmentGenerator, this.validator, bigMapDataProvider);
        const operationFactory = new TaquitoMavrykDomainsOperationFactory(tezos, addressBook, tracer, commitmentGenerator, managerDataProvider, this.validator);

        this._manager = new BlockchainDomainsManager(tezos, tracer, operationFactory, managerDataProvider);
        this._resolver = createResolver(config, dataProvider, tracer, this.validator);
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
     *          return new TaquitoMavrykDomainsClient({ network, tezos });
     *     } else {
     *          return TaquitoMavrykDomainsClient.Unsupported;
     *     }
     * }
     *
     * const client = getClient('unsupportednetwork');
     *
     * if (client.isSupported) { // not executed
     *     console.log(await client.manager.getAcquisitionInfo('alice.mav'));
     * }
     *
     * await client.resolver.resolveNameToAddress('alice.mav'); // returns null
     * ```
     */
    static get Unsupported(): TaquitoMavrykDomainsClient {
        const client = new TaquitoMavrykDomainsClient(null as any);
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
