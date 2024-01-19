import { DomainNameValidationResult, DomainNameValidator, UnsupportedDomainNameValidator } from '@mavrykdynamics/mavryk-domains-core';

describe('NullNameResolver', () => {
    let validator: DomainNameValidator;

    beforeEach(() => {
        validator = new UnsupportedDomainNameValidator();
    });

    describe('supportedTLDs', () => {
        it('should return empty array', () => {
            expect(validator.supportedTLDs).toEqual([]);
        });
    });

    describe('validateDomainName()', () => {
        it('should return invalid', () => {
            expect(validator.validateDomainName('necroskillz.mav')).toBe(DomainNameValidationResult.INVALID_NAME);
            expect(validator.validateDomainName('whatever')).toBe(DomainNameValidationResult.INVALID_NAME);
        });
    });

    describe('isValidWithKnownTld()', () => {
        it('should return invalid', () => {
            expect(validator.isValidWithKnownTld('necroskillz.mav')).toBe(DomainNameValidationResult.INVALID_TLD);
            expect(validator.isValidWithKnownTld('whatever')).toBe(DomainNameValidationResult.INVALID_TLD);
        });
    });

    describe('addSupportedTld()', () => {
        it('should throw error', () => {
            expect(() => validator.addSupportedTld('mav', () => DomainNameValidationResult.VALID)).toThrowError();
        });
    });

    describe('removeSupportedTld()', () => {
        it('should throw error', () => {
            expect(() => validator.removeSupportedTld('mav')).toThrowError();
        });
    });

    describe('isClaimableTld()', () => {
        it('should throw error', () => {
            expect(() => validator.isClaimableTld('mav')).toThrowError();
        });
    });
});
