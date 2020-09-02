import { DomainRecord, ReverseRecord } from '@tezos-domains/core';

export interface NameResolver {
    resolve(name: string): Promise<DomainRecord | null>;
    resolveAddress(name: string): Promise<string | null>;
    reverseResolve(address: string): Promise<ReverseRecord | null>;
    reverseResolveName(address: string): Promise<string | null>;
    clearCache(): void;
}
