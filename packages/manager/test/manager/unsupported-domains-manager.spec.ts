import { DomainsManager, UnsupportedDomainsManager } from '@tezos-domains/manager';
import { NotSupportedError, RecordMetadata } from '@tezos-domains/core';

describe('UnsupportedDomainsManager', () => {
    let resolver: DomainsManager;

    beforeEach(() => {
        resolver = new UnsupportedDomainsManager();
    })

    describe('bid()', () => {
        it('should return throw', () => {
            expect(() => resolver.bid('tez', { label: 'necroskillz', bid: 2 })).toThrowError(NotSupportedError);
        });
    });

    describe('buy()', () => {
        it('should return throw', () => {
            expect(() => resolver.buy('tez', { label: 'necroskillz', owner: 'tz1xxx', address: null, data: new RecordMetadata(), duration: 365, nonce: 1 })).toThrowError(NotSupportedError);
        });
    });

    describe('claimReverseRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.claimReverseRecord({ owner: 'tz1xxx', name: 'necroskillz.tez' })).toThrowError(NotSupportedError);
        });
    });

    describe('commit()', () => {
        it('should return throw', () => {
            expect(() => resolver.commit('tez', { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 })).toThrowError(NotSupportedError);
        });
    });

    describe('getAcquisitionInfo()', () => {
        it('should return throw', () => {
            expect(() => resolver.getAcquisitionInfo('necroskillz.tez')).toThrowError(NotSupportedError);
        });
    });

    describe('getBidderBalance()', () => {
        it('should return throw', () => {
            expect(() => resolver.getBidderBalance('tez', 'tz1xxx')).toThrowError(NotSupportedError);
        });
    });

    describe('getCommitment()', () => {
        it('should return throw', () => {
            expect(() => resolver.getCommitment('tez', { label: 'necroskillz', owner: 'tz1xxx', nonce: 1 })).toThrowError(NotSupportedError);
        });
    });

    describe('getTldConfiguration()', () => {
        it('should return throw', () => {
            expect(() => resolver.getTldConfiguration('tez')).toThrowError(NotSupportedError);
        });
    });

    describe('renew()', () => {
        it('should return throw', () => {
            expect(() => resolver.renew('tez', { label: 'necroskillz', duration: 365 })).toThrowError(NotSupportedError);
        });
    });

    describe('setChildRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.setChildRecord({ label: 'necroskillz', parent: 'tez', owner: 'tz1xxx', address: null, data: new RecordMetadata(), expiry: null })).toThrowError(NotSupportedError);
        });
    });

    describe('settle()', () => {
        it('should return throw', () => {
            expect(() => resolver.settle('tez', { label: 'necroskillz', owner: 'tz1xxx', address: null, data: new RecordMetadata() })).toThrowError(NotSupportedError);
        });
    });

    describe('updateRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.updateRecord({ name: 'necroskillz.tez', owner: 'tz1xxx', address: null, data: new RecordMetadata() })).toThrowError(NotSupportedError);
        });
    });

    describe('updateReverseRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.updateReverseRecord({ name: 'necroskillz.tez', owner: 'tz1xxx', address: 'tz1yyy' })).toThrowError(NotSupportedError);
        });
    });

    describe('withdraw()', () => {
        it('should return throw', () => {
            expect(() => resolver.withdraw('tez', 'tz1xxx')).toThrowError(NotSupportedError);
        });
    });

    describe('getTokenId()', () => {
        it('should return throw', () => {
            expect(() => resolver.getTokenId('alice.tez')).toThrowError(NotSupportedError);
        });
    });

    describe('transfer()', () => {
        it('should return throw', () => {
            expect(() => resolver.transfer('alice.tez', 'tz1xxx')).toThrowError(NotSupportedError);
        });
    });

    describe('batch()', () => {
        it('should return throw', () => {
            expect(() => resolver.batch(() => Promise.resolve([]))).toThrowError(NotSupportedError);
        });
    });
});