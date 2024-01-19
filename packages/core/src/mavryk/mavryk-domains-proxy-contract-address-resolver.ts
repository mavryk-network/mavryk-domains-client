export interface MavrykDomainsProxyContractAddressResolver {
    getAddress(proxyContractAddress: string): Promise<string>;
}