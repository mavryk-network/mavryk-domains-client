import {
    SmartContractType,
    NameRegistryStorage,
    DomainRecord,
    TezosProxyClient,
    ReverseRecord,
    smartContract,
    Tracer,
    DateEncoder,
    RpcRequestData,
    BytesEncoder,
} from '@tezos-domains/core';

export class Resolver {
    constructor(private tezos: TezosProxyClient, private tracer: Tracer) {
    }

    async resolve(name: string): Promise<string | null> {
        this.tracer.trace(`=> Resolving address for '${name}'`);

        if (!name) {
            throw new Error(`Argument 'name' was not specified.`);
        }

        const record = await this.getValidRecord(name);
        if (!record) {
            return null;
        }

        const address = record.address || null;

        this.tracer.trace(`<= Resolved address.`, address);

        return address;
    }

    async reverseResolve(address: string): Promise<string | null> {
        this.tracer.trace(`=> Resolving name for '${address}'`);

        if (!address) {
            throw new Error(`Argument 'address' was not specified.`);
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

        this.tracer.trace(`<= Resolved reverse record.`, reverseRecord.name);

        return reverseRecord.name;
    }

    private async getValidRecord(name: string) {
        const record = await this.getDomainRecord(name);

        if (!record) {
            this.tracer.trace('!! Record is null.');
            return null;
        }

        const validity = await this.getDomainValidity(record.validity_key);

        if (validity && validity < new Date()) {
            this.tracer.trace('!! Record is expired.');
            // expired
            return null;
        }

        this.tracer.trace('!! Record is valid.');

        return record;
    }

    private async getDomainRecord(name: string) {
        this.tracer.trace(`=> Getting record '${name}'.`);

        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(
            smartContract(SmartContractType.NameRegistry),
            s => s.records,
            RpcRequestData.fromValue(name, BytesEncoder)
        );

        const record = result.decode(DomainRecord);

        this.tracer.trace(`<= Received record.`, record);

        return record;
    }

    private async getDomainValidity(key: string) {
        this.tracer.trace(`=> Getting validity with key '${key}'`);

        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(
            smartContract(SmartContractType.NameRegistry),
            s => s.validity_map,
            RpcRequestData.fromValue(key, BytesEncoder)
        );

        const validity = result.scalar(DateEncoder);

        this.tracer.trace('<= Received validity.', validity);

        return validity;
    }

    private async getReverseRecord(address: string) {
        this.tracer.trace(`=> Getting reverse record '${address}'`);
        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(
            smartContract(SmartContractType.NameRegistry),
            s => s.reverse_records,
            RpcRequestData.fromValue(address)
        );

        const reverseRecord = result.decode(ReverseRecord);

        this.tracer.trace(`<= Received reverse record.`, reverseRecord);

        return reverseRecord;
    }
}
