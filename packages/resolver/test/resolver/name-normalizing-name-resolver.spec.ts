import { Tracer } from '@tezos-domains/core';
import { NameResolver, DomainInfo, ReverseRecordDomainInfo } from '@tezos-domains/resolver';
import { mock, instance, when, anything, verify, anyString } from 'ts-mockito';
import FakePromise from 'fake-promise';

import { NameNormalizingNameResolver } from '../../src/resolver/name-normalizing-name-resolver';

describe('NameNormalizingNameResolver', () => {
    let resolver: NameNormalizingNameResolver;
    let nameResolverMock: NameResolver;
    let tracerMock: Tracer;

    let ap: Promise<string>;
    let dp: Promise<DomainInfo>;
    let rrp: Promise<ReverseRecordDomainInfo>;
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

    describe('resolveDomainRecord()', () => {
        it('should proxy call to decorated resolver', () => {
            const p = resolver.resolveDomainRecord('a');

            expect(p).toBe(dp);
        });

        it('should normalize domain name', () => {
            const p = resolver.resolveDomainRecord('AB.tez');

            verify(nameResolverMock.resolveDomainRecord('ab.tez')).called();
            expect(p).toBe(dp);
        });
    });

    describe('resolveNameToAddress()', () => {
        it('should proxy call to decorated resolver', () => {
            const p = resolver.resolveNameToAddress('a');

            expect(p).toBe(ap);
        });

        it('should normalize domain name', () => {
            const p = resolver.resolveNameToAddress('AB.tez');

            verify(nameResolverMock.resolveNameToAddress('ab.tez')).called();
            expect(p).toBe(ap);
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
