import { DomainsManager, UnsupportedDomainsManager } from '@tezos-domains/manager';
import { RecordMetadata } from '@tezos-domains/core';

describe('UnsupportedDomainsManager', () => {
    let resolver: DomainsManager;

    beforeEach(() => {
        resolver = new UnsupportedDomainsManager();
    })

    describe('bid()', () => {
        it('should return throw', () => {
            expect(() => resolver.bid('tez', { label: 'necroskillz', bid: 2 })).toThrowError();
        });
    });

    describe('buy()', () => {
        it('should return throw', () => {
            expect(() => resolver.buy('tez', { label: 'necroskillz', owner: 'tz1xxx', address: null, data: new RecordMetadata(), duration: 365, nonce: 1 })).toThrowError();
        });
    });

    describe('claimReverseRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.claimReverseRecord({ owner: 'tz1xxx', name: 'necroskillz.tez', data: new RecordMetadata() })).toThrowError();
        });
    });

    describe('commit()', () => {
        it('should return throw', () => {
            expect(() => resolver.commit('tez', { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 })).toThrowError();
        });
    });

    describe('getAcquisitionInfo()', () => {
        it('should return throw', () => {
            expect(() => resolver.getAcquisitionInfo('necroskillz.tez')).toThrowError();
        });
    });

    describe('getBidderBalance()', () => {
        it('should return throw', () => {
            expect(() => resolver.getBidderBalance('tez', 'tz1xxx')).toThrowError();
        });
    });

    describe('getCommitment()', () => {
        it('should return throw', () => {
            expect(() => resolver.getCommitment('tez', { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 })).toThrowError();
        });
    });

    describe('renew()', () => {
        it('should return throw', () => {
            expect(() => resolver.renew('tez', { label: 'necroskillz', duration: 365 })).toThrowError();
        });
    });

    describe('setChildRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.setChildRecord({ label: 'necroskillz', parent: 'tez', owner: 'tz1xxx', address: null, data: new RecordMetadata(), expiry: null })).toThrowError();
        });
    });

    describe('settle()', () => {
        it('should return throw', () => {
            expect(() => resolver.settle('tez', { label: 'necroskillz', owner: 'tz1xxx', address: null, data: new RecordMetadata() })).toThrowError();
        });
    });

    describe('updateRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.updateRecord({ name: 'necroskillz.tez', owner: 'tz1xxx', address: null, data: new RecordMetadata() })).toThrowError();
        });
    });

    describe('updateReverseRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.updateReverseRecord({ name: 'necroskillz.tez', owner: 'tz1xxx', data: new RecordMetadata(), address: 'tz1yyy' })).toThrowError();
        });
    });

    describe('withdraw()', () => {
        it('should return throw', () => {
            expect(() => resolver.withdraw('tez', 'tz1xxx')).toThrowError();
        });
    });
});