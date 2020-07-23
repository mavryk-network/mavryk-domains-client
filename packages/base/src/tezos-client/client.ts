import { TezosToolkit, BigMapAbstraction } from '@taquito/taquito';

import { toRpcData, fromRpcData } from '../utils/convert';

export class TezosClient {
    private storageCache = new Map<string, any>();

    constructor(private tezos: TezosToolkit) {}

    async storage<T>(contractAddress: string, fresh: boolean = false): Promise<T> {
        if (!this.storageCache.has(contractAddress) || fresh) {
            const contract = await this.tezos.contract.at(contractAddress);
            const promise = contract.storage<T>();

            this.storageCache.set(contractAddress, promise);
        }

        return this.storageCache.get(contractAddress)!;
    }

    async getBigMapValue<TStorage, TValue>(
        contractAddress: string,
        bigMapSelector: (storage: TStorage) => BigMapAbstraction,
        key: any
    ): Promise<TValue | null> {
        const storage = await this.storage<TStorage>(contractAddress);
        const bigMap = bigMapSelector(storage);
        const value = await bigMap.get(toRpcData(key));

        return fromRpcData(value) as TValue;
    }
}
