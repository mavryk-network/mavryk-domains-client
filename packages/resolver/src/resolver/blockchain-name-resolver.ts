import { validateAddress, ValidationResult } from '@taquito/utils';
import {
    SmartContractType,
    NameRegistryStorage,
    DomainRecord,
    ReverseRecord,
    Tracer,
    DateEncoder,
    RpcRequestData,
    BytesEncoder,
    validateDomainName,
    DomainNameValidationResult,
    TezosClient,
    AddressBook,
} from '@tezos-domains/core';
import { NameResolver } from './name-resolver';

export class BlockchainNameResolver implements NameResolver {
    constructor(private tezos: TezosClient, private addressBook: AddressBook, private tracer: Tracer) {}

    async resolve(name: string): Promise<DomainRecord | null> {
        this.tracer.trace(`=> Resolving record '${name}'`);

        if (!name) {
            throw new Error(`Argument 'name' was not specified.`);
        }

        if (validateDomainName(name) !== DomainNameValidationResult.VALID) {
            throw new Error(`'${name}' is not a valid domain name.`);
        }

        const record = await this.getValidRecord(name);

        this.tracer.trace(`<= Resolved record.`, record);

        return record;
    }

    async resolveAddress(name: string): Promise<string | null> {
        this.tracer.trace(`=> Resolving address for '${name}'`);

        const record = await this.resolve(name);

        const address = record?.address || null;

        this.tracer.trace(`<= Resolved address.`, address);

        return address;
    }

    async reverseResolve(address: string): Promise<ReverseRecord | null> {
        this.tracer.trace(`=> Resolving reverse record for '${address}'`);

        if (!address) {
            throw new Error(`Argument 'address' was not specified.`);
        }

        if (validateAddress(address) !== ValidationResult.VALID) {
            throw new Error(`'${address}' is not a valid address.`);
        }

        const reverseRecord = await this.getReverseRecord(address);

        if (!reverseRecord || !reverseRecord.name) {
            this.tracer.trace(`!! Reverse record is empty.`);

            return null;
        }

        const record = await this.getValidRecord(reverseRecord.name);
        if (!record) {
            return null;
        }

        this.tracer.trace(`<= Resolved reverse record.`, reverseRecord);

        return reverseRecord;
    }

    async reverseResolveName(address: string): Promise<string | null> {
        this.tracer.trace(`=> Resolving name for '${address}'`);

        const reverseRecord = await this.reverseResolve(address);

        if (!reverseRecord) {
            return null;
        }

        this.tracer.trace(`<= Resolved name.`, reverseRecord.name);

        return reverseRecord.name!;
    }

    private async getValidRecord(name: string) {
        const record = await this.getDomainRecord(name);

        if (!record) {
            this.tracer.trace('!! Record is null.');
            return null;
        }

        const expiry = await this.getDomainExpiry(record.expiry_key);

        if (expiry && expiry < new Date()) {
            this.tracer.trace('!! Record is expired.');
            // expired
            return null;
        }

        this.tracer.trace('!! Record is valid.');

        return record;
    }

    clearCache(): void {
        return void 0;
    }

    private async getDomainRecord(name: string) {
        this.tracer.trace(`=> Getting record '${name}'.`);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry);
        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(address, s => s.store.records, RpcRequestData.fromValue(name, BytesEncoder));

        const record = result.decode(DomainRecord);

        this.tracer.trace(`<= Received record.`, record);

        return record;
    }

    private async getDomainExpiry(key: string | null) {
        this.tracer.trace(`=> Getting expiry with key '${key || 'null'}'`);

        if (!key) {
            this.tracer.trace(`!! Validity key is null, record never expires.`);
            return null;
        }

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry);
        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(address, s => s.store.expiry_map, RpcRequestData.fromValue(key, BytesEncoder));

        const expiry = result.scalar(DateEncoder);

        this.tracer.trace('<= Received expiry.', expiry);

        return expiry;
    }

    private async getReverseRecord(address: string) {
        this.tracer.trace(`=> Getting reverse record '${address}'`);

        const contractAddress = await this.addressBook.lookup(SmartContractType.NameRegistry);
        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(contractAddress, s => s.store.reverse_records, RpcRequestData.fromValue(address));

        const reverseRecord = result.decode(ReverseRecord);

        this.tracer.trace(`<= Received reverse record.`, reverseRecord);

        return reverseRecord;
    }
}
