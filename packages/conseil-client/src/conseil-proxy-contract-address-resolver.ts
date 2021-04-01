import { TezosDomainsProxyContractAddressResolver } from '@tezos-domains/core';
import { JSONPath } from 'jsonpath-plus';

import { ConseilClient } from './conseil/client';

export class ConseilTezosDomainsProxyContractAddressResolver implements TezosDomainsProxyContractAddressResolver {
    constructor(private conseil: ConseilClient) {}

    async getAddress(proxyContractAddress: string): Promise<string> {
        const storage = await this.conseil.storage(proxyContractAddress);

        if (!storage) {
            throw new Error(`Cannot resolve address from proxy contract ${proxyContractAddress}, because it doesn't exist.`);
        }

        // TODO: remove edo fallback
        const address = JSONPath({ path: '$.args[0].args[0].string', json: storage })[0] || JSONPath({ path: '$.args[0].string', json: storage })[0];

        if (!address) {
            throw new Error(
                `Cannot resolve address from proxy contract ${proxyContractAddress}, because it doesn't provide an address in the storage response.`
            );
        }

        return address;
    }
}
