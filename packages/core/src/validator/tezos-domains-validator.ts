import { TezosDomainsConfig, TLDConfig } from '../model';
import { BuiltInTLDs } from './built-in-tlds';
import { DomainNameValidatorFn, DomainNameValidationResult } from './validators';
import { getTld, stripTld } from '../utils/domains';
import { DomainNameValidator } from './domain-name-validator';

export class TezosDomainsValidator implements DomainNameValidator {
    private validators: Map<string, DomainNameValidatorFn> = new Map();
    private tlds: string[] = [];

    constructor(config?: TezosDomainsConfig) {
        const network = config?.network || 'mainnet';
        if (network === 'custom') {
            if (!config?.tlds) {
                throw new Error(`When network type is 'custom', it is required to specify 'tlds'.`);
            }
        }

        let tlds: TLDConfig[] | null;

        if (config?.tlds) {
            tlds = config.tlds;
        } else {
            tlds = BuiltInTLDs[network];
            if (!tlds) {
                throw new Error(
                    `Built in tlds configuration for network ${network} not found. Supported built-in networks are: 'mainnet', 'carthagenet', 'delphinet'.`
                );
            }
        }

        tlds.forEach(tld => this.addSupportedTld(tld.name, tld.validator));
    }

    get supportedTLDs(): string[] {
        return this.tlds;
    }


    validateDomainName(name: string): DomainNameValidationResult {
        if (this.tlds.includes(name)) {
            // tld itself
            return DomainNameValidationResult.VALID;
        }

        const tld = getTld(name);
        const nameWithoutTld = stripTld(name);

        if (!this.supportedTLDs.includes(tld)) {
            return DomainNameValidationResult.INVALID_TLD;
        }

        return this.validators.get(tld)!(nameWithoutTld, tld);
    }

    addSupportedTld(name: string, validator: DomainNameValidatorFn): void {
        this.tlds.push(name);
        this.validators.set(name, validator);
    }

    removeSupportedTld(name: string): void {
        this.tlds = this.tlds.filter(tld => name !== tld);
        this.validators.delete(name);
    }
}
