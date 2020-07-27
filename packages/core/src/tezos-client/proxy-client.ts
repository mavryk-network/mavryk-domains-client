import { BigMapAbstraction } from '@taquito/taquito';

import { TezosClient } from './client';
import { ProxyContractAddressResolver } from '../proxy-contract-address-resolver/resolver';
import { SmartContractType } from '../model';
import { RpcResponseData } from '../rpc-data/rpc-response-data';

export class TezosProxyClient {
    constructor(private tezos: TezosClient, private proxyAddressResolver: ProxyContractAddressResolver) {}

    async storage<T>(type: SmartContractType, smartContractTypeParam?: string, fresh = false): Promise<T> {
        const contractAddress = await this.proxyAddressResolver.resolve(type, smartContractTypeParam!);

        return this.tezos.storage<T>(contractAddress, fresh);
    }

    async getBigMapValue<TStorage>(
        type: SmartContractType,
        smartContractTypeParam: string | null,
        bigMapSelector: (storage: TStorage) => BigMapAbstraction,
        key: string
    ): Promise<RpcResponseData> {
        const contractAddress = await this.proxyAddressResolver.resolve(type, smartContractTypeParam!);

        return this.tezos.getBigMapValue<TStorage>(contractAddress, bigMapSelector, key);
    }
}
