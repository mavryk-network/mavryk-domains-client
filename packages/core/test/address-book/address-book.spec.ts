import { AddressBook, SmartContractType } from '@tezos-domains/core';

import { BuiltInAddresses } from '../../src/address-book/built-in-addresses';

describe('AddressBook', () => {
    let addressBook: AddressBook;

    it('should resolve built-in addresses for mainnet', async () => {
        addressBook = new AddressBook();

        await expect(addressBook.lookup(SmartContractType.NameRegistry)).resolves.toBe(BuiltInAddresses.mainnet.nameRegistry);
        await expect(addressBook.lookup(SmartContractType.TLDRegistrar, 'tez')).resolves.toBe(BuiltInAddresses.mainnet['tldRegistrar:tez']);
    });

    it('should resolve built-in addresses for carthagenet', async () => {
        addressBook = new AddressBook({ network: 'carthagenet' });

        await expect(addressBook.lookup(SmartContractType.NameRegistry)).resolves.toBe(BuiltInAddresses.carthagenet.nameRegistry);
        await expect(addressBook.lookup(SmartContractType.NameRegistry, 'set_child_record')).resolves.toBe(BuiltInAddresses.carthagenet['nameRegistry:set_child_record']);
        await expect(addressBook.lookup(SmartContractType.TLDRegistrar, 'tez')).resolves.toBe(BuiltInAddresses.carthagenet['tldRegistrar:tez']);
        await expect(addressBook.lookup(SmartContractType.TLDRegistrar, 'tez', 'buy')).resolves.toBe(BuiltInAddresses.carthagenet['tldRegistrar:tez:buy']);
    });

    it('should resolve custom addresses', async () => {
        addressBook = new AddressBook({ network: 'custom', contractAddresses: { nameRegistry: 'custom_nr' } });

        await expect(addressBook.lookup(SmartContractType.NameRegistry)).resolves.toBe('custom_nr');
    });

    it('should disregarding network when resolving custom addresses', async () => {
        addressBook = new AddressBook({ network: 'carthagenet', contractAddresses: { nameRegistry: 'custom_nr' } });

        await expect(addressBook.lookup(SmartContractType.NameRegistry)).resolves.toBe('custom_nr');
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

        it('should throw if address for type is not found', async () => {
            await expect(addressBook.lookup('???' as SmartContractType)).rejects.toEqual(new Error('Address for contract ??? is not configured.'));
        });

        it('should throw if tld registrar address is not found for specified tld', async () => {
            await expect(addressBook.lookup(SmartContractType.TLDRegistrar, '???')).rejects.toEqual(new Error('Address for contract tldRegistrar:??? is not configured.'));
        });

        it('should throw if tld registrar tld is not specified', async () => {
            await expect(addressBook.lookup(SmartContractType.TLDRegistrar)).rejects.toEqual(new Error("Lookup of address for type tldRegistrar requires at least 1 parameter(s)."));
        });
    });
});
