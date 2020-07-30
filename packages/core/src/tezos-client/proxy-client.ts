import { BigMapAbstraction } from '@taquito/taquito';

import { TezosClient } from './client';
import { ProxyContractAddressResolver } from '../proxy-contract-address-resolver/resolver';
import { RpcResponseData } from '../rpc-data/rpc-response-data';
import { RpcRequestScalarData } from '../rpc-data/rpc-request-data';

export class TezosProxyClient {
    constructor(private tezos: TezosClient, private proxyAddressResolver: ProxyContractAddressResolver) {}

    async storage<T>(smartContract: string, fresh = false): Promise<T> {
        const contractAddress = await this.proxyAddressResolver.resolve(smartContract);

        return this.tezos.storage<T>(contractAddress, fresh);
    }

    async getBigMapValue<TStorage>(
        smartContract: string,
        bigMapSelector: (storage: TStorage) => BigMapAbstraction,
        key: RpcRequestScalarData<string>
    ): Promise<RpcResponseData> {
        const contractAddress = await this.proxyAddressResolver.resolve(smartContract);

        return this.tezos.getBigMapValue<TStorage>(contractAddress, bigMapSelector, key);
    }
}
