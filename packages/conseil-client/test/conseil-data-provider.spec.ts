import { SmartContractType, RpcRequestScalarData, Tracer, BytesEncoder, AddressBook } from '@mavrykdynamics/mavryk-domains-core';
import { mock, when, anything, instance, anyNumber, anyString } from 'ts-mockito';
import { StandardRecordMetadataKey } from '@mavrykdynamics/mavryk-domains-core';

import { ConseilMavrykDomainsDataProvider } from '../src/conseil-data-provider';
import { ConseilClient } from '../src/conseil/client';

const e = (s: string) => new BytesEncoder().encode(s)!;

describe('ConseilMavrykDomainsDataProvider', () => {
    let dataProvider: ConseilMavrykDomainsDataProvider;
    let conseilClientMock: ConseilClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;

    let maps: Record<number, Record<string, any>>;

    beforeEach(() => {
        conseilClientMock = mock(ConseilClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock<Tracer>();

        maps = {
            1: {},
            2: {},
            3: {},
        };

        maps[2][e('play.necroskillz.mav')] = {
            prim: 'Pair',
            args: [
                {
                    prim: 'Pair',
                    args: [
                        {
                            prim: 'Pair',
                            args: [
                                { prim: 'Some', args: [{ string: 'mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa' }] },
                                [{ prim: 'Elt', args: [{ string: 'td:ttl' }, { bytes: e('420') }] }],
                            ],
                        },
                        {
                            prim: 'Pair',
                            args: [{ prim: 'Some', bytes: e('necroskillz.mav') }],
                        },
                    ],
                },
                {
                    prim: 'Pair',
                    args: [{ int: '3' }, { string: 'mv1OWN' }],
                },
                {
                    prim: 'Pair',
                    args: [{ int: '777' }],
                },
            ],
        };

        maps[3]['mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa'] = {
            prim: 'Pair',
            args: [
                {
                    prim: 'Pair',
                    args: [[], { prim: 'Some', args: [{ bytes: e('play.necroskillz.mav') }] }],
                },
                {
                    string: 'mv1zzz',
                },
            ],
        };

        maps[1][e('necroskillz.mav')] = { string: new Date(2021, 1, 1).toISOString() };

        when(tracerMock.trace(anything(), anything()));

        when(addressBookMock.lookup(anything())).thenCall(type => Promise.resolve(`${type}addr`));

        when(conseilClientMock.storage(`${SmartContractType.NameRegistry}addr`)).thenResolve({
            prim: 'Pair',
            args: [
                {
                    prim: 'Pair',
                    args: [
                        { int: '9399' },
                        {
                            prim: 'Pair',
                            args: [
                                {
                                    prim: 'Pair',
                                    args: [{ int: '9400' }, { int: '1' }],
                                },
                                { int: '9402' },
                                { int: '7' },
                            ],
                        },
                        {
                            prim: 'Pair',
                            args: [{ string: 'mv1NoYoaaCHVxJWsFN7HCujx1i6BmA6a8Fay' }, { int: '2' }],
                        },
                        { int: '3' },
                        { int: '9405' },
                    ],
                },
                [],
            ],
        });

        when(conseilClientMock.getBigMapValue(anyNumber(), anything(), anyString())).thenCall((mapid, key: RpcRequestScalarData<string>) => {
            const encodedKey = key.encode();
            if (!encodedKey) {
                throw new Error('Key must be specified.');
            }

            return Promise.resolve(maps[mapid][encodedKey]);
        });

        dataProvider = new ConseilMavrykDomainsDataProvider(instance(conseilClientMock), instance(addressBookMock), instance(tracerMock));
    });

    describe('getDomainRecord()', () => {
        it('should return info about a domain', async () => {
            const domain = await dataProvider.getDomainRecord('play.necroskillz.mav');

            expect(domain?.address).toBe('mv1K91dgHkrxFgQdML1HBk1nUwhBDHhXSfwa');
            expect(domain?.expiry_key).toBe('necroskillz.mav');
            expect(domain?.owner).toBe('mv1OWN');
            expect(domain?.tzip12_token_id).toBe(777);
            expect(domain?.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
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
