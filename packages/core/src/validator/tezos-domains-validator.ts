import { TezosDomainsConfig, TLDConfig } from '../model';
import { BuiltInTLDs } from './built-in-tlds';
import { DomainNameValidatorFn, DomainNameValidationResult } from './validators';
import { getTld, stripTld } from '../utils/domains';
import { DomainNameValidator } from './domain-name-validator';
import { normalizeDomainName } from '../utils/convert';

export class TezosDomainsValidator implements DomainNameValidator {
    private validators: Map<string, DomainNameValidatorFn> = new Map();
    private tlds: string[] = [];

    constructor(config?: TezosDomainsConfig) {
        const network = config?.network || 'mainnet';
        if (network === 'custom' && !config?.tlds) {
            throw new Error(`When network type is 'custom', it is required to specify 'tlds'.`);
        }

        let tlds: TLDConfig[] | null;

        if (config?.tlds) {
            tlds = config.tlds;
        } else {
            tlds = BuiltInTLDs[network];
            if (!tlds) {
                throw new Error(
                    `Built in tlds configuration for network ${network} not found. Supported built-in networks are: ${Object.keys(BuiltInTLDs)
                        .filter(n => n !== 'custom')
                        // eslint-disable-next-line sonarjs/no-nested-template-literals
                        .map(n => `'${n}'`)
                        .join(', ')}.`
                );
            }
        }

        tlds.forEach(tld => this.addSupportedTld(tld.name, tld.validator));
    }

    get supportedTLDs(): string[] {
        return this.tlds;
    }

    validateDomainName(name: string): DomainNameValidationResult {
        try {
            name = normalizeDomainName(name);
        } catch (err) {
            return DomainNameValidationResult.INVALID_NAME;
        }

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

    addSupportedTld(tld: string, validator: DomainNameValidatorFn): void {
        this.tlds.push(tld);
        this.validators.set(tld, validator);
    }

    removeSupportedTld(tld: string): void {
        this.tlds = this.tlds.filter(tld => tld !== tld);
        this.validators.delete(tld);
    }
}
