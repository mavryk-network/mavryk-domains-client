import { tokenizeDomainName } from '../utils/domains';

export enum DomainNameValidationResult {
    INVALID_TLD = 'INVALID_TLD',
    VALID = 'VALID',
    UNSUPPORTED_CHARACTERS = 'UNSUPPORTED_CHARACTERS',
    INVALID_FIRST_CHARACTER = 'INVALID_FIRST_CHARACTER',
    INVALID_LAST_CHARACTER = 'INVALID_LAST_CHARACTER',
    TOO_LONG = 'TOO_LONG',
}

/**
 * A function that validates a domain name. `name` is without tld.
 */
export type DomainNameValidatorFn = (name: string, tld: string) => DomainNameValidationResult;

export const LatinDomainNameValidator: DomainNameValidatorFn = (name: string) => {
    const regex = new RegExp(`^([a-z0-9-]+\\.?)*$`);

    if (!regex.test(name)) {
        return DomainNameValidationResult.UNSUPPORTED_CHARACTERS;
    }

    const parts = tokenizeDomainName(name);

    for (const part of parts) {
        if (part.length > 100) {
            return DomainNameValidationResult.TOO_LONG;
        }

        if (!/^[a-z0-9]/.test(part)) {
            return DomainNameValidationResult.INVALID_FIRST_CHARACTER;
        }

        if (!/[a-z0-9]$/.test(part)) {
            return DomainNameValidationResult.INVALID_LAST_CHARACTER;
        }
    }

    return DomainNameValidationResult.VALID;
};
