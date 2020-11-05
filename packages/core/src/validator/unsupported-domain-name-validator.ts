import { DomainNameValidator } from './domain-name-validator';
import { DomainNameValidationResult } from './validators';

export class UnsupportedDomainNameValidator implements DomainNameValidator {
    get supportedTLDs(): string[] {
        return [];
    }

    validateDomainName(): DomainNameValidationResult {
        return DomainNameValidationResult.INVALID_TLD;
    }

    addSupportedTld(): void {
        throw new Error('Method not supported.');
    }

    removeSupportedTld(): void {
        throw new Error('Method not supported.');
    }
}
