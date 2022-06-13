import { NotSupportedError } from '../model';
import { DomainNameValidator } from './domain-name-validator';
import { DomainNameValidationResult } from './validators';

export class UnsupportedDomainNameValidator implements DomainNameValidator {
    get supportedTLDs(): string[] {
        return [];
    }

    validateDomainName(): DomainNameValidationResult {
        return DomainNameValidationResult.INVALID_NAME;
    }

    isValidWithKnownTld(): DomainNameValidationResult {
        return DomainNameValidationResult.INVALID_TLD;
    }

    isClaimableTld(): boolean {
        throw new Error('Method not implemented.');
    }

    addSupportedTld(): void {
        throw new NotSupportedError();
    }

    removeSupportedTld(): void {
        throw new NotSupportedError();
    }
}
