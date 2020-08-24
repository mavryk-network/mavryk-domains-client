import { BuiltInAddresses } from './built-in-addresses';
import { ContractConfig, TezosDomainsConfig, SmartContractType } from '../model';

export class AddressBook {
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
            const addresses = BuiltInAddresses[network];
            if (!addresses) {
                throw new Error(`Built in address configuration for network ${network} not found. Supported built-in networks are: 'mainnet', 'carthagenet'.`);
            }

            this.config = addresses;
        }
    }

    async lookup(type: SmartContractType, ...params: string[]): Promise<string> {
        const alias = this.buildAlias(type, params, type === SmartContractType.TLDRegistrar ? 1 : 0);
        const address = this.config[alias];

        if (!address) {
            throw new Error(`Address for contract ${alias} is not configured.`);
        }

        return Promise.resolve(address);
    }

    private buildAlias(type: SmartContractType, params: string[], minParams: number) {
        const specifiedParameters = params.filter(p => !!p);
        if (specifiedParameters.length < minParams) {
            throw new Error(`Lookup of address for type ${type} requires at least ${minParams} parameter(s).`);
        }
    
        return [type as string].concat(specifiedParameters).join(':');
    }
}
