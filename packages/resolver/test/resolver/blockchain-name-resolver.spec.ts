import {
    SmartContractType,
    DomainRecord,
    ReverseRecord,
    RpcRequestScalarData,
    RpcResponseData,
    Tracer,
    BytesEncoder,
    AddressBook,
    TezosClient,
} from '@tezos-domains/core';
import { NameResolver, BlockchainNameResolver } from '@tezos-domains/resolver';
import { mock, when, anyFunction, anything, instance } from 'ts-mockito';
import { StandardRecordMetadataKey, DomainNameValidator } from '@tezos-domains/core';
import { MichelsonMap } from '@taquito/taquito';
import MockDate from 'mockdate';
import BigNumber from 'bignumber.js';

interface FakeNameRegistryStorage {
    store: {
        records: Record<string, Pick<DomainRecord, 'expiry_key' | 'address'>>;
        reverse_records: Record<string, Pick<ReverseRecord, 'name' | 'owner'>>;
        expiry_map: Record<string, Date>;
    };
}

const e = (s: string) => new BytesEncoder().encode(s)!;

describe('BlockchainNameResolver', () => {
    let resolver: NameResolver;
    let tezosClientMock: TezosClient;
    let addressBookMock: AddressBook;
    let tracerMock: Tracer;
    let validator: DomainNameValidator;

    const storage: FakeNameRegistryStorage = {
        store: {
            records: {},
            expiry_map: {},
            reverse_records: {},
        },
    };

    beforeEach(() => {
        tezosClientMock = mock(TezosClient);
        addressBookMock = mock(AddressBook);
        tracerMock = mock<Tracer>();
        validator = new DomainNameValidator();

        const domainData = new MichelsonMap();
        domainData.set(StandardRecordMetadataKey.TTL, e('420'));

        storage.store.records[e('play.necroskillz.tez')] = {
            expiry_key: e('necroskillz.tez'),
            address: 'tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i',
            owner: 'tz1OWN',
            level: new BigNumber(3),
            data: domainData,
        } as any;
        storage.store.records[e('expired.tez')] = { expiry_key: e('expired.tez'), address: 'tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc' };
        storage.store.records[e('no-address.tez')] = { expiry_key: e('no-address.tez'), address: null };
        storage.store.records[e('no-expiry-key.tez')] = { expiry_key: null, address: 'tz1S8U7XJU8vj2SEyLDXH25fhLuEsk4Yr1wZ' };

        storage.store.expiry_map[e('necroskillz.tez')] = new Date(2021, 1, 1);
        storage.store.expiry_map[e('expired.tez')] = new Date(2019, 1, 1);

        const reverseRecordData = new MichelsonMap();
        reverseRecordData.set(StandardRecordMetadataKey.TTL, e('69'));

        storage.store.reverse_records['tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i'] = {
            name: e('play.necroskillz.tez'),
            owner: 'tz1zzz',
            data: reverseRecordData,
        } as any;
        storage.store.reverse_records['tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc'] = { name: e('expired.tez'), owner: 'tz1ezz' };
        storage.store.reverse_records['tz1SdArNzLEch64rBDmMeJf23TRQ19gc4yTs'] = { name: e('orphan.tez'), owner: 'tz1aaa' };
        storage.store.reverse_records['tz1S8U7XJU8vj2SEyLDXH25fhLuEsk4Yr1wZ'] = { name: e('no-expiry-key.tez'), owner: 'tz1aaa' };
        storage.store.reverse_records['tz1a1qfkPhNnaUGb1mNfDsUKJi23ADet7h62'] = { owner: 'tz1aaa' };

        when(tracerMock.trace(anything(), anything()));

        when(addressBookMock.lookup(anything())).thenCall(type => Promise.resolve(`${type}addr`));

        when(tezosClientMock.getBigMapValue(`${SmartContractType.NameRegistry}addr`, anyFunction(), anything())).thenCall(
            (_, selector, key: RpcRequestScalarData<string>) => {
                const encodedKey = key.encode();
                if (!encodedKey) {
                    throw new Error('Key must be specified.');
                }
                return Promise.resolve(new RpcResponseData(selector(storage)[encodedKey]));
            }
        );

        MockDate.set(new Date(2020, 10, 11, 20, 0, 0));

        resolver = new BlockchainNameResolver(instance(tezosClientMock), instance(addressBookMock), instance(tracerMock), validator);
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('resolveDomainRecord()', () => {
        it('should return info about a domain', async () => {
            const domain = await resolver.resolveDomainRecord('play.necroskillz.tez');

            expect(domain?.address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
            expect(domain?.expiry).toStrictEqual(new Date(2021, 1, 1));
            expect(domain?.owner).toBe('tz1OWN');
            expect(domain?.level).toBe(3);
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

            expect(reverseRecord?.name).toBe('play.necroskillz.tez');
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

        it('should throw when invalid address is specified', async () => {
            await expect(() => resolver.resolveAddressToName('invalid')).rejects.toEqual(new Error(`'invalid' is not a valid address.`));
        });
    });

    describe('clearCache()', () => {
        it('should do nothing', () => {
            expect(() => resolver.clearCache()).not.toThrow();
        });
    });
});
