import { Tracer, MavrykDomainsDataProvider, RecordMetadata, ResolverDataProviderAdapter, StandardRecordMetadataKey } from '@mavrykdynamics/mavryk-domains-core';
import { mock, when, anything, instance } from 'ts-mockito';
import MockDate from 'mockdate';

describe('ResolverDataProviderAdapter', () => {
    let adapter: ResolverDataProviderAdapter;
    let dataProviderMock: MavrykDomainsDataProvider;
    let tracerMock: Tracer;

    beforeEach(() => {
        dataProviderMock = mock<MavrykDomainsDataProvider>();
        tracerMock = mock<Tracer>();

        const domainData = new RecordMetadata();
        domainData.setJson(StandardRecordMetadataKey.TTL, 420);

        when(dataProviderMock.getDomainRecord('play.necroskillz.mav')).thenResolve({
            address: 'mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa',
            expiry_key: 'necroskillz.mav',
            owner: 'mv1OWN',
            data: domainData,
            tzip12_token_id: null
        });

        when(dataProviderMock.getDomainRecord('expired.mav')).thenResolve({
            expiry_key: 'expired.mav',
            address: 'mv196vE7a8B9mv7ptdAGExRtXctuPBCL4id7',
            owner: 'mv1OWN',
            data: new RecordMetadata(),
            tzip12_token_id: 666
        });

        when(dataProviderMock.getDomainRecord('no-expiry-key.mav')).thenResolve({
            expiry_key: null,
            address: 'mv1G5dTUhiATLfchFZawr3kibqZXSkvuSrLq',
            owner: 'mv1OWN',
            data: new RecordMetadata(),
            tzip12_token_id: 42
        });

        when(dataProviderMock.getDomainExpiry('necroskillz.mav')).thenResolve(new Date(2021, 1, 1));
        when(dataProviderMock.getDomainExpiry('expired.mav')).thenResolve(new Date(2019, 1, 1));

        when(dataProviderMock.getReverseRecord('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa')).thenResolve({
            name: 'play.necroskillz.mav',
            owner: 'mv1zzz',
        });

        when(dataProviderMock.getReverseRecord('mv196vE7a8B9mv7ptdAGExRtXctuPBCL4id7')).thenResolve({
            name: 'expired.mav',
            owner: 'mv1ezz',
        });
        when(dataProviderMock.getReverseRecord('mv1L1S16iGQWjQERwi9FKfEzTxVMDbF7LuS6')).thenResolve({
            name: 'orphan.mav',
            owner: 'mv1aaa',
        });
        when(dataProviderMock.getReverseRecord('mv1G5dTUhiATLfchFZawr3kibqZXSkvuSrLq')).thenResolve({
            name: 'no-expiry-key.mav',
            owner: 'mv1aaa',
        });
        when(dataProviderMock.getReverseRecord('mv1NPJyLi4g99k3pA5wWThALTit1ic9DHMKj')).thenResolve({
            name: null,
            owner: 'mv1aaa',
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
            const domain = await adapter.resolveDomainInfo('play.necroskillz.mav');

            expect(domain?.name).toBe('play.necroskillz.mav');
            expect(domain?.address).toBe('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');
            expect(domain?.expiry).toStrictEqual(new Date(2021, 1, 1));
            expect(domain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });
        
        it('should resolve name if record has no expiry', async () => {
            const domain = await adapter.resolveDomainInfo('no-expiry-key.mav');

            expect(domain?.address).toBe('mv1G5dTUhiATLfchFZawr3kibqZXSkvuSrLq');
            expect(domain?.expiry).toBeNull();
        });

        it('should return null if record does not exist', async () => {
            const domain = await adapter.resolveDomainInfo('404.mav');

            expect(domain).toBe(null);
        });

        it('should return null if record is expired', async () => {
            const domain = await adapter.resolveDomainInfo('expired.mav');

            expect(domain).toBe(null);
        });
    });

    describe('resolveReverseRecord()', () => {
        it('should return info about a reverse record', async () => {
            const reverseRecord = await adapter.resolveReverseRecordDomainInfo('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');

            expect(reverseRecord?.name).toBe('play.necroskillz.mav');
            expect(reverseRecord?.address).toBe('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');
            expect(reverseRecord?.expiry).toStrictEqual(new Date(2021, 1, 1));
            expect(reverseRecord?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });

        it('should resolve address if associated record has no expiry', async () => {
            const domain = await adapter.resolveReverseRecordDomainInfo('mv1G5dTUhiATLfchFZawr3kibqZXSkvuSrLq');

            expect(domain?.name).toBe('no-expiry-key.mav');
        });

        it('should return null if reverse record does not exist', async () => {
            const domain = await adapter.resolveReverseRecordDomainInfo('mv1DRBuPpyQk5geX57iMbPzkUdg18SWSA2MK');

            expect(domain).toBe(null);
        });

        it('should return null if associated record is expired', async () => {
            const domain = await adapter.resolveReverseRecordDomainInfo('mv196vE7a8B9mv7ptdAGExRtXctuPBCL4id7');

            expect(domain).toBe(null);
        });

        it('should return null if associated record does not exist', async () => {
            const domain = await adapter.resolveReverseRecordDomainInfo('mv1L1S16iGQWjQERwi9FKfEzTxVMDbF7LuS6');

            expect(domain).toBe(null);
        });

        it('should return null if reverse record has no name', async () => {
            const domain = await adapter.resolveReverseRecordDomainInfo('mv1NPJyLi4g99k3pA5wWThALTit1ic9DHMKj');

            expect(domain).toBe(null);
        });
    });
});
