import { SupportedTLDs, DomainNameValidators, AlphanumericWithHyphenDomainNameValidator } from '@tezos-domains/core';
import { TezosDomainsResolver } from '@tezos-domains/resolver';
import { TezosToolkit } from '@taquito/taquito';
import { DATA } from '../data';

interface TestCase {
    description: string;
    from: string;
    to: string | null;
}

describe('resolver', () => {
    let resolver: TezosDomainsResolver;

    beforeAll(() => {
        const tezos = new TezosToolkit();
        tezos.setRpcProvider(process.env.TD_RPC_URL);

        SupportedTLDs.push('test');
        DomainNameValidators['test'] = AlphanumericWithHyphenDomainNameValidator;

        resolver = new TezosDomainsResolver({ network: 'carthagenet', tezos });
    });

    describe('resolve()', () => {
        const TEST_CASES: TestCase[] = [
            { description: 'should resolve address', from: DATA.ok.name, to: DATA.ok.address },
            { description: 'should return null for expired address', from: DATA.expired.name, to: null },
            { description: 'should return null for non existent address', from: '404.test', to: null },
            { description: 'should resolve address for infinite validity record', from: DATA.noExpiration.name, to: DATA.noExpiration.address },
            { description: 'should return null for a record with null address', from: DATA.emptyAddress.name, to: null },
        ];

        TEST_CASES.forEach(t => {
            it(t.description, async () => {
                const address = await resolver.resolve(t.from);

                expect(address).toBe(t.to);
            });
        });
    });

    describe('reverseResolve()', () => {
        const TEST_CASES: TestCase[] = [
            { description: 'should resolve name', from: DATA.ok.address, to: DATA.ok.name },
            { description: 'should return null for non existent reverse record', from: DATA.expired.address, to: null },
            { description: 'should return null reverse record with expired record', from: 'tz1NXtvKxbCpWkSmHSAirdxzPbQgicTFwWyc', to: null },
            { description: 'should resolve name for infinite validity record', from: DATA.noExpiration.address, to: DATA.noExpiration.name },
            { description: 'should return null for empty reverse record', from: DATA.emptyReverseRecord.address, to: null },
        ];

        TEST_CASES.forEach(t => {
            it(t.description, async () => {
                const name = await resolver.reverseResolve(t.from);

                expect(name).toBe(t.to);
            });
        });
    });
});
