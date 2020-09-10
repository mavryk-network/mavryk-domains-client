import { validateDomainName, DomainNameValidationResult } from '@tezos-domains/core';

describe('validateDomainName', () => {
    it('should return INVALID_TLD if tld is not supported', () => {
        expect(validateDomainName('a.ble')).toBe(DomainNameValidationResult.INVALID_TLD);
    });

    describe('.tez', () => {
        it('should return INVALID_FIRST_CHARACTER or INVALID_LAST_CHARACTER if domain name starts or ends with -', () => {
            expect(validateDomainName('-aa.tez')).toBe(DomainNameValidationResult.INVALID_FIRST_CHARACTER);
            expect(validateDomainName('aa-.tez')).toBe(DomainNameValidationResult.INVALID_LAST_CHARACTER);
            expect(validateDomainName('aa.-bb.tez')).toBe(DomainNameValidationResult.INVALID_FIRST_CHARACTER);
        });

        it('should return INVALID_FIRST_CHARACTER if part of the domain is empty', () => {
            expect(validateDomainName('.tez')).toBe(DomainNameValidationResult.INVALID_FIRST_CHARACTER);
        });

        it('should return UNSUPPORTED_CHARACTERS if domain name contains invalid characters', () => {
            expect(validateDomainName('a..a.tez')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            expect(validateDomainName('a$a.tez')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            expect(validateDomainName('a_a.tez')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            expect(validateDomainName('$$.tez')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
        });

        it('should return INVALID_LENGTH label is too long', () => {
            expect(validateDomainName('loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.a.tez')).toBe(DomainNameValidationResult.TOO_LONG);
            expect(validateDomainName('looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.a.tez')).toBe(DomainNameValidationResult.VALID);
        });

        it('should return VALID if domain is valid', () => {
            expect(validateDomainName('tez')).toBe(DomainNameValidationResult.VALID);
            expect(validateDomainName('a-a.tez')).toBe(DomainNameValidationResult.VALID);
            expect(validateDomainName('aa.tez')).toBe(DomainNameValidationResult.VALID);
            expect(validateDomainName('aa.bb.tez')).toBe(DomainNameValidationResult.VALID);
        });
    });
});
