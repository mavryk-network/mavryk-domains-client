import { Tracer, RpcRequestScalarData } from '@mavrykdynamics/mavryk-domains-core';
import { TezosMessageUtils, TezosNodeReader } from 'conseiljs';
import NodeCache from 'node-cache';

import { ConseilConfig } from '../model';

export class ConseilClient {
    private storageCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 0, useClones: false });

    constructor(private config: ConseilConfig, private tracer: Tracer) {}

    async storage(contractAddress: string, fresh = false): Promise<any> {
        this.tracer.trace(`=> Getting storage from '${contractAddress}'.`);

        if (!this.storageCache.has(contractAddress) || fresh) {
            if (fresh) {
                this.tracer.trace('Forcing reload of storage.');
            } else {
                this.tracer.trace('Storage object not found in cache. Fetching.');
            }

            const promise = TezosNodeReader.getContractStorage(this.config.server, contractAddress);

            this.storageCache.set(contractAddress, promise);
        } else {
            this.tracer.trace('Storage object found in cache.');
        }

        const storage = await this.storageCache.get<Promise<any>>(contractAddress)!;

        this.tracer.trace(`<= Received storage of '${contractAddress}'.`, storage);

        return storage;
    }

    async getBigMapValue(mapid: number, key: RpcRequestScalarData<string>, keyType: 'bytes' | 'address'): Promise<any> {
        const encodedKey = key.encode()!;
        this.tracer.trace(`=> Getting big map value from big map '${mapid}' with key '${encodedKey}' of type '${keyType}'.`);

        const mapKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(encodedKey, keyType), 'hex'));

        let value: any;
        try {
            value = await TezosNodeReader.getValueForBigMapKey(this.config.server, mapid, mapKey);
        } catch (err: any) {
            if (err.httpStatus === 404) {
                value = null;
            } else {
                throw err;
            }
        }

        this.tracer.trace(`<= Received big map value.`, value);

        return value;
    }
}
