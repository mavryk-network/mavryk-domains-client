export interface TezosDomainsProxyContractAddressResolver {
    getAddress(proxyContractAddress: string): Promise<string>;
}