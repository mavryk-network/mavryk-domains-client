import { TezosToolkit, BigMapAbstraction, TransactionWalletOperation } from '@taquito/taquito';
import { ConstantsResponse } from '@taquito/rpc';
import { Tracer, RpcResponseData, RpcRequestScalarData } from '@tezos-domains/core';
import NodeCache from 'node-cache';

export class TaquitoClient {
    private storageCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 0, useClones: false });

    constructor(private tezos: TezosToolkit, private tracer: Tracer) {}

    async storage<T>(contractAddress: string, fresh = false): Promise<T> {
        this.tracer.trace(`=> Getting storage from '${contractAddress}'.`);

        const storage = await this.cached(
            contractAddress,
            async () => {
                const contract = await this.tezos.wallet.at(contractAddress);
                return contract.storage<T>();
            },
            fresh
        );

        this.tracer.trace(`<= Received storage of '${contractAddress}'.`, storage);

        return storage;
    }

    async getBigMapValue<TStorage>(
        contractAddress: string,
        bigMapSelector: (storage: TStorage) => BigMapAbstraction,
        key: RpcRequestScalarData<string>
    ): Promise<RpcResponseData> {
        const encodedKey = key.encode()!;
        this.tracer.trace(
            `=> Getting big map value from a big map of '${contractAddress}' selected by '${bigMapSelector.toString()}' with key '${encodedKey}'.`
        );

        const storage = await this.storage<TStorage>(contractAddress);
        const bigMap = bigMapSelector(storage);
        if (!bigMap) {
            throw new Error(`Specified big map ${bigMapSelector.toString()} does not exist on contract with address ${contractAddress}.`);
        }
        const value = await bigMap.get(encodedKey);

        this.tracer.trace(`<= Received big map value.`, value);

        return new RpcResponseData(value);
    }

    async call(contractAddress: string, method: string, parameters: any[], amount?: number): Promise<TransactionWalletOperation> {
        this.tracer.trace(
            `=> Calling entrypoint '${method}' at '${contractAddress}' with parameters '${JSON.stringify(parameters)}' and amount '${
                amount ? amount.toString() : 'N/A'
            }.'`
        );

        const contract = await this.tezos.wallet.at(contractAddress);
        const operation = await contract.methods[method](...parameters).send({ amount, mutez: true });

        this.tracer.trace('<= Operation sent.', operation.opHash);

        return operation;
    }

    async getPkh(): Promise<string> {
        return this.tezos.wallet.pkh();
    }

    async getConstants(): Promise<ConstantsResponse> {
        return this.cached('constants', () => this.tezos.rpc.getConstants())
    }

    private async cached<T>(key: string, valueFactory: () => Promise<T>, fresh = false): Promise<T> {
        if (!this.storageCache.has(key) || fresh) {
            if (fresh) {
                this.tracer.trace('Forcing reload of value.');
            } else {
                this.tracer.trace('Object not found in cache. Fetching.');
            }

            const promise = valueFactory();

            promise.catch(() => this.storageCache.del(key));

            this.storageCache.set(key, promise);
        } else {
            this.tracer.trace('Object found in cache.');
        }

        return this.storageCache.get<Promise<T>>(key)!;
    }
}
