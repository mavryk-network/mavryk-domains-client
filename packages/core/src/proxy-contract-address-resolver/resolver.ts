import { ProxyAddressConfig } from './proxy-address-config';
import { ProxyStorage } from '../model';
import { TezosClient } from '../tezos-client/client';
import { Tracer } from '../tracing/tracer';

export class ProxyContractAddressResolver {
    constructor(private addresses: ProxyAddressConfig, private tezos: TezosClient, private tracer: Tracer) {}

    async resolve(alias: string): Promise<string> {
        this.tracer.trace(`=> Resolving address of underlying contract from '${alias}'.`);

        const storage = await this.tezos.storage<ProxyStorage>(this.addresses.get(alias));
        const contractAddress = storage.contract;

        this.tracer.trace(`<= Resolved address.`, contractAddress);

        return contractAddress;
    }
}
