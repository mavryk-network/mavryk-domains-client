import { BuiltInProxyAddresses } from './built-in-proxy-addresses';
import { ContractConfig, TezosDomainsConfig } from '../model';

export class ProxyAddressConfig {
    private config: ContractConfig;

    constructor(config?: TezosDomainsConfig) {
        const network = config?.network || 'mainnet';
        if (network === 'custom') {
            if (!config?.contractAddresses) {
                throw new Error(`When network type is 'custom', it is required to specify 'contractAddresses'.`);
            }
        }

        if (config?.contractAddresses) {
            this.config = config.contractAddresses;
        } else {
            const addresses = BuiltInProxyAddresses[network];
            if (!addresses) {
                throw new Error(`Built in address configuration for network ${network} not found. Supported built-in networks are: 'mainnet', 'carthagenet'.`);
            }

            this.config = addresses;
        }
    }

    get(alias: string): string {
        const address = this.config[alias];

        if (!address) {
            throw new Error(`Address for contract ${alias} is not configured.`);
        }

        return address;
    }
}
