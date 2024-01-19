import { MavrykDomainsConfig } from "@mavrykdynamics/mavryk-domains-core";

export type ConseilConfig = { server: string };
export type ConseilMavrykDomainsConfig = MavrykDomainsConfig & { conseil: ConseilConfig };

export interface NameRegistrySimpleStorage {
    recordMap: number;
    expiryMap: number;
    reverseRecordMap: number;
}
