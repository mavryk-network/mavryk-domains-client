import { DomainInfo, ReverseRecordDomainInfo } from '@mavrykdynamics/mavryk-domains-core';

/**
 * An interface that defines functions for resolving names and addresses.
 */
export interface NameResolver {
    /**
     * Gets all information about a domain by it's name. If you only need to resolve the address, use [[`resolveNameToAddress`]] instead.
     *
     *  - Associated contract: [NameRegistry](https://docs.tezos.domains/deployed-contracts)
     */
    resolveDomainRecord(name: string): Promise<DomainInfo | null>;

    /**
     * Resolves a domain name to an address.
     *
     * Throws an error under following conditions:
     *  - name is not a valid domain name
     *
     * Returns null under following conditions:
     *  - record with the specified name does not exist
     *  - record with the specified name does not specify an address
     *  - record with the specified name has expired
     *
     * @example
     * ```
     * const address = await resolver.resolveNameToAddress('alice.mav');
     * console.log(address); // 'mv1...'
     * ```
     *
     *  - Associated contract: [NameRegistry](https://docs.tezos.domains/deployed-contracts)
     */
    resolveNameToAddress(name: string): Promise<string | null>;

    /**
     * Gets all information about a reverse record by it's address. If you only need to resolve the name, use [[`resolveAddressToName`]] instead.
     *
     *  - Associated contract: [NameRegistry](https://docs.tezos.domains/deployed-contracts)
     */
    resolveReverseRecord(address: string): Promise<ReverseRecordDomainInfo | null>;

    /**
     * Resolves an address to a name.
     *
     * Throws an error under following conditions:
     *  - address is not a valid tezos address
     *
     * Returns null under following conditions:
     *  - reverse record with the specified address does not exist
     *  - reverse record with the specified address does not specify a name
     *  - record with the name specified by the reverse record does not exist
     *  - record with the name specified by the reverse record is expired
     *
     * @example
     * ```
     * const name = await resolver.resolveAddressToName('mv1...');
     * console.log(name); // 'alice.mav'
     * ```
     *
     *  - Associated contract: [NameRegistry](https://docs.tezos.domains/deployed-contracts)
     */
    resolveAddressToName(address: string): Promise<string | null>;

    /**
     * Clears the cache. Only applies if caching is enabled.
     */
    clearCache(): void;
}
