import { getTld, getLabel, getParent, stripTld, getLevel } from '@tezos-domains/core';

describe('domains', () => {
    describe('getTld()', () => {
        it('should get tld of domain name', () => {
            expect(getTld('tez')).toBe('tez');
            expect(getTld('necroskillz.tez')).toBe('tez');
            expect(getTld('play.necroskillz.tez')).toBe('tez');
        });
    });

    describe('getLabel()', () => {
        it('should get label of domain name', () => {
            expect(getLabel('tez')).toBe('');
            expect(getLabel('necroskillz.tez')).toBe('necroskillz');
            expect(getLabel('play.necroskillz.tez')).toBe('play');
        });
    });

    describe('getParent()', () => {
        it('should get parent of domain name', () => {
            expect(getParent('tez')).toBe('');
            expect(getParent('necroskillz.tez')).toBe('tez');
            expect(getParent('play.necroskillz.tez')).toBe('necroskillz.tez');
        });
    });

    describe('stripTld()', () => {
        it('should get parent of domain name', () => {
            expect(stripTld('tez')).toBe('');
            expect(stripTld('.tez')).toBe('');
            expect(stripTld('necroskillz.tez')).toBe('necroskillz');
            expect(stripTld('play.necroskillz.tez')).toBe('play.necroskillz');
        });
    });

    describe('getLevel()', () => {
        it('should level of domain', () => {
            expect(getLevel('tez')).toBe(1);
            expect(getLevel('necroskillz.tez')).toBe(2);
            expect(getLevel('play.necroskillz.tez')).toBe(3);
        });
    });
});
