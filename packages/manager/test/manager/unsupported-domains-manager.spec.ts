import { DomainsManager, UnsupportedDomainsManager } from '@mavrykdynamics/mavryk-domains-manager';
import { NotSupportedError, RecordMetadata } from '@mavrykdynamics/mavryk-domains-core';

describe('UnsupportedDomainsManager', () => {
    let resolver: DomainsManager;

    beforeEach(() => {
        resolver = new UnsupportedDomainsManager();
    })

    describe('bid()', () => {
        it('should return throw', () => {
            expect(() => resolver.bid('mav', { label: 'necroskillz', bid: 2 })).toThrow(NotSupportedError);
        });
    });

    describe('buy()', () => {
        it('should return throw', () => {
            expect(() => resolver.buy('mav', { label: 'necroskillz', owner: 'mv1xxx', address: null, data: new RecordMetadata(), duration: 365, nonce: 1 })).toThrow(NotSupportedError);
        });
    });

    describe('claimReverseRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.claimReverseRecord({ owner: 'mv1xxx', name: 'necroskillz.mav' })).toThrow(NotSupportedError);
        });
    });

    describe('commit()', () => {
        it('should return throw', () => {
            expect(() => resolver.commit('mav', { label: 'necroskillz', owner: 'mv1xxx', nonce: 1 })).toThrow(NotSupportedError);
        });
    });

    describe('getAcquisitionInfo()', () => {
        it('should return throw', () => {
            expect(() => resolver.getAcquisitionInfo('necroskillz.mav')).toThrow(NotSupportedError);
        });
    });

    describe('getBidderBalance()', () => {
        it('should return throw', () => {
            expect(() => resolver.getBidderBalance('mav', 'mv1xxx')).toThrow(NotSupportedError);
        });
    });

    describe('getCommitment()', () => {
        it('should return throw', () => {
            expect(() => resolver.getCommitment('mav', { label: 'necroskillz', owner: 'mv1xxx', nonce: 1 })).toThrow(NotSupportedError);
        });
    });

    describe('getTldConfiguration()', () => {
        it('should return throw', () => {
            expect(() => resolver.getTldConfiguration('mav')).toThrow(NotSupportedError);
        });
    });

    describe('renew()', () => {
        it('should return throw', () => {
            expect(() => resolver.renew('mav', { label: 'necroskillz', duration: 365 })).toThrow(NotSupportedError);
        });
    });

    describe('setChildRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.setChildRecord({ label: 'necroskillz', parent: 'mav', owner: 'mv1xxx', address: null, data: new RecordMetadata(), expiry: null })).toThrow(NotSupportedError);
        });
    });

    describe('settle()', () => {
        it('should return throw', () => {
            expect(() => resolver.settle('mav', { label: 'necroskillz', owner: 'mv1xxx', address: null, data: new RecordMetadata() })).toThrow(NotSupportedError);
        });
    });

    describe('updateRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.updateRecord({ name: 'necroskillz.mav', owner: 'mv1xxx', address: null, data: new RecordMetadata() })).toThrow(NotSupportedError);
        });
    });

    describe('updateReverseRecord()', () => {
        it('should return throw', () => {
            expect(() => resolver.updateReverseRecord({ name: 'necroskillz.mav', owner: 'mv1xxx', address: 'mv1yyy' })).toThrow(NotSupportedError);
        });
    });

    describe('withdraw()', () => {
        it('should return throw', () => {
            expect(() => resolver.withdraw('mav', 'mv1xxx')).toThrow(NotSupportedError);
        });
    });

    describe('getTokenId()', () => {
        it('should return throw', () => {
            expect(() => resolver.getTokenId('alice.mav')).toThrow(NotSupportedError);
        });
    });

    describe('transfer()', () => {
        it('should return throw', () => {
            expect(() => resolver.transfer('alice.mav', 'mv1xxx')).toThrow(NotSupportedError);
        });
    });

    describe('batch()', () => {
        it('should return throw', () => {
            expect(() => resolver.batch(() => Promise.resolve([]))).toThrow(NotSupportedError);
        });
    });
});