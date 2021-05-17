import { Tracer, TezosDomainsDataProvider, RecordMetadata, ResolverDataProviderAdapter, StandardRecordMetadataKey } from '@tezos-domains/core';
import { mock, when, anything, instance } from 'ts-mockito';
import MockDate from 'mockdate';

describe('ResolverDataProviderAdapter', () => {
    let adapter: ResolverDataProviderAdapter;
    let dataProviderMock: TezosDomainsDataProvider;
    let tracerMock: Tracer;

    beforeEach(() => {
        dataProviderMock = mock<TezosDomainsDataProvider>();
        tracerMock = mock<Tracer>();

        const domainData = new RecordMetadata();
        domainData.setJson(StandardRecordMetadataKey.TTL, 420);

        when(dataProviderMock.getDomainRecord('play.necroskillz.tez')).thenResolve({
            address: 'tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i',
            expiry_key: 'necroskillz.tez',
            owner: 'tz1OWN',
            data: domainData,
            tzip12_token_id: null
        });

        when(dataProviderMock.getDomainRecord('expired.tez')).thenResolve({
            expiry_key: 'expired.tez',
            address: 'tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc',
            owner: 'tz1OWN',
            data: new RecordMetadata(),
            tzip12_token_id: 666
        });

        when(dataProviderMock.getDomainRecord('no-expiry-key.tez')).thenResolve({
            expiry_key: null,
            address: 'tz1S8U7XJU8vj2SEyLDXH25fhLuEsk4Yr1wZ',
            owner: 'tz1OWN',
            data: new RecordMetadata(),
            tzip12_token_id: 42
        });

        when(dataProviderMock.getDomainExpiry('necroskillz.tez')).thenResolve(new Date(2021, 1, 1));
        when(dataProviderMock.getDomainExpiry('expired.tez')).thenResolve(new Date(2019, 1, 1));

        when(dataProviderMock.getReverseRecord('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i')).thenResolve({
            name: 'play.necroskillz.tez',
            owner: 'tz1zzz',
        });

        when(dataProviderMock.getReverseRecord('tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc')).thenResolve({
            name: 'expired.tez',
            owner: 'tz1ezz',
        });
        when(dataProviderMock.getReverseRecord('tz1SdArNzLEch64rBDmMeJf23TRQ19gc4yTs')).thenResolve({
            name: 'orphan.tez',
            owner: 'tz1aaa',
        });
        when(dataProviderMock.getReverseRecord('tz1S8U7XJU8vj2SEyLDXH25fhLuEsk4Yr1wZ')).thenResolve({
            name: 'no-expiry-key.tez',
            owner: 'tz1aaa',
        });
        when(dataProviderMock.getReverseRecord('tz1a1qfkPhNnaUGb1mNfDsUKJi23ADet7h62')).thenResolve({
            name: null,
            owner: 'tz1aaa',
        });

        when(tracerMock.trace(anything(), anything()));

        MockDate.set(new Date(2020, 10, 11, 20, 0, 0));

        adapter = new ResolverDataProviderAdapter(instance(dataProviderMock), instance(tracerMock));
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('resolveDomainRecord()', () => {
        it('should return info about a domain', async () => {
            const domain = await adapter.resolveDomainInfo('play.necroskillz.tez');

            expect(domain?.name).toBe('play.necroskillz.tez');
            expect(domain?.address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
            expect(domain?.expiry).toStrictEqual(new Date(2021, 1, 1));
            expect(domain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });
        
        it('should resolve name if record has no expiry', async () => {
            const domain = await adapter.resolveDomainInfo('no-expiry-key.tez');

            expect(domain?.address).toBe('tz1S8U7XJU8vj2SEyLDXH25fhLuEsk4Yr1wZ');
            expect(domain?.expiry).toBeNull();
        });

        it('should return null if record does not exist', async () => {
            const domain = await adapter.resolveDomainInfo('404.tez');

            expect(domain).toBe(null);
        });

        it('should return null if record is expired', async () => {
            const domain = await adapter.resolveDomainInfo('expired.tez');

            expect(domain).toBe(null);
        });
    });

    describe('resolveReverseRecord()', () => {
        it('should return info about a reverse record', async () => {
            const reverseRecord = await adapter.resolveReverseRecordDomainInfo('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');

            expect(reverseRecord?.name).toBe('play.necroskillz.tez');
            expect(reverseRecord?.address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
            expect(reverseRecord?.expiry).toStrictEqual(new Date(2021, 1, 1));
            expect(reverseRecord?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });

        it('should resolve address if associated record has no expiry', async () => {
            const domain = await adapter.resolveReverseRecordDomainInfo('tz1S8U7XJU8vj2SEyLDXH25fhLuEsk4Yr1wZ');

            expect(domain?.name).toBe('no-expiry-key.tez');
        });

        it('should return null if reverse record does not exist', async () => {
            const domain = await adapter.resolveReverseRecordDomainInfo('tz1R3iboWc7PWQsHvo9WMaJjKcp2a3wX6TjP');

            expect(domain).toBe(null);
        });

        it('should return null if associated record is expired', async () => {
            const domain = await adapter.resolveReverseRecordDomainInfo('tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc');

            expect(domain).toBe(null);
        });

        it('should return null if associated record does not exist', async () => {
            const domain = await adapter.resolveReverseRecordDomainInfo('tz1SdArNzLEch64rBDmMeJf23TRQ19gc4yTs');

            expect(domain).toBe(null);
        });

        it('should return null if reverse record has no name', async () => {
            const domain = await adapter.resolveReverseRecordDomainInfo('tz1a1qfkPhNnaUGb1mNfDsUKJi23ADet7h62');

            expect(domain).toBe(null);
        });
    });
});
