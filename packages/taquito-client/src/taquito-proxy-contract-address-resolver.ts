import { TezosDomainsProxyContractAddressResolver } from '@tezos-domains/core';
import { ProxyStorage, TaquitoClient } from '@tezos-domains/taquito';

export class TaquitoTezosDomainsProxyContractAddressResolver implements TezosDomainsProxyContractAddressResolver {
    constructor(private tezos: TaquitoClient) {}

    async getAddress(proxyContractAddress: string): Promise<string> {
        const storage = await this.tezos.storage<ProxyStorage>(proxyContractAddress);

        if (!storage || !storage.contract) {
            throw new Error(
                `Cannot resolve address from proxy contract ${proxyContractAddress}, because it doesn't exist or doesn't have 'contract' field in the storage.`
            );
        }

        return storage.contract;
    }
}
