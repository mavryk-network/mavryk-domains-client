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
import MockDate from 'mockdate';

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

        storage.store.records[e('play.necroskillz.tez')] = { expiry_key: e('necroskillz.tez'), address: 'tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i' };
        storage.store.records[e('expired.tez')] = { expiry_key: e('expired.tez'), address: 'tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc' };
        storage.store.records[e('no-address.tez')] = { expiry_key: e('no-address.tez') };

        storage.store.expiry_map[e('necroskillz.tez')] = new Date(2021, 1, 1);
        storage.store.expiry_map[e('expired.tez')] = new Date(2019, 1, 1);

        storage.store.reverse_records['tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i'] = { name: e('play.necroskillz.tez'), owner: 'tz1zzz' };
        storage.store.reverse_records['tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc'] = { name: e('expired.tez'), owner: 'tz1ezz' };
        storage.store.reverse_records['tz1SdArNzLEch64rBDmMeJf23TRQ19gc4yTs'] = { name: e('orphan.tez'), owner: 'tz1aaa' };
        storage.store.reverse_records['tz1a1qfkPhNnaUGb1mNfDsUKJi23ADet7h62'] = { owner: 'tz1aaa' };

        when(tracerMock.trace(anything(), anything()));

        when(addressBookMock.lookup(anything())).thenCall(type => Promise.resolve(`${type}addr`));

        when(
            tezosClientMock.getBigMapValue(`${SmartContractType.NameRegistry}addr`, anyFunction(), anything())
        ).thenCall((_, selector, key: RpcRequestScalarData<string>) => Promise.resolve(new RpcResponseData(selector(storage)[key.encode()!])));

        MockDate.set(new Date(2020, 10, 11, 20, 0, 0));

        resolver = new BlockchainNameResolver(instance(tezosClientMock), instance(addressBookMock), instance(tracerMock));
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('resolveAddress()', () => {
        it('should resolve name', async () => {
            const address = await resolver.resolveAddress('play.necroskillz.tez');

            expect(address).toBe('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');
        });

        it('should return null if record does not exist', async () => {
            const address = await resolver.resolveAddress('404.tez');

            expect(address).toBe(null);
        });

        it('should return null if record is expired', async () => {
            const address = await resolver.resolveAddress('expired.tez');

            expect(address).toBe(null);
        });

        it('should return null if record has no address', async () => {
            const address = await resolver.resolveAddress('no-address.tez');

            expect(address).toBe(null);
        });

        it('should throw when name is null', async () => {
            await expect(() => resolver.resolveAddress(null as any)).rejects.toEqual(new Error(`Argument 'name' was not specified.`));
        });

        it('should throw when invalid name is specified', async () => {
            await expect(() => resolver.resolveAddress('invalid')).rejects.toEqual(new Error(`'invalid' is not a valid domain name.`));
        });
    });

    describe('reverseResolveName()', () => {
        it('should resolve address', async () => {
            const name = await resolver.reverseResolveName('tz1ar8HGBcd4KTcBKEFwhXDYCV6LfTjrYA7i');

            expect(name).toBe('play.necroskillz.tez');
        });

        it('should return null if reverse record does not exist', async () => {
            const name = await resolver.reverseResolveName('tz1R3iboWc7PWQsHvo9WMaJjKcp2a3wX6TjP');

            expect(name).toBe(null);
        });

        it('should return null if associated record is expired', async () => {
            const name = await resolver.reverseResolveName('tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc');

            expect(name).toBe(null);
        });

        it('should return null if associated record does not exist', async () => {
            const name = await resolver.reverseResolveName('tz1SdArNzLEch64rBDmMeJf23TRQ19gc4yTs');

            expect(name).toBe(null);
        });

        it('should return null if reverse record has no name', async () => {
            const name = await resolver.reverseResolveName('tz1a1qfkPhNnaUGb1mNfDsUKJi23ADet7h62');

            expect(name).toBe(null);
        });

        it('should throw when address is null', async () => {
            await expect(() => resolver.reverseResolveName(null as any)).rejects.toEqual(new Error(`Argument 'address' was not specified.`));
        });

        it('should throw when invalid address is specified', async () => {
            await expect(() => resolver.reverseResolveName('invalid')).rejects.toEqual(new Error(`'invalid' is not a valid address.`));
        });
    });
});
