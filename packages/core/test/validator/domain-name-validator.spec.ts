import { DomainNameValidator, CustomNetworkConfig, DefaultNetworkConfig, DomainNameValidationResult, DomainNameValidatorFn } from '@tezos-domains/core';

describe('DomainNameValidator', () => {
    let validator: DomainNameValidator;

    function init(config?: CustomNetworkConfig | DefaultNetworkConfig) {
        validator = new DomainNameValidator(config);
    }

    describe('supportedTLDs', () => {
        it('should have supported tlds for network', () => {
            init();

            expect(validator.supportedTLDs).toEqual(['tez']);
        });

        it('should return INVALID_TLD if tld is not supported', () => {
            expect(validator.validateDomainName('a.ble')).toBe(DomainNameValidationResult.INVALID_TLD);
        });
    });

    describe('latin', () => {
        beforeEach(() => init());

        it('should return INVALID_FIRST_CHARACTER or INVALID_LAST_CHARACTER if domain name starts or ends with -', () => {
            expect(validator.validateDomainName('-aa.tez')).toBe(DomainNameValidationResult.INVALID_FIRST_CHARACTER);
            expect(validator.validateDomainName('aa-.tez')).toBe(DomainNameValidationResult.INVALID_LAST_CHARACTER);
            expect(validator.validateDomainName('aa.-bb.tez')).toBe(DomainNameValidationResult.INVALID_FIRST_CHARACTER);
        });

        it('should return INVALID_FIRST_CHARACTER if part of the domain is empty', () => {
            expect(validator.validateDomainName('.tez')).toBe(DomainNameValidationResult.INVALID_FIRST_CHARACTER);
        });

        it('should return UNSUPPORTED_CHARACTERS if domain name contains invalid characters', () => {
            expect(validator.validateDomainName('a..a.tez')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            expect(validator.validateDomainName('a$a.tez')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            expect(validator.validateDomainName('a_a.tez')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            expect(validator.validateDomainName('$$.tez')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
        });

        it('should return INVALID_LENGTH label is too long', () => {
            expect(
                validator.validateDomainName('loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.a.tez')
            ).toBe(DomainNameValidationResult.TOO_LONG);
            expect(
                validator.validateDomainName('looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.a.tez')
            ).toBe(DomainNameValidationResult.VALID);
        });

        it('should return VALID if domain is valid', () => {
            expect(validator.validateDomainName('tez')).toBe(DomainNameValidationResult.VALID);
            expect(validator.validateDomainName('a-a.tez')).toBe(DomainNameValidationResult.VALID);
            expect(validator.validateDomainName('aa.tez')).toBe(DomainNameValidationResult.VALID);
            expect(validator.validateDomainName('aa.bb.tez')).toBe(DomainNameValidationResult.VALID);
        });
    });

    describe('custom tlds', () => {
        const testValidatorFn: DomainNameValidatorFn = name =>
            name === 'custom' ? DomainNameValidationResult.VALID : DomainNameValidationResult.UNSUPPORTED_CHARACTERS;

        it('should override tlds for known network', () => {
            init({
                network: 'carthagenet',
                tlds: [{ name: 'test', validator: testValidatorFn }],
            });

            expect(validator.supportedTLDs).toEqual(['test']);
            expect(validator.validateDomainName('custom.test')).toBe(DomainNameValidationResult.VALID);
            expect(validator.validateDomainName('lol.test')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
        });

        it('should throw when no tlds are specified for custom network', () => {
            expect(() => init({ network: 'custom' } as any)).toThrowError();
        });

        it('should when unknown option network is specified', () => {
            expect(() => init({ network: 'blehnet' as any })).toThrowError();
        });

        describe('addSupportedTld', () => {
            it('should allow to add a tld', () => {
                init();

                expect(validator.validateDomainName('custom.test')).toBe(DomainNameValidationResult.INVALID_TLD);

                validator.addSupportedTld('test', testValidatorFn);

                expect(validator.validateDomainName('custom.test')).toBe(DomainNameValidationResult.VALID);
            });
        });

        describe('removeSupportedTld', () => {
            it('should allow to add a tld', () => {
                init({ tlds: [{ name: 'test', validator: testValidatorFn }] });

                expect(validator.validateDomainName('custom.test')).toBe(DomainNameValidationResult.VALID);

                validator.removeSupportedTld('test');

                expect(validator.validateDomainName('custom.test')).toBe(DomainNameValidationResult.INVALID_TLD);
            });
        });
    });
});
