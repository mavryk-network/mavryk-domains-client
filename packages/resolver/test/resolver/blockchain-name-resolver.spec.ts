import {
    DomainNameValidationResult, DomainNameValidator, RecordMetadata,

    StandardRecordMetadataKey, MavrykDomainsResolverDataProvider,


    MavrykDomainsValidator, Tracer
} from '@mavrykdynamics/mavryk-domains-core';
import { NameResolver } from '@mavrykdynamics/mavryk-domains-resolver';
import { anything, instance, mock, when } from 'ts-mockito';
import { BlockchainNameResolver } from '../../src/resolver/blockchain-name-resolver';


describe('BlockchainNameResolver', () => {
    let resolver: NameResolver;
    let dataProviderMock: MavrykDomainsResolverDataProvider;
    let tracerMock: Tracer;
    let validator: DomainNameValidator;

    beforeEach(() => {
        dataProviderMock = mock<MavrykDomainsResolverDataProvider>();
        tracerMock = mock<Tracer>();
        validator = new MavrykDomainsValidator();

        const domainData = new RecordMetadata();
        domainData.setJson(StandardRecordMetadataKey.TTL, 420);

        when(dataProviderMock.resolveDomainInfo('play.necroskillz.mav')).thenResolve({
            address: 'mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa',
            data: domainData,
            expiry: new Date(2021, 1, 1),
            name: 'play.necroskillz.mav',
        });

        when(dataProviderMock.resolveDomainInfo('no-address.mav')).thenResolve({
            address: null,
            data: new RecordMetadata(),
            expiry: new Date(2021, 1, 1),
            name: 'no-address.mav',
        });

        when(dataProviderMock.resolveDomainInfo('404.mav')).thenResolve(null);

        when(dataProviderMock.resolveReverseRecordDomainInfo('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa')).thenResolve({
            address: 'mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa',
            data: domainData,
            expiry: new Date(2021, 1, 1),
            name: 'play.necroskillz.mav',
        });

        when(dataProviderMock.resolveReverseRecordDomainInfo('mv1Q6r6jTAiFyM9sxirr12rqhLBnBqRJNuqY')).thenResolve(null);

        when(tracerMock.trace(anything(), anything()));

        resolver = new BlockchainNameResolver(instance(dataProviderMock), instance(tracerMock), validator);
    });

    describe('resolveDomainRecord()', () => {
        it('should return info about a domain', async () => {
            const domain = await resolver.resolveDomainRecord('play.necroskillz.mav');

            expect(domain?.name).toBe('play.necroskillz.mav');
            expect(domain?.address).toBe('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');
            expect(domain?.expiry).toStrictEqual(new Date(2021, 1, 1));
            expect(domain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });

        it('should not accept invalid domain name', async () => {
            jest.spyOn(validator, 'validateDomainName').mockReturnValue(DomainNameValidationResult.INVALID_NAME);
            await expect(() => resolver.resolveDomainRecord('play.necroskillz.mav')).rejects.toEqual(new Error(`'play.necroskillz.mav' is not a valid domain name.`));
        });
    });

    describe('resolveNameToAddress()', () => {
        it('should resolve name', async () => {
            const address = await resolver.resolveNameToAddress('play.necroskillz.mav');

            expect(address).toBe('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');
        });

        it('should return null if record has no address', async () => {
            const address = await resolver.resolveNameToAddress('no-address.mav');

            expect(address).toBe(null);
        });

        it('should return null if record does not exist', async () => {
            const address = await resolver.resolveNameToAddress('404.mav');

            expect(address).toBe(null);
        });

        it('should throw when name is null', async () => {
            await expect(() => resolver.resolveNameToAddress(null as any)).rejects.toEqual(new Error(`Argument 'name' was not specified.`));
        });
    });

    describe('resolveReverseRecord()', () => {
        it('should return info about a reverse record', async () => {
            const reverseRecord = await resolver.resolveReverseRecord('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');

            expect(reverseRecord?.name).toBe('play.necroskillz.mav');
            expect(reverseRecord?.address).toBe('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');
            expect(reverseRecord?.expiry).toStrictEqual(new Date(2021, 1, 1));
            expect(reverseRecord?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });
    });

    describe('resolveAddressToName()', () => {
        it('should resolve address', async () => {
            const name = await resolver.resolveAddressToName('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');

            expect(name).toBe('play.necroskillz.mav');
        });

        it('should return null if record does not exist', async () => {
            const name = await resolver.resolveAddressToName('mv1Q6r6jTAiFyM9sxirr12rqhLBnBqRJNuqY');

            expect(name).toBe(null);
        });

        it('should throw when address is null', async () => {
            await expect(() => resolver.resolveAddressToName(null as any)).rejects.toEqual(new Error(`Argument 'address' was not specified.`));
        });
    });

    describe('clearCache()', () => {
        it('should do nothing', () => {
            expect(() => resolver.clearCache()).not.toThrow();
        });
    });
});
