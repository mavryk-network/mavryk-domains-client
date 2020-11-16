import { normalizeDomainName } from '@tezos-domains/core';

describe('normalizeDomainName', () => {
    const TEST_CASES: { description: string; input: string; normalized: string }[] = [
        { description: 'unchanged', input: 'lol-wtf.tez', normalized: 'lol-wtf.tez' },
        { description: 'upper case', input: 'Bla.tez', normalized: 'bla.tez' },
        { description: 'unicode uppercase', input: 'ŘEPKA.TEZ', normalized: 'řepka.tez' },
        { description: 'keep unicode', input: 'öbb.tez', normalized: 'öbb.tez' },
        { description: 'keep punycode', input: 'xn-bb-eka.tez', normalized: 'xn-bb-eka.tez' },
        { description: 'keep japanese', input: 'クソ食らえ.tez', normalized: 'クソ食らえ.tez' },
    ];

    TEST_CASES.forEach(test => {
        it(`should normalize domain name: ${test.description}`, () => {
            expect(normalizeDomainName(test.input)).toBe(test.normalized);
        });
    });
});
