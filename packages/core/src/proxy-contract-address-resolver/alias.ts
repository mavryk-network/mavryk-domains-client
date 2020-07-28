import { SmartContractType } from '../model';

export function smartContract(type: SmartContractType, ...params: string[]): string {
    let alias: string;

    switch (type) {
        case SmartContractType.TLDRegistrar: {
            const tld = params[0];

            if (!tld) {
                throw new Error(`Resolution of address for type ${type} requires 1 parameter.`);
            }

            alias = `${SmartContractType.TLDRegistrar}:${tld}`;
            break;
        }
        default:
            alias = type;
            break;
    }

    return alias;
}
