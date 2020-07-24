import { BuiltInProxyAddresses } from './built-in-proxy-addresses';
import { ContractConfig, SmartContractType, ProxyStorage, TezosDomainsConfig } from '../model';
import { TezosClient } from '../tezos-client/client';

export function getAddressesFromConfig(config?: TezosDomainsConfig): ContractConfig {
    const network = config?.network || 'mainnet';
    if (network === 'custom') {
        if (!config?.contractAddresses) {
            throw new Error(`When network type is 'custom', it is required to specify 'contractAddresses'.`);
        }
    }

    if (config?.contractAddresses) {
        return config.contractAddresses;
    } else {
        const addresses = BuiltInProxyAddresses[network];
        if (!addresses) {
            throw new Error(`Built in address configuration for network ${network} not found. Supported built-in networks are: 'mainnet', 'carthagenet'.`);
        }

        return addresses;
    }
}

export class ProxyContractAddressResolver {
    constructor(private addresses: ContractConfig, private tezos: TezosClient) {}

    async resolve(type: SmartContractType, ...params: string[]): Promise<string> {
        const storage = await this.tezos.storage<ProxyStorage>(this.getAddressFromConfig(type, ...params));
        return storage.contract;
    }

    private getAddressFromConfig(type: SmartContractType, ...params: string[]) {
        let alias: string;

        switch (type) {
            case SmartContractType.TLDRegistrar: {
                const tld = params[0];

                if (!tld) {
                    throw new Error(`Lookup of address for type ${type} requires 1 parameter`);
                }

                alias = `${SmartContractType.TLDRegistrar}:${tld}`;
                break;
            }
            default:
                alias = type;
                break;
        }

        return this.addresses[alias];
    }
}
