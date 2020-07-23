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
} from '@tezos-domains/base';

export class TezosDomainsResolver {
    private tezos: TezosProxyClient;

    constructor(config?: TezosDomainsConfig) {
        const tezos = new TezosClient(config?.tezos || Tezos);
        const contractAddressResolver = new ProxyContractAddressResolver(getAddressesFromConfig(config), tezos);
        this.tezos = new TezosProxyClient(tezos, contractAddressResolver);
    }

    async resolve(name: string) {
        const [record, validity] = await Promise.all([this.getDomainRecord(name), this.getDomainValidityRecord(name)]);
        if (!record) {
            return null;
        }

        if (validity && validity.timestamp < new Date()) {
            // expired
            return null;
        }

        return record.address;
    }

    async reverseResolve(address: string) {
        const reverseRecord = await this.getReverseRecord(address);

        if (!reverseRecord) {
            return null;
        }

        const validity = await this.getDomainValidityRecord(reverseRecord.name);

        if (validity && validity.timestamp < new Date()) {
            // expired
            return null;
        }

        return reverseRecord.name;
    }

    private async getDomainRecord(name: string) {
        return this.tezos.getBigMapValue<NameRegistryStorage, DomainRecord>(SmartContractType.NameRegistry, null, s => s.records, name);
    }

    private async getDomainValidityRecord(name: string) {
        return this.tezos.getBigMapValue<NameRegistryStorage, RecordValidity>(SmartContractType.NameRegistry, null, s => s.validity_map, name);
    }

    private async getReverseRecord(address: string) {
        return this.tezos.getBigMapValue<NameRegistryStorage, ReverseRecord>(SmartContractType.NameRegistry, null, s => s.reverse_records, address);
    }
}
