import { normalizeDomainName } from '@mavrykdynamics/mavryk-domains-core';

describe('normalizeDomainName', () => {
    const TEST_CASES: { description: string; input: string; normalized: string }[] = [
        { description: 'unchanged', input: 'lol-wtf.mav', normalized: 'lol-wtf.mav' },
        { description: 'upper case', input: 'Bla.mav', normalized: 'bla.mav' },
        { description: 'unicode uppercase', input: 'ŘEPKA.mav', normalized: 'řepka.mav' },
        { description: 'keep unicode', input: 'öbb.mav', normalized: 'öbb.mav' },
        { description: 'keep punycode', input: 'xn-bb-eka.mav', normalized: 'xn-bb-eka.mav' },
        { description: 'keep japanese', input: 'クソ食らえ.mav', normalized: 'クソ食らえ.mav' },
    ];

    TEST_CASES.forEach(test => {
        it(`should normalize domain name: ${test.description}`, () => {
            expect(normalizeDomainName(test.input)).toBe(test.normalized);
        });
    });
});
