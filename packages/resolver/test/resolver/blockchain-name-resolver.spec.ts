import { Tracer, TezosDomainsDataProvider, RecordMetadata } from '@tezos-domains/core';
import { NameResolver } from '@tezos-domains/resolver';
import { mock, when, anything, instance } from 'ts-mockito';
import { StandardRecordMetadataKey, DomainNameValidator, TezosDomainsValidator } from '@tezos-domains/core';
import MockDate from 'mockdate';

import { BlockchainNameResolver } from '../../src/resolver/blockchain-name-resolver';

describe('BlockchainNameResolver', () => {
    let resolver: NameResolver;
    let dataProviderMock: TezosDomainsDataProvider;
    let tracerMock: Tracer;
    let validator: DomainNameValidator;

    beforeEach(() => {
        dataProviderMock = mock<TezosDomainsDataProvider>();
        tracerMock = mock<Tracer>();
        validator = new TezosDomainsValidator();

        const domainData = new RecordMetadata();
        domainData.setJson(StandardRecordMetadataKey.TTL, 420);

        when(dataProviderMock.getDomainRecord('play.necroskillz.tez')).thenResolve({
            address: 'tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i',
            expiry_key: 'necroskillz.tez',
            owner: 'tz1OWN',
            data: domainData,
        });

        when(dataProviderMock.getDomainRecord('expired.tez')).thenResolve({
            expiry_key: 'expired.tez',
            address: 'tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc',
            owner: 'tz1OWN',
            data: new RecordMetadata(),
        });

        when(dataProviderMock.getDomainRecord('no-address.tez')).thenResolve({
            expiry_key: 'no-address.tez',
            address: null,
            owner: 'tz1OWN',
            data: new RecordMetadata(),
        });

        when(dataProviderMock.getDomainRecord('no-expiry-key.tez')).thenResolve({
            expiry_key: 'no-expiry-key.tez',
            address: 'tz1S8U7XJU8vj2SEyLDXH25fhLuEsk4Yr1wZ',
            owner: 'tz1OWN',
            data: new RecordMetadata(),
        });

        when(dataProviderMock.getDomainExpiry('necroskillz.tez')).thenResolve(new Date(2021, 1, 1));
        when(dataProviderMock.getDomainExpiry('expired.tez')).thenResolve(new Date(2019, 1, 1));

        const reverseRecordData = new RecordMetadata();
        reverseRecordData.setJson(StandardRecordMetadataKey.TTL, 69);

        when(dataProviderMock.getReverseRecord('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i')).thenResolve({
            name: 'play.necroskillz.tez',
            owner: 'tz1zzz',
            data: reverseRecordData,
        });

        when(dataProviderMock.getReverseRecord('tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc')).thenResolve({
            name: 'expired.tez',
            owner: 'tz1ezz',
            data: new RecordMetadata(),
        });
        when(dataProviderMock.getReverseRecord('tz1SdArNzLEch64rBDmMeJf23TRQ19gc4yTs')).thenResolve({
            name: 'orphan.tez',
            owner: 'tz1aaa',
            data: new RecordMetadata(),
        });
        when(dataProviderMock.getReverseRecord('tz1S8U7XJU8vj2SEyLDXH25fhLuEsk4Yr1wZ')).thenResolve({
            name: 'no-expiry-key.tez',
            owner: 'tz1aaa',
            data: new RecordMetadata(),
        });
        when(dataProviderMock.getReverseRecord('tz1a1qfkPhNnaUGb1mNfDsUKJi23ADet7h62')).thenResolve({
            name: null,
            owner: 'tz1aaa',
            data: new RecordMetadata(),
        });

        when(tracerMock.trace(anything(), anything()));

        MockDate.set(new Date(2020, 10, 11, 20, 0, 0));

        resolver = new BlockchainNameResolver(instance(dataProviderMock), instance(tracerMock), validator);
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('resolveDomainRecord()', () => {
        it('should return info about a domain', async () => {
            const domain = await resolver.resolveDomainRecord('play.necroskillz.tez');

            expect(domain?.name).toBe('play.necroskillz.tez');
            expect(domain?.address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
            expect(domain?.expiry).toStrictEqual(new Date(2021, 1, 1));
            expect(domain?.owner).toBe('tz1OWN');
            expect(domain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });
    });

    describe('resolveNameToAddress()', () => {
        it('should resolve name', async () => {
            const address = await resolver.resolveNameToAddress('play.necroskillz.tez');

            expect(address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
        });

        it('should resolve name if record has no expiry', async () => {
            const name = await resolver.resolveNameToAddress('no-expiry-key.tez');

            expect(name).toBe('tz1S8U7XJU8vj2SEyLDXH25fhLuEsk4Yr1wZ');
        });

        it('should return null if record does not exist', async () => {
            const address = await resolver.resolveNameToAddress('404.tez');

            expect(address).toBe(null);
        });

        it('should return null if record is expired', async () => {
            const address = await resolver.resolveNameToAddress('expired.tez');

            expect(address).toBe(null);
        });

        it('should return null if record has no address', async () => {
            const address = await resolver.resolveNameToAddress('no-address.tez');

            expect(address).toBe(null);
        });

        it('should throw when name is null', async () => {
            await expect(() => resolver.resolveNameToAddress(null as any)).rejects.toEqual(new Error(`Argument 'name' was not specified.`));
        });

        it('should throw when invalid name is specified', async () => {
            await expect(() => resolver.resolveNameToAddress('invalid')).rejects.toEqual(new Error(`'invalid' is not a valid domain name.`));
        });
    });

    describe('resolveReverseRecord()', () => {
        it('should return info about a reverse record', async () => {
            const reverseRecord = await resolver.resolveReverseRecord('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');

            expect(reverseRecord?.domain?.name).toBe('play.necroskillz.tez');
            expect(reverseRecord?.domain?.address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
            expect(reverseRecord?.domain?.expiry).toStrictEqual(new Date(2021, 1, 1));
            expect(reverseRecord?.domain?.owner).toBe('tz1OWN');
            expect(reverseRecord?.domain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
            expect(reverseRecord?.owner).toBe('tz1zzz');
            expect(reverseRecord?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(69);
        });
    });

    describe('resolveAddressToName()', () => {
        it('should resolve address', async () => {
            const name = await resolver.resolveAddressToName('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');

            expect(name).toBe('play.necroskillz.tez');
        });

        it('should resolve address if associated record has no expiry', async () => {
            const name = await resolver.resolveAddressToName('tz1S8U7XJU8vj2SEyLDXH25fhLuEsk4Yr1wZ');

            expect(name).toBe('no-expiry-key.tez');
        });

        it('should return null if reverse record does not exist', async () => {
            const name = await resolver.resolveAddressToName('tz1R3iboWc7PWQsHvo9WMaJjKcp2a3wX6TjP');

            expect(name).toBe(null);
        });

        it('should return null if associated record is expired', async () => {
            const name = await resolver.resolveAddressToName('tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc');

            expect(name).toBe(null);
        });

        it('should return null if associated record does not exist', async () => {
            const name = await resolver.resolveAddressToName('tz1SdArNzLEch64rBDmMeJf23TRQ19gc4yTs');

            expect(name).toBe(null);
        });

        it('should return null if reverse record has no name', async () => {
            const name = await resolver.resolveAddressToName('tz1a1qfkPhNnaUGb1mNfDsUKJi23ADet7h62');

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
