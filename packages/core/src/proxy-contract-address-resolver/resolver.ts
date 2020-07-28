import { ProxyAddressConfig } from './proxy-address-config';
import { ProxyStorage } from '../model';
import { TezosClient } from '../tezos-client/client';

export class ProxyContractAddressResolver {
    constructor(private addresses: ProxyAddressConfig, private tezos: TezosClient) {}

    async resolve(alias: string): Promise<string> {
        const storage = await this.tezos.storage<ProxyStorage>(this.addresses.get(alias));
        return storage.contract;
    }
}
