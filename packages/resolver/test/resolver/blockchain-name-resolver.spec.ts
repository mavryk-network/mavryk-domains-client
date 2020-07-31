import {
    TezosProxyClient,
    SmartContractType,
    Exact,
    DomainRecord,
    ReverseRecord,
    RpcRequestScalarData,
    RpcResponseData,
    Tracer,
    BytesEncoder,
} from '@tezos-domains/core';
import { NameResolver, BlockchainNameResolver } from '@tezos-domains/resolver';
import { mock, when, anyFunction, anything, instance } from 'ts-mockito';
import MockDate from 'mockdate';

interface FakeNameRegistryStorage {
    records: Record<string, Pick<DomainRecord, 'validity_key' | 'address'>>;
    reverse_records: Record<string, Exact<ReverseRecord>>;
    validity_map: Record<string, Date>;
}

const e = (s: string) => new BytesEncoder().encode(s)!;

describe('Resolver', () => {
    let resolver: NameResolver;
    let tezosProxyClientMock: TezosProxyClient;
    let tracerMock: Tracer;

    const storage: FakeNameRegistryStorage = {
        records: {},
        validity_map: {},
        reverse_records: {},
    };

    beforeEach(() => {
        tezosProxyClientMock = mock(TezosProxyClient);
        tracerMock = mock<Tracer>();

        storage.records[e('play.necroskillz.tez')] = { validity_key: e('necroskillz.tez'), address: 'tz1xxx' };
        storage.records[e('expired.tez')] = { validity_key: e('expired.tez'), address: 'tz1eee' };
        storage.records[e('no-address.tez')] = { validity_key: e('no-address.tez') };

        storage.validity_map[e('necroskillz.tez')] = new Date(2021, 1, 1);
        storage.validity_map[e('expired.tez')] = new Date(2019, 1, 1);

        storage.reverse_records['tz1xxx'] = { name: e('play.necroskillz.tez'), owner: 'tz1zzz' };
        storage.reverse_records['tz1eee'] = { name: e('expired.tez'), owner: 'tz1ezz' };
        storage.reverse_records['orphan'] = { name: e('orphan.tez'), owner: 'tz1aaa' };
        storage.reverse_records['no-name'] = { owner: 'tz1aaa' };

        when(tracerMock.trace(anything()));
        when(tracerMock.trace(anything(), anything()));

        when(
            tezosProxyClientMock.getBigMapValue(SmartContractType.NameRegistry, anyFunction(), anything())
        ).thenCall((_, selector, key: RpcRequestScalarData<string>) => Promise.resolve(new RpcResponseData(selector(storage)[key.encode()!])));

        MockDate.set(new Date(2020, 10, 11, 20, 0, 0));

        resolver = new BlockchainNameResolver(instance(tezosProxyClientMock), instance(tracerMock));
    });

    afterEach(() => {
        MockDate.reset();
    });

    describe('resolve()', () => {
        it('should resolve name', async () => {
            const address = await resolver.resolve('play.necroskillz.tez');

            expect(address).toBe('tz1xxx');
        });

        it('should return null if record does not exist', async () => {
            const address = await resolver.resolve('404.tez');

            expect(address).toBe(null);
        });

        it('should return null if record is expired', async () => {
            const address = await resolver.resolve('expired.tez');

            expect(address).toBe(null);
        });

        it('should return null if record has no address', async () => {
            const address = await resolver.resolve('no-address.tez');

            expect(address).toBe(null);
        });

        it('should throw when name is null', async () => {
            await expect(() => resolver.resolve(null as any)).rejects.toEqual(new Error(`Argument 'name' was not specified.`));
        });
    });

    describe('reverseResolve()', () => {
        it('should resolve address', async () => {
            const name = await resolver.reverseResolve('tz1xxx');

            expect(name).toBe('play.necroskillz.tez');
        });

        it('should return null if reverse record does not exist', async () => {
            const name = await resolver.reverseResolve('404');

            expect(name).toBe(null);
        });

        it('should return null if associated record is expired', async () => {
            const name = await resolver.reverseResolve('tz1eee');

            expect(name).toBe(null);
        });

        it('should return null if associated record does not exist', async () => {
            const name = await resolver.reverseResolve('orphan');

            expect(name).toBe(null);
        });

        it('should return null if reverse record has no name', async () => {
            const name = await resolver.reverseResolve('no-name');

            expect(name).toBe(null);
        });

        it('should throw when address is null', async () => {
            await expect(() => resolver.reverseResolve(null as any)).rejects.toEqual(new Error(`Argument 'address' was not specified.`));
        });
    });
});
