import { tokenizeDomainName, getTld, stripTld } from './domains';

export const SupportedTLDs = ['tez'];

export enum DomainNameValidationResult {
    INVALID_TLD = 'INVALID_TLD',
    VALID = 'VALID',
    UNSUPPORTED_CHARACTERS = 'UNSUPPORTED_CHARACTERS',
    INVALID_FIRST_CHARACTER = 'INVALID_FIRST_CHARACTER',
    INVALID_LAST_CHARACTER = 'INVALID_LAST_CHARACTER',
    TOO_LONG = 'TOO_LONG',
}

/** name is without tld */
export type DomainNameValidator = (name: string, tld: string) => DomainNameValidationResult;

export const AlphanumericWithHyphenDomainNameValidator: DomainNameValidator = (name: string) => {
    if (!name) {
        // tld itself
        return DomainNameValidationResult.VALID;
    }

    const regex = new RegExp(`^([a-z0-9-]+\\.?)+$`);

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

export const DomainNameValidators: { [tld: string]: DomainNameValidator } = {
    tez: AlphanumericWithHyphenDomainNameValidator,
};

export function validateDomainName(name: string): DomainNameValidationResult {
    const tld = getTld(name);
    const nameWithoutTld = stripTld(name);

    if (!SupportedTLDs.includes(tld)) {
        return DomainNameValidationResult.INVALID_TLD;
    }

    return DomainNameValidators[tld](nameWithoutTld, tld);
}
