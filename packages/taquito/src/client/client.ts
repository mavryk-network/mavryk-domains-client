import { TezosToolkit, BigMapAbstraction, TransactionWalletOperation } from '@taquito/taquito';
import { Tracer, RpcResponseData, RpcRequestScalarData } from '@tezos-domains/core';
import NodeCache from 'node-cache';

export class TaquitoClient {
    private storageCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 0, useClones: false });

    constructor(private tezos: TezosToolkit, private tracer: Tracer) {}

    async storage<T>(contractAddress: string, fresh = false): Promise<T> {
        this.tracer.trace(`=> Getting storage from '${contractAddress}'.`);

        if (!this.storageCache.has(contractAddress) || fresh) {
            if (fresh) {
                this.tracer.trace('Forcing reload of storage.');
            } else {
                this.tracer.trace('Storage object not found in cache. Fetching.');
            }

            const contract = await this.tezos.wallet.at(contractAddress);
            const promise = contract.storage<T>();

            this.storageCache.set(contractAddress, promise);
        } else {
            this.tracer.trace('Storage object found in cache.');
        }

        const storage = await this.storageCache.get<Promise<T>>(contractAddress)!;

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
}
