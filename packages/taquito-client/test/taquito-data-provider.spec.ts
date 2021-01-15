import { SmartContractType, DomainRecord, ReverseRecord, RpcRequestScalarData, RpcResponseData, Tracer, BytesEncoder, AddressBook } from '@tezos-domains/core';
import { TaquitoClient } from '@tezos-domains/taquito';
import { mock, when, anyFunction, anything, instance } from 'ts-mockito';
import { StandardRecordMetadataKey } from '@tezos-domains/core';
import { MichelsonMap } from '@taquito/taquito';
import BigNumber from 'bignumber.js';

import { TaquitoTezosDomainsDataProvider } from '../src/taquito-data-provider';

interface FakeNameRegistryStorage {
    store: {
        records: Record<string, Pick<DomainRecord, 'expiry_key' | 'address'>>;
        reverse_records: Record<string, Pick<ReverseRecord, 'name' | 'owner'>>;
        expiry_map: Record<string, Date>;
    };
}

const e = (s: string) => new BytesEncoder().encode(s)!;

describe('TaquitoTezosDomainsDataProvider', () => {
    let dataProvider: TaquitoTezosDomainsDataProvider;
    let taquitoClientMock: TaquitoClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;

    const storage: FakeNameRegistryStorage = {
        store: {
            records: {},
            expiry_map: {},
            reverse_records: {},
        },
    };

    beforeEach(() => {
        taquitoClientMock = mock(TaquitoClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock<Tracer>();

        const domainData = new MichelsonMap();
        domainData.set(StandardRecordMetadataKey.TTL, e('420'));

        storage.store.records[e('play.necroskillz.tez')] = {
            expiry_key: e('necroskillz.tez'),
            address: 'tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i',
            owner: 'tz1OWN',
            level: new BigNumber(3),
            data: domainData,
        } as any;

        storage.store.expiry_map[e('necroskillz.tez')] = new Date(2021, 1, 1);

        storage.store.reverse_records['tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i'] = {
            name: e('play.necroskillz.tez'),
            owner: 'tz1zzz',
        } as any;

        when(tracerMock.trace(anything(), anything()));

        when(addressBookMock.lookup(anything())).thenCall(type => Promise.resolve(`${type}addr`));

        when(taquitoClientMock.getBigMapValue(`${SmartContractType.NameRegistry}addr`, anyFunction(), anything())).thenCall(
            (_, selector, key: RpcRequestScalarData<string>) => {
                const encodedKey = key.encode();
                if (!encodedKey) {
                    throw new Error('Key must be specified.');
                }
                return Promise.resolve(new RpcResponseData(selector(storage)[encodedKey]));
            }
        );

        dataProvider = new TaquitoTezosDomainsDataProvider(instance(taquitoClientMock), instance(addressBookMock), instance(tracerMock));
    });

    describe('getDomainRecord()', () => {
        it('should return info about a domain', async () => {
            const domain = await dataProvider.getDomainRecord('play.necroskillz.tez');

            expect(domain?.address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
            expect(domain?.expiry_key).toBe('necroskillz.tez');
            expect(domain?.owner).toBe('tz1OWN');
            expect(domain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });

        it('should return null if domain does not exist', async () => {
            const domain = await dataProvider.getDomainRecord('lol.necroskillz.tez');

            expect(domain).toBeNull();
        });
    });

    describe('getDomainExpiry()', () => {
        it('should return date of expiry', async () => {
            const address = await dataProvider.getDomainExpiry('necroskillz.tez');

            expect(address).toStrictEqual(new Date(2021, 1, 1));
        });

        it('should return null if expiry record does not exist', async () => {
            const address = await dataProvider.getDomainExpiry('xxx.tez');

            expect(address).toBeNull();
        });
    });

    describe('getReverseRecord()', () => {
        it('should return info about a reverse record', async () => {
            const reverseRecord = await dataProvider.getReverseRecord('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');

            expect(reverseRecord?.name).toBe('play.necroskillz.tez');
            expect(reverseRecord?.owner).toBe('tz1zzz');
        });

        it('should return null if reverse record does not exist', async () => {
            const reverseRecord = await dataProvider.getReverseRecord('lol.necroskillz.tez');

            expect(reverseRecord).toBeNull();
        });
    });
});
