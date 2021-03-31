import { DomainNameValidator } from './domain-name-validator';
import { DomainNameValidationResult } from './validators';
import { NotSupportedError } from '../model';

export class UnsupportedDomainNameValidator implements DomainNameValidator {
    get supportedTLDs(): string[] {
        return [];
    }

    validateDomainName(): DomainNameValidationResult {
        return DomainNameValidationResult.INVALID_TLD;
    }

    addSupportedTld(): void {
        throw new NotSupportedError();
    }

    removeSupportedTld(): void {
        throw new NotSupportedError();
    }
}
