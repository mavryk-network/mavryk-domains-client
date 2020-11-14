import { Tracer } from '@tezos-domains/core';
import { NameResolver, DomainInfo, ReverseRecordInfo } from '@tezos-domains/resolver';
import { mock, instance, when, anything, verify, anyString } from 'ts-mockito';
import FakePromise from 'fake-promise';

import { NameNormalizingNameResolver } from '../../src/resolver/name-normalizing-name-resolver';

describe('NameNormalizingNameResolver', () => {
    let resolver: NameNormalizingNameResolver;
    let nameResolverMock: NameResolver;
    let tracerMock: Tracer;

    let ap: Promise<string>;
    let dp: Promise<DomainInfo>;
    let rrp: Promise<ReverseRecordInfo>;
    let np: Promise<string>;

    beforeEach(() => {
        nameResolverMock = mock<NameResolver>();
        tracerMock = mock<Tracer>();

        dp = new FakePromise();
        rrp = new FakePromise();

        when(tracerMock.trace(anything()));
        when(nameResolverMock.resolveDomainRecord(anyString())).thenReturn(dp);
        when(nameResolverMock.resolveNameToAddress(anyString())).thenReturn(ap);
        when(nameResolverMock.resolveReverseRecord(anyString())).thenReturn(rrp);
        when(nameResolverMock.resolveAddressToName(anyString())).thenReturn(np);

        resolver = new NameNormalizingNameResolver(instance(nameResolverMock), instance(tracerMock));
    });

    const TEST_CASES: { description: string; input: string; normalized: string }[] = [
        { description: 'unchanged', input: 'lol-wtf.tez', normalized: 'lol-wtf.tez' },
        { description: 'upper case', input: 'Bla.tez', normalized: 'bla.tez' },
        { description: 'unicode uppercase', input: 'ŘEPKA.TEZ', normalized: 'řepka.tez' },
        { description: 'keep unicode', input: 'öbb.tez', normalized: 'öbb.tez' },
        { description: 'keep punycode', input: 'xn-bb-eka.tez', normalized: 'xn-bb-eka.tez' },
        { description: 'keep japanese', input: 'クソ食らえ.tez', normalized: 'クソ食らえ.tez' },
    ];

    describe('resolveDomainRecord()', () => {
        it('should proxy call to decorated resolver', () => {
            const p = resolver.resolveDomainRecord('a');

            expect(p).toBe(dp);
        });

        TEST_CASES.forEach(test => {
            it(`should normalize domain name: ${test.description}`, () => {
                const p = resolver.resolveDomainRecord(test.input);

                verify(nameResolverMock.resolveDomainRecord(test.normalized)).called();
                expect(p).toBe(dp);
            });
        });
    });

    describe('resolveNameToAddress()', () => {
        it('should proxy call to decorated resolver', () => {
            const p = resolver.resolveNameToAddress('a');

            expect(p).toBe(ap);
        });

        TEST_CASES.forEach(test => {
            it(`should normalize domain name: ${test.description}`, () => {
                const p = resolver.resolveNameToAddress(test.input);

                verify(nameResolverMock.resolveNameToAddress(test.normalized)).called();
                expect(p).toBe(ap);
            });
        });
    });

    describe('resolveReverseRecord()', () => {
        it('should proxy call to decorated resolver', () => {
            const p = resolver.resolveReverseRecord('a');

            expect(p).toBe(rrp);
        });
    });

    describe('resolveAddressToName()', () => {
        it('should proxy call to decorated resolver', () => {
            const p = resolver.resolveAddressToName('a');

            expect(p).toBe(np);
        });
    });

    describe('clearCache()', () => {
        // eslint-disable-next-line jest/expect-expect
        it('should proxy call to decorated resolver', () => {
            resolver.clearCache();

            verify(nameResolverMock.clearCache()).called();
        });
    });
});
