import {
    Tracer,
    RecordMetadata,
    TezosDomainsResolverDataProvider,
    StandardRecordMetadataKey,
    DomainNameValidator,
    TezosDomainsValidator,
} from '@tezos-domains/core';
import { NameResolver } from '@tezos-domains/resolver';
import { mock, when, anything, instance } from 'ts-mockito';

import { BlockchainNameResolver } from '../../src/resolver/blockchain-name-resolver';

describe('BlockchainNameResolver', () => {
    let resolver: NameResolver;
    let dataProviderMock: TezosDomainsResolverDataProvider;
    let tracerMock: Tracer;
    let validator: DomainNameValidator;

    beforeEach(() => {
        dataProviderMock = mock<TezosDomainsResolverDataProvider>();
        tracerMock = mock<Tracer>();
        validator = new TezosDomainsValidator();

        const domainData = new RecordMetadata();
        domainData.setJson(StandardRecordMetadataKey.TTL, 420);

        when(dataProviderMock.resolveDomainInfo('play.necroskillz.tez')).thenResolve({
            address: 'tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i',
            data: domainData,
            expiry: new Date(2021, 1, 1),
            name: 'play.necroskillz.tez'
        });

        when(dataProviderMock.resolveDomainInfo('no-address.tez')).thenResolve({
            address: null,
            data: new RecordMetadata(),
            expiry: new Date(2021, 1, 1),
            name: 'no-address.tez'
        });

        when(dataProviderMock.resolveDomainInfo('404.tez')).thenResolve(null);

        when(dataProviderMock.resolveReverseRecordDomainInfo('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i')).thenResolve({
            address: 'tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i',
            data: domainData,
            expiry: new Date(2021, 1, 1),
            name: 'play.necroskillz.tez'
        });

        when(dataProviderMock.resolveReverseRecordDomainInfo('tz1dkLSGXbGxocN1QgxAp5tnYhY8VAaZ4kQp')).thenResolve(null);

        when(tracerMock.trace(anything(), anything()));

        resolver = new BlockchainNameResolver(instance(dataProviderMock), instance(tracerMock), validator);
    });

    describe('resolveDomainRecord()', () => {
        it('should return info about a domain', async () => {
            const domain = await resolver.resolveDomainRecord('play.necroskillz.tez');

            expect(domain?.name).toBe('play.necroskillz.tez');
            expect(domain?.address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
            expect(domain?.expiry).toStrictEqual(new Date(2021, 1, 1));
            expect(domain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });
    });

    describe('resolveNameToAddress()', () => {
        it('should resolve name', async () => {
            const address = await resolver.resolveNameToAddress('play.necroskillz.tez');

            expect(address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
        });

        it('should return null if record has no address', async () => {
            const address = await resolver.resolveNameToAddress('no-address.tez');

            expect(address).toBe(null);
        });

        it('should return null if record does not exist', async () => {
            const address = await resolver.resolveNameToAddress('404.tez');

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

            expect(reverseRecord?.name).toBe('play.necroskillz.tez');
            expect(reverseRecord?.address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
            expect(reverseRecord?.expiry).toStrictEqual(new Date(2021, 1, 1));
            expect(reverseRecord?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });
    });

    describe('resolveAddressToName()', () => {
        it('should resolve address', async () => {
            const name = await resolver.resolveAddressToName('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');

            expect(name).toBe('play.necroskillz.tez');
        });

        it('should return null if record does not exist', async () => {
            const name = await resolver.resolveAddressToName('tz1dkLSGXbGxocN1QgxAp5tnYhY8VAaZ4kQp');

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
