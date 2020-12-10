import { LatinDomainNameValidator, StandardRecordMetadataKey } from '@tezos-domains/core';
import { TaquitoTezosDomainsClient } from '@tezos-domains/taquito-client';
import { ConseilTezosDomainsClient } from '@tezos-domains/conseil-client';
import { TezosToolkit } from '@taquito/taquito';
import { NameResolver } from '@tezos-domains/resolver';
import fetch from 'node-fetch';
import * as log from 'loglevel';

import { DATA, CONFIG } from '../data';
import { registerFetch, registerLogger } from 'conseiljs';

interface TestCase {
    description: string;
    from: string;
    to: string | null;
}

describe('resolver', () => {
    beforeAll(() => {
        jest.setTimeout(30 * 60 * 1000);
    });

    describe('taquito-client', () => {
        testResolver(() => {
            const tezos = new TezosToolkit(CONFIG.rpcUrl);

            const client = new TaquitoTezosDomainsClient({
                network: CONFIG.network,
                tezos,
                caching: { enabled: true },
            });

            client.validator.addSupportedTld('test', LatinDomainNameValidator);

            return client.resolver;
        });
    });

    describe('conseil-client', () => {
        testResolver(() => {
            const logger = log.getLogger('conseiljs');
            logger.setLevel('silent', false);
            registerLogger(logger);
            registerFetch(fetch);

            const client = new ConseilTezosDomainsClient({
                network: CONFIG.network,
                conseil: { server: CONFIG.rpcUrl },
                caching: { enabled: true },
            });

            client.validator.addSupportedTld('test', LatinDomainNameValidator);

            return client.resolver;
        });
    });

    function testResolver(resolverFactory: () => NameResolver) {
        let resolver: NameResolver;

        beforeAll(() => {
            resolver = resolverFactory();
        });

        describe('resolveDomainRecord()', () => {
            it('should resolve all properties of record', async () => {
                const record = await resolver.resolveDomainRecord(DATA.ok.name);

                expect(record!.address).toBe(DATA.ok.address);
                expect(record!.owner).toBe(DATA.ok.address);
                expect(record!.expiry).toBeInstanceOf(Date);
                expect(record!.data.getJson(StandardRecordMetadataKey.TTL)).toBe(420);
            });
        });

        describe('resolveNameToAddress()', () => {
            it('resolve multiple at once', async () => {
                const x = await Promise.all([DATA.ok.name, DATA.noExpiration.name].map(a => resolver.resolveNameToAddress(a)));

                expect(x[0]).toBe(DATA.ok.address);
                expect(x[1]).toBe(DATA.noExpiration.address);
            });

            const TEST_CASES: TestCase[] = [
                { description: 'should resolve address', from: DATA.ok.name, to: DATA.ok.address },
                { description: 'should normalize and resolve address', from: DATA.ok.name.toUpperCase(), to: DATA.ok.address },
                { description: 'should return null for expired address', from: DATA.expired.name, to: null },
                { description: 'should return null for non existent address', from: '404.test', to: null },
                { description: 'should resolve address for infinite validity record', from: DATA.noExpiration.name, to: DATA.noExpiration.address },
                { description: 'should return null for a record with null address', from: DATA.emptyAddress.name, to: null },
                { description: 'should return null for tld', from: 'test', to: null },
            ];

            TEST_CASES.forEach(t => {
                // eslint-disable-next-line jest/valid-title
                it(t.description, async () => {
                    const address = await resolver.resolveNameToAddress(t.from);

                    expect(address).toBe(t.to);
                });
            });
        });

        describe('resolveReverseRecord()', () => {
            it('should resolve all properties of record', async () => {
                const record = await resolver.resolveReverseRecord(DATA.ok.address);

                expect(record!.name).toBe(DATA.ok.name);
                expect(record!.owner).toBe(DATA.ok.address);
                expect(record!.data.getJson(StandardRecordMetadataKey.TTL)).toBe(69);
            });
        });

        describe('resolveAddressToName()', () => {
            it('resolve multiple at once', async () => {
                const x = await Promise.all([DATA.ok.address, DATA.noExpiration.address].map(a => resolver.resolveAddressToName(a)));

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
                // eslint-disable-next-line jest/valid-title
                it(t.description, async () => {
                    const name = await resolver.resolveAddressToName(t.from);

                    expect(name).toBe(t.to);
                });
            });
        });
    }
});
