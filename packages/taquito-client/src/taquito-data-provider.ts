import {
    AddressBook,
    BytesEncoder,
    DateEncoder,
    DomainRecord,
    ReverseRecord,
    RpcRequestData,
    SmartContractType,
    TezosDomainsDataProvider,
    Tracer
} from '@tezos-domains/core';
import { NameRegistryStorage, TaquitoClient } from '@tezos-domains/taquito';
import { TaquitoDomainRecord, TaquitoReverseRecord } from './model';

export class TaquitoTezosDomainsDataProvider implements TezosDomainsDataProvider {
    constructor(private tezos: TaquitoClient, private addressBook: AddressBook, private tracer: Tracer) {}

    async getDomainRecord(name: string): Promise<DomainRecord | null> {
        this.tracer.trace(`=> Getting record '${name}'.`);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry);
        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(address, s => s.store.records, RpcRequestData.fromValue(name, BytesEncoder));

        const record = result.decode(TaquitoDomainRecord);

        this.tracer.trace(`<= Received record.`, record);

        return record;
    }

    async getReverseRecord(address: string): Promise<ReverseRecord | null> {
        this.tracer.trace(`=> Getting reverse record '${address}'`);

        const contractAddress = await this.addressBook.lookup(SmartContractType.NameRegistry);
        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(contractAddress, s => s.store.reverse_records, RpcRequestData.fromValue(address));

        const reverseRecord = result.decode(TaquitoReverseRecord);

        this.tracer.trace(`<= Received reverse record.`, reverseRecord);

        return reverseRecord;
    }

    async getDomainExpiry(key: string): Promise<Date | null> {
        this.tracer.trace(`=> Getting expiry with key '${key}'`);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry);
        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(address, s => s.store.expiry_map, RpcRequestData.fromValue(key, BytesEncoder));

        const expiry = result.scalar(DateEncoder);

        this.tracer.trace('<= Received expiry.', expiry);

        return expiry;
    }
}
