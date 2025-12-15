import { getTld, getLabel, getParent, stripTld, getLevel } from '@mavrykdynamics/mavryk-domains-core';

describe('domains', () => {
    describe('getTld()', () => {
        it('should get tld of domain name', () => {
            expect(getTld('mav')).toBe('mav');
            expect(getTld('necroskillz.mav')).toBe('mav');
            expect(getTld('play.necroskillz.mav')).toBe('mav');
        });
    });

    describe('getLabel()', () => {
        it('should get label of domain name', () => {
            expect(getLabel('mav')).toBe('');
            expect(getLabel('necroskillz.mav')).toBe('necroskillz');
            expect(getLabel('play.necroskillz.mav')).toBe('play');
        });
    });

    describe('getParent()', () => {
        it('should get parent of domain name', () => {
            expect(getParent('mav')).toBe('');
            expect(getParent('necroskillz.mav')).toBe('mav');
            expect(getParent('play.necroskillz.mav')).toBe('necroskillz.mav');
        });
    });

    describe('stripTld()', () => {
        it('should get parent of domain name', () => {
            expect(stripTld('mav')).toBe('');
            expect(stripTld('.mav')).toBe('');
            expect(stripTld('necroskillz.mav')).toBe('necroskillz');
            expect(stripTld('play.necroskillz.mav')).toBe('play.necroskillz');
        });
    });

    describe('getLevel()', () => {
        it('should level of domain', () => {
            expect(getLevel('mav')).toBe(1);
            expect(getLevel('necroskillz.mav')).toBe(2);
            expect(getLevel('play.necroskillz.mav')).toBe(3);
        });
    });
});
