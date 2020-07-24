import { TezosToolkit, BigMapAbstraction } from '@taquito/taquito';

import { Constructable } from '../utils/types';

export class TezosClient {
    private storageCache = new Map<string, unknown>();

    constructor(private tezos: TezosToolkit) {}

    async storage<T>(contractAddress: string, fresh = false): Promise<T> {
        if (!this.storageCache.has(contractAddress) || fresh) {
            const contract = await this.tezos.contract.at(contractAddress);
            const promise = contract.storage<T>();

            this.storageCache.set(contractAddress, promise);
        }

        return this.storageCache.get(contractAddress) as T;
    }

    async getBigMapValue<TStorage, TValue>(
        contractAddress: string,
        bigMapSelector: (storage: TStorage) => BigMapAbstraction,
        key: string,
        resultType: Constructable<TValue>
    ): Promise<TValue | null> {
        const storage = await this.storage<TStorage>(contractAddress);
        const bigMap = bigMapSelector(storage);
        const value = await bigMap.get(key);

        const result = new resultType();
        Object.assign(result, value);

        return result;
    }
}
