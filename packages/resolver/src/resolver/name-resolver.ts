import { DomainInfo, ReverseRecordInfo } from './model';

/**
 * An interface that defines functions for resolving names and addresses.
 */
export interface NameResolver {
    /**
     * Gets all information about a domain by it's name. If you only need to resolve the address, use [[`resolveAddress`]] instead.
     *
     *  - Associated contract: [NameRegistry](https://docs.tezos.domains/deployed-contracts)
     */
    resolve(name: string): Promise<DomainInfo | null>;
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
     * const address = await resolver.resolveAddress('alice.tez');
     * console.log(address); // 'tz1...'
     * ```
     *
     *  - Associated contract: [NameRegistry](https://docs.tezos.domains/deployed-contracts)
     */
    resolveAddress(name: string): Promise<string | null>;
    /**
     * Gets all information about a reverse record by it's address. If you only need to resolve the name, use [[`reverseResolveName`]] instead.
     *
     *  - Associated contract: [NameRegistry](https://docs.tezos.domains/deployed-contracts)
     */
    reverseResolve(address: string): Promise<ReverseRecordInfo | null>;
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
     * const name = await resolver.reverseResolveName('tz1...');
     * console.log(name); // 'alice.tez'
     * ```
     *
     *  - Associated contract: [NameRegistry](https://docs.tezos.domains/deployed-contracts)
     */
    reverseResolveName(address: string): Promise<string | null>;
    /**
     * Clears the cache. Only applies if caching is enabled.
     */
    clearCache(): void;
}
