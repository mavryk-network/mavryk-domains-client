import { TezosDomainsConfig } from "@tezos-domains/core";

export type ConseilConfig = { server: string };
export type ConseilTezosDomainsConfig = TezosDomainsConfig & { conseil: ConseilConfig };

export interface NameRegistrySimpleStorage {
    recordMap: number;
    expiryMap: number;
    reverseRecordMap: number;
}
