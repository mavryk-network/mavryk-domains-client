import { DomainNameValidationResult, DomainNameValidator, UnsupportedDomainNameValidator } from '@tezos-domains/core';

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
            expect(validator.validateDomainName('necroskillz.tez')).toBe(DomainNameValidationResult.INVALID_TLD);
            expect(validator.validateDomainName('whatever')).toBe(DomainNameValidationResult.INVALID_TLD);
        });
    });

    describe('addSupportedTld()', () => {
        it('should throw error', () => {
            expect(() => validator.addSupportedTld('tez', () => DomainNameValidationResult.VALID)).toThrowError();
        });
    });

    describe('removeSupportedTld()', () => {
        it('should throw error', () => {
            expect(() => validator.removeSupportedTld('tez')).toThrowError();
        });
    });

    describe('isClaimableTld()', () => {
        it('should throw error', () => {
            expect(() => validator.isClaimableTld('tez')).toThrowError();
        });
    });
});
