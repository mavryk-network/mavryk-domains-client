import { TezosToolkit, BigMapAbstraction, TransactionWalletOperation, WalletTransferParams, WalletOperation } from '@taquito/taquito';
import { ConstantsResponse, OpKind } from '@taquito/rpc';
import { tzip16 } from '@taquito/tzip16';
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

    async call(params: WalletTransferParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Calling ${JSON.stringify(params)}.`);

        const operation = await this.tezos.wallet.transfer(params).send();

        this.tracer.trace('<= Operation sent.', operation.opHash);

        return operation;
    }

    async params(
        contractAddress: string,
        method: string,
        parameters: any[],
        transferParams?: { storageLimit?: number; amount?: number }
    ): Promise<WalletTransferParams> {
        this.tracer.trace(
            `=> Preparing call for entrypoint '${method}' at '${contractAddress}' with parameters '${JSON.stringify(parameters)}' and params '${JSON.stringify(transferParams)}.'`
        );

        const contract = await this.tezos.wallet.at(contractAddress);
        const params = contract.methods[method](...parameters).toTransferParams({ ...(transferParams || {}), mutez: true });

        this.tracer.trace('<= Prepared params.', params);

        return params;
    }

    async batch(transactionParams: WalletTransferParams[]): Promise<WalletOperation> {
        this.tracer.trace(`=> Sending batch with ${transactionParams.length} transactions.`, transactionParams);

        const batch = this.tezos.wallet.batch(transactionParams.map(p => ({ kind: OpKind.TRANSACTION, ...p })));
        const operation = await batch.send();

        this.tracer.trace('<= Batch sent.', operation.opHash);

        return operation;
    }

    async getPkh(): Promise<string> {
        return this.tezos.wallet.pkh();
    }

    async getConstants(): Promise<ConstantsResponse> {
        return this.cached('constants', () => this.tezos.rpc.getConstants());
    }

    async executeView(contractAddress: string, viewName: string, parameters: any[]): Promise<RpcResponseData> {
        this.tracer.trace(`=> Executing view '${viewName}' at '${contractAddress}' with parameters '${JSON.stringify(parameters)}'.'`);

        const view = await this.cached(`${contractAddress}:${viewName}`, async () => {
            const contract = await this.tezos.wallet.at(contractAddress, tzip16);
            const views = await contract.tzip16().metadataViews();
            return views[viewName]();
        });

        const result = await view.executeView(...parameters);

        this.tracer.trace('<= Received view result', result);

        return new RpcResponseData(result);
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
