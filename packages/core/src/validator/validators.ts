import { tokenizeDomainName } from '../utils/domains';

export enum DomainNameValidationResult {
    INVALID_TLD = 'INVALID_TLD',
    VALID = 'VALID',
    UNSUPPORTED_CHARACTERS = 'UNSUPPORTED_CHARACTERS',
    INVALID_NAME = 'INVALID_NAME',
    TOO_LONG = 'TOO_LONG',
    TOO_SHORT = 'TOO_SHORT',
}

/**
 * A function that validates a domain name. `name` is without tld.
 */
export type DomainNameValidatorFn = (name: string, tld: string) => DomainNameValidationResult;

export const LatinDomainNameValidator: DomainNameValidatorFn = (name: string) => {
    if (name.length < 1) {
        return DomainNameValidationResult.TOO_SHORT;
    }

    const regex = new RegExp(`^([a-z0-9-]+\\.?)*$`);

    if (!regex.test(name)) {
        return DomainNameValidationResult.UNSUPPORTED_CHARACTERS;
    }

    const parts = tokenizeDomainName(name);

    for (const part of parts) {
        if (part.length > 100) {
            return DomainNameValidationResult.TOO_LONG;
        }
    }

    return DomainNameValidationResult.VALID;
};
