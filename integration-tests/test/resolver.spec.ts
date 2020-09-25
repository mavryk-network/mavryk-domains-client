import { SupportedTLDs, DomainNameValidators, AlphanumericWithHyphenDomainNameValidator, StandardRecordMetadataKey } from '@tezos-domains/core';
import { TezosDomainsClient } from '@tezos-domains/client';
import { TezosToolkit } from '@taquito/taquito';

import { DATA } from '../data';

interface TestCase {
    description: string;
    from: string;
    to: string | null;
}

describe('resolver', () => {
    let client: TezosDomainsClient;

    beforeAll(() => {
        const tezos = new TezosToolkit();
        tezos.setRpcProvider(process.env.TD_RPC_URL || 'https://testnet-tezos.giganode.io');

        SupportedTLDs.push('test');
        DomainNameValidators['test'] = AlphanumericWithHyphenDomainNameValidator;

        client = new TezosDomainsClient({ network: 'carthagenet', tezos, caching: { enabled: true } });
    });

    describe('resolve()', () => {
        it('should resolve all properties of record', async () => {
            const record = await client.resolver.resolve(DATA.ok.name);

            expect(record!.address).toBe(DATA.ok.address);
            expect(record!.owner).toBe(DATA.ok.address);
            expect(record!.level).toBe(2);
            expect(record!.expiry_key).toBe(DATA.ok.name);
            expect(record!.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
        });
    });

    describe('resolveAddress()', () => {
        it('resolve multiple at once', async () => {
            const x = await Promise.all([DATA.ok.name, DATA.noExpiration.name].map(a => client.resolver.resolveAddress(a)));

            expect(x[0]).toBe(DATA.ok.address);
            expect(x[1]).toBe(DATA.noExpiration.address);
        });


        const TEST_CASES: TestCase[] = [
            { description: 'should resolve address', from: DATA.ok.name, to: DATA.ok.address },
            { description: 'should return null for expired address', from: DATA.expired.name, to: null },
            { description: 'should return null for non existent address', from: '404.test', to: null },
            { description: 'should resolve address for infinite validity record', from: DATA.noExpiration.name, to: DATA.noExpiration.address },
            { description: 'should return null for a record with null address', from: DATA.emptyAddress.name, to: null },
            { description: 'should return null for tld', from: 'test', to: null },
        ];

        TEST_CASES.forEach(t => {
            it(t.description, async () => {
                const address = await client.resolver.resolveAddress(t.from);

                expect(address).toBe(t.to);
            });
        });
    });

    describe('reverseResolve()', () => {
        it('should resolve all properties of record', async () => {
            const record = await client.resolver.reverseResolve(DATA.ok.address);

            expect(record!.name).toBe(DATA.ok.name);
            expect(record!.owner).toBe(DATA.ok.address);
            expect(record!.data.getJson(StandardRecordMetadataKey.TTL)).toBe(69);
        });
    });

    describe('reverseResolveName()', () => {
        it('resolve multiple at once', async () => {
            const x = await Promise.all([DATA.ok.address, DATA.noExpiration.address].map(a => client.resolver.reverseResolveName(a)));

            expect(x[0]).toBe(DATA.ok.name);
            expect(x[1]).toBe(DATA.noExpiration.name);
        });

        const TEST_CASES: TestCase[] = [
            { description: 'should resolve name', from: DATA.ok.address, to: DATA.ok.name },
            { description: 'should return null for non existent reverse record', from: DATA.expired.address, to: null },
            { description: 'should return null reverse record with expired record', from: 'tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc', to: null },
            { description: 'should resolve name for infinite validity record', from: DATA.noExpiration.address, to: DATA.noExpiration.name },
            { description: 'should return null for empty reverse record', from: DATA.emptyReverseRecord.address, to: null },
        ];

        TEST_CASES.forEach(t => {
            it(t.description, async () => {
                const name = await client.resolver.reverseResolveName(t.from);

                expect(name).toBe(t.to);
            });
        });
    });
});
