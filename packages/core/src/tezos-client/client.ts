import { TezosToolkit, BigMapAbstraction } from '@taquito/taquito';
import NodeCache from 'node-cache';

import { RpcResponseData } from '../rpc-data/rpc-response-data';
import { RpcRequestScalarData } from '../rpc-data/rpc-request-data';
import { Tracer } from '../tracing/tracer';

export class TezosClient {
    private storageCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 0, useClones: false, maxKeys: 10 });

    constructor(private tezos: TezosToolkit, private tracer: Tracer) {}

    async storage<T>(contractAddress: string, fresh = false): Promise<T> {
        this.tracer.trace(`=> Getting storage from '${contractAddress}'.`);

        if (!this.storageCache.has(contractAddress) || fresh) {
            if (fresh) {
                this.tracer.trace('Forcing reload of storage.');
            } else {
                this.tracer.trace('Storage object not found in cache. Fetching.');
            }

            const contract = await this.tezos.contract.at(contractAddress);
            const promise = contract.storage<T>();

            this.storageCache.set(contractAddress, promise);
        } else {
            this.tracer.trace('Storage object found in cache.');
        }

        const storage = await this.storageCache.get<Promise<T>>(contractAddress)!;

        this.tracer.trace(`<= Received storage of '${contractAddress}'.`, storage);

        return storage;
    }

    async getBigMapValue<TStorage>(contractAddress: string, bigMapSelector: (storage: TStorage) => BigMapAbstraction, key: RpcRequestScalarData<string>): Promise<RpcResponseData> {
        this.tracer.trace(`=> Getting big map value from a big map of '${contractAddress}' selected by '${bigMapSelector.toString()}' with key '${key}'.`);

        const storage = await this.storage<TStorage>(contractAddress);
        const bigMap = bigMapSelector(storage);
        const value = await bigMap.get(key.encode()!);

        this.tracer.trace(`<= Received big map value.`, value);

        return new RpcResponseData(value);
    }
}
