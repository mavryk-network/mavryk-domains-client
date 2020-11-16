import {
    TezosDomainsDataProvider,
    Tracer,
    DomainRecord,
    ReverseRecord,
    AddressBook,
    SmartContractType,
    RpcRequestData,
    BytesEncoder,
    DateEncoder,
    RecordMetadata,
    RpcResponseData,
} from '@tezos-domains/core';
import { JSONPath } from 'jsonpath-plus';

import { NameRegistrySimpleStorage } from './model';
import { ConseilClient } from './conseil/client';
import { dataToObj } from './utils';

export class ConseilTezosDomainsDataProvider implements TezosDomainsDataProvider {
    constructor(private conseil: ConseilClient, private addressBook: AddressBook, private tracer: Tracer) {}

    async getDomainRecord(name: string): Promise<DomainRecord | null> {
        this.tracer.trace(`=> Getting record '${name}'.`);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry);
        const storage = await this.getNameRegistryStorage(address);
        const mapResult = await this.conseil.getBigMapValue(storage.recordMap, RpcRequestData.fromValue(name, BytesEncoder), 'bytes');

        if (!mapResult) {
            this.tracer.trace(`<= Record not found.`);

            return null;
        }

        const record = {
            address: JSONPath({ path: '$.args[0].args[0].args[0].args[0].string', json: mapResult })[0],
            owner: JSONPath({ path: '$.args[1].args[0].args[1].string', json: mapResult })[0],
            expiry_key: new RpcResponseData(JSONPath({ path: '$.args[0].args[1].args[0].args[0].bytes', json: mapResult })[0]).scalar(BytesEncoder),
            data: new RecordMetadata(dataToObj(JSONPath({ path: '$.args[0].args[0].args[1]', json: mapResult })[0])),
        };

        this.tracer.trace(`<= Received record.`, record);

        return record;
    }

    async getReverseRecord(address: string): Promise<ReverseRecord | null> {
        this.tracer.trace(`=> Getting reverse record '${address}'`);

        const contractAddress = await this.addressBook.lookup(SmartContractType.NameRegistry);
        const storage = await this.getNameRegistryStorage(contractAddress);
        const mapResult = await this.conseil.getBigMapValue(storage.reverseRecordMap, RpcRequestData.fromValue(address), 'address');

        if (!mapResult) {
            this.tracer.trace(`<= Reverse record not found.`);

            return null;
        }

        const reverseRecord = {
            name: new RpcResponseData(JSONPath({ path: '$.args[1].args[0].args[0].bytes', json: mapResult })[0]).scalar(BytesEncoder),
            owner: JSONPath({ path: '$.args[1].args[1].string', json: mapResult })[0],
            data: new RecordMetadata(dataToObj(JSONPath({ path: '$.args[0].args[0]', json: mapResult })[0])),
        };

        this.tracer.trace(`<= Received reverse record.`, reverseRecord);

        return reverseRecord;
    }

    async getDomainExpiry(key: string): Promise<Date | null> {
        this.tracer.trace(`=> Getting expiry with key '${key}'`);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry);
        const storage = await this.getNameRegistryStorage(address);
        const mapResult = await this.conseil.getBigMapValue(storage.expiryMap, RpcRequestData.fromValue(key, BytesEncoder), 'bytes');

        const expiry = new RpcResponseData(mapResult?.string).scalar(DateEncoder);

        this.tracer.trace('<= Received expiry.', expiry);

        return expiry;
    }

    private async getNameRegistryStorage(address: string): Promise<NameRegistrySimpleStorage> {
        const storageResult = await this.conseil.storage(address);

        return {
            recordMap: Number(JSONPath({ path: '$.args[0].args[1].args[0].args[1].args[1].int', json: storageResult })[0]),
            expiryMap: Number(JSONPath({ path: '$.args[0].args[1].args[0].args[0].args[1].int', json: storageResult })[0]),
            reverseRecordMap: Number(JSONPath({ path: '$.args[0].args[1].args[1].args[0].int', json: storageResult })[0]),
        };
    }
}
