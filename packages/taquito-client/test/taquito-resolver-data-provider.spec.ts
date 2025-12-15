import { SmartContractType, RpcRequestScalarData, RpcResponseData, Tracer, BytesEncoder, AddressBook } from '@mavrykdynamics/mavryk-domains-core';
import { TaquitoClient } from '@mavrykdynamics/mavryk-domains-taquito';
import { mock, when, anything, instance, anyString } from 'ts-mockito';
import { StandardRecordMetadataKey } from '@mavrykdynamics/mavryk-domains-core';
import { MichelsonMap } from '@mavrykdynamics/taquito';

import { TaquitoMavrykDomainsResolverDataProvider } from '../src/taquito-resolver-data-provider';

const e = (s: string) => new BytesEncoder().encode(s)!;

describe('TaquitoMavrykDomainsResolverDataProvider', () => {
    let dataProvider: TaquitoMavrykDomainsResolverDataProvider;
    let taquitoClientMock: TaquitoClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;

    let records: {
        'resolve-name': Record<string, any>;
        'resolve-address': Record<string, any>;
    };

    beforeEach(() => {
        taquitoClientMock = mock(TaquitoClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock<Tracer>();

        const domainData = new MichelsonMap();
        domainData.set(StandardRecordMetadataKey.TTL, e('420'));

        records = {
            'resolve-address': {},
            'resolve-name': {},
        };

        records['resolve-name'][e('necroskillz.mav')] = {
            name: e('necroskillz.mav'),
            address: 'mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa',
            data: domainData,
            expiry: '2021-01-11T11:01:00.000Z',
        };

        records['resolve-address']['mv1Q6r6jTAiFyM9sxirr12rqhLBnBqRJNuqY'] = {
            name: e('play.necroskillz.mav'),
            address: 'mv1Q6r6jTAiFyM9sxirr12rqhLBnBqRJNuqY',
            data: domainData,
            expiry: '2022-01-11T11:01:00.000Z',
        } as any;

        when(tracerMock.trace(anything(), anything()));

        when(addressBookMock.lookup(anything())).thenCall(type => Promise.resolve(`${type}addr`));

        when(taquitoClientMock.executeView(`${SmartContractType.NameRegistry}addr`, anyString(), anything())).thenCall(
            (_, view: 'resolve-name' | 'resolve-address', key: [RpcRequestScalarData<string> | string]) => {
                const encodedKey = key[0] instanceof RpcRequestScalarData ? key[0].encode() : key[0];
                if (!encodedKey) {
                    throw new Error('Key must be specified.');
                }
                return Promise.resolve(new RpcResponseData(records[view][encodedKey]));
            }
        );

        dataProvider = new TaquitoMavrykDomainsResolverDataProvider(instance(taquitoClientMock), instance(addressBookMock), instance(tracerMock));
    });

    describe('resolveDomainInfo()', () => {
        it('should return info about a domain', async () => {
            const domain = await dataProvider.resolveDomainInfo('necroskillz.mav');

            expect(domain?.address).toBe('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');
            expect(domain?.name).toBe('necroskillz.mav');
            expect(domain?.expiry?.toISOString()).toBe('2021-01-11T11:01:00.000Z');
            expect(domain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });

        it('should return null if domain does not exist', async () => {
            const domain = await dataProvider.resolveDomainInfo('lol.necroskillz.mav');

            expect(domain).toBeNull();
        });
    });

    describe('resolveReverseRecordDomainInfo()', () => {
        it('should return info about a reverse record', async () => {
            const reverseRecordDomain = await dataProvider.resolveReverseRecordDomainInfo('mv1Q6r6jTAiFyM9sxirr12rqhLBnBqRJNuqY');

            expect(reverseRecordDomain?.address).toBe('mv1Q6r6jTAiFyM9sxirr12rqhLBnBqRJNuqY');
            expect(reverseRecordDomain?.name).toBe('play.necroskillz.mav');
            expect(reverseRecordDomain?.expiry?.toISOString()).toBe('2022-01-11T11:01:00.000Z');
            expect(reverseRecordDomain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });

        it('should return null if reverse record does not exist', async () => {
            const reverseRecordDomain = await dataProvider.resolveReverseRecordDomainInfo('mv1UpxxcUmbZfd43JCQweMzWt9B4SDpKBMFk');

            expect(reverseRecordDomain).toBeNull();
        });
    });
});
