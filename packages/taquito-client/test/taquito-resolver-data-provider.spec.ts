import { SmartContractType, RpcRequestScalarData, RpcResponseData, Tracer, BytesEncoder, AddressBook } from '@tezos-domains/core';
import { TaquitoClient } from '@tezos-domains/taquito';
import { mock, when, anything, instance, anyString } from 'ts-mockito';
import { StandardRecordMetadataKey } from '@tezos-domains/core';
import { MichelsonMap } from '@taquito/taquito';

import { TaquitoTezosDomainsResolverDataProvider } from '../src/taquito-resolver-data-provider';

const e = (s: string) => new BytesEncoder().encode(s)!;

describe('TaquitoTezosDomainsResolverDataProvider', () => {
    let dataProvider: TaquitoTezosDomainsResolverDataProvider;
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

        records['resolve-name'][e('necroskillz.tez')] = {
            name: e('necroskillz.tez'),
            address: 'tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i',
            data: domainData,
            expiry: '2021-01-11T11:01:00.000Z',
        };

        records['resolve-address']['tz1dkLSGXbGxocN1QgxAp5tnYhY8VAaZ4kQp'] = {
            name: e('play.necroskillz.tez'),
            address: 'tz1dkLSGXbGxocN1QgxAp5tnYhY8VAaZ4kQp',
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

        dataProvider = new TaquitoTezosDomainsResolverDataProvider(instance(taquitoClientMock), instance(addressBookMock), instance(tracerMock));
    });

    describe('resolveDomainInfo()', () => {
        it('should return info about a domain', async () => {
            const domain = await dataProvider.resolveDomainInfo('necroskillz.tez');

            expect(domain?.address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
            expect(domain?.name).toBe('necroskillz.tez');
            expect(domain?.expiry?.toISOString()).toBe('2021-01-11T11:01:00.000Z');
            expect(domain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });

        it('should return null if domain does not exist', async () => {
            const domain = await dataProvider.resolveDomainInfo('lol.necroskillz.tez');

            expect(domain).toBeNull();
        });
    });

    describe('resolveReverseRecordDomainInfo()', () => {
        it('should return info about a reverse record', async () => {
            const reverseRecordDomain = await dataProvider.resolveReverseRecordDomainInfo('tz1dkLSGXbGxocN1QgxAp5tnYhY8VAaZ4kQp');

            expect(reverseRecordDomain?.address).toBe('tz1dkLSGXbGxocN1QgxAp5tnYhY8VAaZ4kQp');
            expect(reverseRecordDomain?.name).toBe('play.necroskillz.tez');
            expect(reverseRecordDomain?.expiry?.toISOString()).toBe('2022-01-11T11:01:00.000Z');
            expect(reverseRecordDomain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });

        it('should return null if reverse record does not exist', async () => {
            const reverseRecordDomain = await dataProvider.resolveReverseRecordDomainInfo('tz1gwaYxn9mkHQAuHttKgFMJmpf4WfUBmcm5');

            expect(reverseRecordDomain).toBeNull();
        });
    });
});
