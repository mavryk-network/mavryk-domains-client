import { SmartContractType, RpcRequestScalarData, Tracer, BytesEncoder, AddressBook } from '@tezos-domains/core';
import { mock, when, anything, instance, anyNumber, anyString } from 'ts-mockito';
import { StandardRecordMetadataKey } from '@tezos-domains/core';

import { ConseilTezosDomainsDataProvider } from '../src/conseil-data-provider';
import { ConseilClient } from '../src/conseil/client';

const e = (s: string) => new BytesEncoder().encode(s)!;

describe('ConseilTezosDomainsDataProvider', () => {
    let dataProvider: ConseilTezosDomainsDataProvider;
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

        maps[2][e('play.necroskillz.tez')] = {
            prim: 'Pair',
            args: [
                {
                    prim: 'Pair',
                    args: [
                        {
                            prim: 'Pair',
                            args: [
                                { prim: 'Some', args: [{ string: 'tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i' }] },
                                [{ prim: 'Elt', args: [{ string: 'td:ttl' }, { bytes: e('420') }] }],
                            ],
                        },
                        {
                            prim: 'Pair',
                            args: [{ prim: 'Some', args: [{ bytes: e('necroskillz.tez') }] }, []],
                        },
                    ],
                },
                {
                    prim: 'Pair',
                    args: [{ int: '3' }, { string: 'tz1OWN' }],
                },
            ],
        };

        maps[3]['tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i'] = {
            prim: 'Pair',
            args: [
                {
                    prim: 'Pair',
                    args: [[], { prim: 'Some', args: [{ bytes: e('play.necroskillz.tez') }] }],
                },
                {
                    string: 'tz1zzz',
                },
            ],
        };

        maps[1][e('necroskillz.tez')] = { string: new Date(2021, 1, 1).toISOString() };

        when(tracerMock.trace(anything(), anything()));

        when(addressBookMock.lookup(anything())).thenCall(type => Promise.resolve(`${type}addr`));

        when(conseilClientMock.storage(`${SmartContractType.NameRegistry}addr`)).thenResolve({
            prim: 'Pair',
            args: [
                {
                    prim: 'Pair',
                    args: [
                        { int: '44535' },
                        {
                            prim: 'Pair',
                            args: [
                                {
                                    prim: 'Pair',
                                    args: [
                                        {
                                            prim: 'Pair',
                                            args: [{ int: '44536' }, { int: '1' }],
                                        },
                                        {
                                            prim: 'Pair',
                                            args: [{ int: '44538' }, { string: 'tz1VBLpuDKMoJuHRLZ4HrCgRuiLpEr7zZx2E' }],
                                        },
                                    ],
                                },
                                {
                                    prim: 'Pair',
                                    args: [{ int: '2' }, { int: '3' }],
                                },
                            ],
                        },
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

        dataProvider = new ConseilTezosDomainsDataProvider(instance(conseilClientMock), instance(addressBookMock), instance(tracerMock));
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
