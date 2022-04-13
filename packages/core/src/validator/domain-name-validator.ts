import { DomainNameValidationResult, DomainNameValidatorFn } from './validators';

/**
 * An interface that defines functions for validating domain names.
 */
export interface DomainNameValidator {
    /**
     * Gets an array of supported top level domains.
     */
    supportedTLDs: string[];

    /**
     * Returns true if tld is supported by the OracleRegistrar
     */
    isClaimableTld(tld: string): boolean;

    /**
     * Validates whether the specified domain name is valid.
     */
    validateDomainName(name: string): DomainNameValidationResult;

    /**
     * Adds a supported tld. You don't need to call this in most cases.
     */
    addSupportedTld(tld: string, validator: DomainNameValidatorFn): void;

    /**
     * Removes a supported tld. You don't need to call this in most cases.
     */
    removeSupportedTld(tld: string): void;
}
