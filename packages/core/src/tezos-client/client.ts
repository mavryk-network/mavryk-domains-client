import { TezosToolkit, BigMapAbstraction } from '@taquito/taquito';

import { RpcResponseData } from '../rpc-data/rpc-response-data';
import { RpcRequestData } from '../rpc-data/rpc-request-data';
import { BytesEncoder } from '../rpc-data/encoders/bytes-encoder';

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

    async getBigMapValue<TStorage>(contractAddress: string, bigMapSelector: (storage: TStorage) => BigMapAbstraction, key: string): Promise<RpcResponseData> {
        const storage = await this.storage<TStorage>(contractAddress);
        const bigMap = bigMapSelector(storage);
        const value = await bigMap.get(RpcRequestData.fromValue(key, BytesEncoder).encode()!);

        return new RpcResponseData(value);
    }
}
