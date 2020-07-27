import { Tezos } from '@taquito/taquito';
import {
    ProxyContractAddressResolver,
    TezosDomainsConfig,
    SmartContractType,
    NameRegistryStorage,
    DomainRecord,
    TezosClient,
    TezosProxyClient,
    getAddressesFromConfig,
    RecordValidity,
    ReverseRecord,
} from '@tezos-domains/core';

export class TezosDomainsResolver {
    private tezos: TezosProxyClient;

    constructor(config?: TezosDomainsConfig) {
        const tezos = new TezosClient(config?.tezos || Tezos);
        const contractAddressResolver = new ProxyContractAddressResolver(getAddressesFromConfig(config), tezos);
        this.tezos = new TezosProxyClient(tezos, contractAddressResolver);
    }

    async resolve(name: string): Promise<string | null> {
        const record = await this.getValidRecord(name);
        if (!record) {
            return null;
        }

        return record.address;
    }

    async reverseResolve(address: string): Promise<string | null> {
        const reverseRecord = await this.getReverseRecord(address);

        if (!reverseRecord || !reverseRecord.name) {
            return null;
        }

        const record = await this.getValidRecord(reverseRecord.name);
        if (!record) {
            return null;
        }

        return reverseRecord.name;
    }

    private async getValidRecord(name: string) {
        const record = await this.getDomainRecord(name);

        if (!record) {
            return null;
        }

        const validity = await this.getDomainValidityRecord(record.validity_key);

        if (validity && validity.timestamp < new Date()) {
            // expired
            return null; 
        }

        return record;
    }

    private async getDomainRecord(name: string) {
        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(SmartContractType.NameRegistry, null, s => s.records, name);

        return result.decode(DomainRecord);
    }

    private async getDomainValidityRecord(key: string) {
        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(SmartContractType.NameRegistry, null, s => s.validity_map, key);

        return result.decode(RecordValidity);
    }

    private async getReverseRecord(address: string) {
        const result = await this.tezos.getBigMapValue<NameRegistryStorage>(SmartContractType.NameRegistry, null, s => s.reverse_records, address);

        return result.decode(ReverseRecord);
    }
}
