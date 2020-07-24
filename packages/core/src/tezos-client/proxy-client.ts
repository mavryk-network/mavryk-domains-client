import { BigMapAbstraction } from '@taquito/taquito';

import { TezosClient } from './client';
import { ProxyContractAddressResolver } from '../proxy-contract-address-resolver/resolver';
import { SmartContractType } from '../model';
import { Constructable } from '../utils/types';

export class TezosProxyClient {
    constructor(private tezos: TezosClient, private proxyAddressResolver: ProxyContractAddressResolver) {
    }

    async storage<T>(type: SmartContractType, smartContractTypeParam?: string, fresh = false): Promise<T> {
        const contractAddress = await this.proxyAddressResolver.resolve(type, smartContractTypeParam);

        return this.tezos.storage<T>(contractAddress, fresh);
    }

    async getBigMapValue<TStorage, TValue>(
        type: SmartContractType,
        smartContractTypeParam: string | null,
        bigMapSelector: (storage: TStorage) => BigMapAbstraction,
        key: string,
        resultType: Constructable<TValue>
    ): Promise<TValue | null> {
        const contractAddress = await this.proxyAddressResolver.resolve(type, smartContractTypeParam);

        return this.tezos.getBigMapValue<TStorage, TValue>(contractAddress, bigMapSelector, key, resultType);
    }
}
