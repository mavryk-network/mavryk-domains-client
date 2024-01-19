import { CustomNetworkConfig, DefaultNetworkConfig, DomainNameValidationResult, DomainNameValidatorFn, MavrykDomainsValidator } from '@mavrykdynamics/mavryk-domains-core';

describe('MavrykDomainsValidator', () => {
    let validator: MavrykDomainsValidator;

    function init(config?: CustomNetworkConfig | DefaultNetworkConfig) {
        validator = new MavrykDomainsValidator(config);
    }

    describe('isClaimableTld()', () => {
        it('should return true if claimableTld', () => {
            init();
            validator.addClaimableTld('xyz', () => DomainNameValidationResult.VALID);
            expect(validator.isClaimableTld('xyz')).toBe(true);
        });

        it('should return false if not claimableTld', () => {
            init();
            expect(validator.isClaimableTld('xyz')).toBe(false);
        });
    });

    describe('supportedTLDs', () => {
        it('should have supported tlds for network', () => {
            init();

            expect(validator.supportedTLDs).toEqual(['mav']);
        });

        it('should have supported claimable tlds for network', () => {
            init({
                claimableTlds: [
                    { name: 'com', validator: () => DomainNameValidationResult.VALID },
                    { name: 'dev', validator: () => DomainNameValidationResult.VALID },
                ],
            });

            expect(validator.supportedTLDs).toEqual(['mav', 'com', 'dev']);
        });
    });

    describe('isValidWithKnownTld()', () => {
        it('should return INVALID_TLD if tld is not supported', () => {
            expect(validator.isValidWithKnownTld('a.ble')).toBe(DomainNameValidationResult.INVALID_TLD);
        });

        it('should return VALID if tld is supported', () => {
            expect(validator.isValidWithKnownTld('mav')).toBe(DomainNameValidationResult.VALID);
        });

        describe('latin', () => {
            beforeEach(() => init());

            it('should return UNSUPPORTED_CHARACTERS if domain name contains invalid characters', () => {
                expect(validator.isValidWithKnownTld('a..a.mav')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
                expect(validator.isValidWithKnownTld('a$a.mav')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
                expect(validator.isValidWithKnownTld('a_a.mav')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
                expect(validator.isValidWithKnownTld('$$.mav')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
                expect(
                    validator.isValidWithKnownTld('abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij1234567890abcdefghij123456789!.mav')
                ).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            });

            it('should return INVALID_LENGTH label is too long', () => {
                expect(
                    validator.isValidWithKnownTld('loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.a.mav')
                ).toBe(DomainNameValidationResult.TOO_LONG);
                expect(
                    validator.isValidWithKnownTld('looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.a.mav')
                ).toBe(DomainNameValidationResult.VALID);
            });

            it('should return VALID if domain is valid', () => {
                expect(validator.isValidWithKnownTld('a-a.mav')).toBe(DomainNameValidationResult.VALID);
                expect(validator.isValidWithKnownTld('aa.mav')).toBe(DomainNameValidationResult.VALID);
                expect(validator.isValidWithKnownTld('aa.bb.mav')).toBe(DomainNameValidationResult.VALID);
            });
        });
        describe('custom tlds', () => {
            const testValidatorFn: DomainNameValidatorFn = name =>
                name === 'custom' ? DomainNameValidationResult.VALID : DomainNameValidationResult.UNSUPPORTED_CHARACTERS;

            it('should override tlds for known network in isValidWithKnownTld()', () => {
                init({
                    network: 'ghostnet',
                    tlds: [{ name: 'test', validator: testValidatorFn }],
                });

                expect(validator.supportedTLDs).toEqual(['test']);
                expect(validator.isValidWithKnownTld('custom.test')).toBe(DomainNameValidationResult.VALID);
                expect(validator.isValidWithKnownTld('lol.test')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
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

                    expect(validator.isValidWithKnownTld('custom.test')).toBe(DomainNameValidationResult.INVALID_TLD);

                    validator.addSupportedTld('test', testValidatorFn);

                    expect(validator.isValidWithKnownTld('custom.test')).toBe(DomainNameValidationResult.VALID);
                });
            });

            describe('removeSupportedTld', () => {
                it('should allow to remove a tld', () => {
                    init({ tlds: [{ name: 'test', validator: testValidatorFn }] });

                    expect(validator.isValidWithKnownTld('custom.test')).toBe(DomainNameValidationResult.VALID);

                    validator.removeSupportedTld('test');

                    expect(validator.isValidWithKnownTld('custom.test')).toBe(DomainNameValidationResult.INVALID_TLD);
                });
            });

            describe('addSupportedClaimableTld', () => {
                it('should allow to add a claimable tld', () => {
                    init();

                    expect(validator.isValidWithKnownTld('custom.com')).toBe(DomainNameValidationResult.INVALID_TLD);

                    validator.addClaimableTld('com', testValidatorFn);

                    expect(validator.isValidWithKnownTld('custom.com')).toBe(DomainNameValidationResult.VALID);
                });
            });

            describe('removeSupportedClaimableTld', () => {
                it('should allow to remove a claimable tld', () => {
                    init({ claimableTlds: [{ name: 'com', validator: testValidatorFn }] });

                    expect(validator.isValidWithKnownTld('custom.com')).toBe(DomainNameValidationResult.VALID);

                    validator.removeClaimableTld('com');

                    expect(validator.isValidWithKnownTld('custom.com')).toBe(DomainNameValidationResult.INVALID_TLD);
                });
            });
        });
    });

    describe('validateDomainName()', () => {
        it('should return INVALID_NAME if domain name starts or ends with -', () => {
            init();

            expect(validator.validateDomainName('-aa.mav')).toBe(DomainNameValidationResult.INVALID_NAME);
            expect(validator.validateDomainName('aa-.mav')).toBe(DomainNameValidationResult.INVALID_NAME);
            expect(validator.validateDomainName('aa.-bb.mav')).toBe(DomainNameValidationResult.INVALID_NAME);
        });
        it('should return UNSUPPORTED_CHARACTERS if domain contains spaces or empty parts', () => {
            init();
            expect(validator.validateDomainName('aa..mav')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            expect(validator.validateDomainName('aa.mav ')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            expect(validator.validateDomainName('aa. .mav')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            expect(validator.validateDomainName(' aa.mav')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            expect(validator.validateDomainName(' mav')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
            expect(validator.validateDomainName('mav ')).toBe(DomainNameValidationResult.UNSUPPORTED_CHARACTERS);
        });

        it('should return INVALID_NAME if starts with .', () => {
            init();

            expect(validator.validateDomainName('.mav')).toBe(DomainNameValidationResult.TOO_SHORT);
        });

        it('should return VALID if only the TLD is supplied', () => {
            init();

            expect(validator.validateDomainName('mav')).toBe(DomainNameValidationResult.VALID);
        });

        it('should return INVALID_NAME if name bellow min level', () => {
            init();

            expect(validator.validateDomainName('mav', { minLevel: 2 })).toBe(DomainNameValidationResult.INVALID_NAME);
            expect(validator.validateDomainName('mav', { minLevel: 1 })).toBe(DomainNameValidationResult.VALID);
        });

        describe('length', () => {
            beforeEach(() => init());

            it('should return INVALID_LENGTH label is too long', () => {
                expect(
                    validator.validateDomainName('loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.a.mav')
                ).toBe(DomainNameValidationResult.TOO_LONG);
                expect(
                    validator.validateDomainName('looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong.a.mav')
                ).toBe(DomainNameValidationResult.VALID);
            });

            it('should return VALID if domain is valid', () => {
                expect(validator.validateDomainName('a-a.mav')).toBe(DomainNameValidationResult.VALID);
                expect(validator.validateDomainName('aa.mav')).toBe(DomainNameValidationResult.VALID);
                expect(validator.validateDomainName('aa.bb.mav')).toBe(DomainNameValidationResult.VALID);
            });
        });
    });
});
