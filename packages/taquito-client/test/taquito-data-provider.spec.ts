import { SmartContractType, DomainRecord, ReverseRecord, RpcRequestScalarData, RpcResponseData, Tracer, BytesEncoder, AddressBook } from '@mavrykdynamics/mavryk-domains-core';
import { TaquitoClient } from '@mavrykdynamics/mavryk-domains-taquito';
import { mock, when, anyFunction, anything, instance } from 'ts-mockito';
import { StandardRecordMetadataKey } from '@mavrykdynamics/mavryk-domains-core';
import { MichelsonMap } from '@mavrykdynamics/taquito';
import BigNumber from 'bignumber.js';

import { TaquitoMavrykDomainsDataProvider } from '../src/taquito-data-provider';

interface FakeNameRegistryStorage {
    store: {
        records: Record<string, Pick<DomainRecord, 'expiry_key' | 'address'>>;
        reverse_records: Record<string, Pick<ReverseRecord, 'name' | 'owner'>>;
        expiry_map: Record<string, Date>;
    };
}

const e = (s: string) => new BytesEncoder().encode(s)!;

describe('TaquitoMavrykDomainsDataProvider', () => {
    let dataProvider: TaquitoMavrykDomainsDataProvider;
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

        storage.store.records[e('play.necroskillz.mav')] = {
            expiry_key: e('necroskillz.mav'),
            address: 'mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa',
            owner: 'mv1OWN',
            level: new BigNumber(3),
            data: domainData,
            tzip12_token_id: new BigNumber(1)
        } as any;

        storage.store.expiry_map[e('necroskillz.mav')] = new Date(2021, 1, 1);

        storage.store.reverse_records['mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa'] = {
            name: e('play.necroskillz.mav'),
            owner: 'mv1zzz',
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

        dataProvider = new TaquitoMavrykDomainsDataProvider(instance(taquitoClientMock), instance(addressBookMock), instance(tracerMock));
    });

    describe('getDomainRecord()', () => {
        it('should return info about a domain', async () => {
            const domain = await dataProvider.getDomainRecord('play.necroskillz.mav');

            expect(domain?.address).toBe('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');
            expect(domain?.expiry_key).toBe('necroskillz.mav');
            expect(domain?.owner).toBe('mv1OWN');
            expect(domain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
            expect(domain?.tzip12_token_id).toBe(1);
        });

        it('should return null if domain does not exist', async () => {
            const domain = await dataProvider.getDomainRecord('lol.necroskillz.mav');

            expect(domain).toBeNull();
        });
    });

    describe('getDomainExpiry()', () => {
        it('should return date of expiry', async () => {
            const address = await dataProvider.getDomainExpiry('necroskillz.mav');

            expect(address).toStrictEqual(new Date(2021, 1, 1));
        });

        it('should return null if expiry record does not exist', async () => {
            const address = await dataProvider.getDomainExpiry('xxx.mav');

            expect(address).toBeNull();
        });
    });

    describe('getReverseRecord()', () => {
        it('should return info about a reverse record', async () => {
            const reverseRecord = await dataProvider.getReverseRecord('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');

            expect(reverseRecord?.name).toBe('play.necroskillz.mav');
            expect(reverseRecord?.owner).toBe('mv1zzz');
        });

        it('should return null if reverse record does not exist', async () => {
            const reverseRecord = await dataProvider.getReverseRecord('lol.necroskillz.mav');

            expect(reverseRecord).toBeNull();
        });
    });
});
