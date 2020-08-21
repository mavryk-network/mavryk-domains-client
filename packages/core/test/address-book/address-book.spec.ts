import { AddressBook, SmartContractType } from '@tezos-domains/core';

import { BuiltInAddresses } from '../../src/address-book/built-in-addresses';

describe('AddressBook', () => {
    let addressBook: AddressBook;

    it('should resolve built-in addresses for mainnet', () => {
        addressBook = new AddressBook();

        expect(addressBook.lookup(SmartContractType.NameRegistry)).toBe(BuiltInAddresses.mainnet.nameRegistry);
        expect(addressBook.lookup(SmartContractType.TLDRegistrar, 'tez')).toBe(BuiltInAddresses.mainnet['tldRegistrar:tez']);
    });

    it('should resolve built-in addresses for carthagenet', () => {
        addressBook = new AddressBook({ network: 'carthagenet' });

        expect(addressBook.lookup(SmartContractType.NameRegistry)).toBe(BuiltInAddresses.carthagenet.nameRegistry);
        expect(addressBook.lookup(SmartContractType.NameRegistry, 'set_child_record')).toBe(BuiltInAddresses.carthagenet['nameRegistry:set_child_record']);
        expect(addressBook.lookup(SmartContractType.TLDRegistrar, 'tez')).toBe(BuiltInAddresses.carthagenet['tldRegistrar:tez']);
        expect(addressBook.lookup(SmartContractType.TLDRegistrar, 'tez', 'buy')).toBe(BuiltInAddresses.carthagenet['tldRegistrar:tez:buy']);
    });

    it('should resolve custom addresses', () => {
        addressBook = new AddressBook({ network: 'custom', contractAddresses: { nameRegistry: 'custom_nr', tldRegistrar: 'custom_tld' } });

        expect(addressBook.lookup(SmartContractType.NameRegistry)).toBe('custom_nr');
    });

    it('should disregarding network when resolving custom addresses', () => {
        addressBook = new AddressBook({ network: 'carthagenet', contractAddresses: { nameRegistry: 'custom_nr', tldRegistrar: 'custom_tld' } });

        expect(addressBook.lookup(SmartContractType.NameRegistry)).toBe('custom_nr');
    });

    it('should throw when no addresses are specified for custom network', () => {
        expect(() => new AddressBook({ network: 'custom' } as any)).toThrowError();
    });

    it('should when unknown option network is specified', () => {
        expect(() => new AddressBook({ network: 'blehnet' as any })).toThrowError();
    });

    describe('lookup()', () => {
        beforeEach(() => {
            addressBook = new AddressBook();
        });

        it('should throw if address for type is not found', () => {
            expect(() => addressBook.lookup('???' as SmartContractType)).toThrowError('Address for contract ??? is not configured.');
        });

        it('should throw if tld registrar address is not found for specified tld', () => {
            expect(() => addressBook.lookup(SmartContractType.TLDRegistrar, '???')).toThrowError('Address for contract tldRegistrar:??? is not configured.');
        });

        it('should throw if tld registrar tld is not specified', () => {
            expect(() => addressBook.lookup(SmartContractType.TLDRegistrar)).toThrowError(/requires at least 1 parameter/);
        });
    });
});
