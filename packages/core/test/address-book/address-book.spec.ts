import { AddressBook, SmartContractType, TezosDomainsProxyContractAddressResolver, CustomNetworkConfig, DefaultNetworkConfig } from '@tezos-domains/core';
import { mock, instance, when, anyString } from 'ts-mockito';

import { BuiltInAddresses } from '../../src/address-book/built-in-addresses';

describe('AddressBook', () => {
    let addressBook: AddressBook;
    let contractAddressResolverMock: TezosDomainsProxyContractAddressResolver;

    beforeEach(() => {
        contractAddressResolverMock = mock<TezosDomainsProxyContractAddressResolver>();

        when(contractAddressResolverMock.getAddress(anyString())).thenCall((a: string) => Promise.resolve(a + '_actual'));
    });

    function init(config?: CustomNetworkConfig | DefaultNetworkConfig) {
        addressBook = new AddressBook(instance(contractAddressResolverMock), config);
    }

    it('should resolve built-in addresses for mainnet', async () => {
        init();

        await expect(addressBook.lookup(SmartContractType.NameRegistry)).resolves.toBe(`${BuiltInAddresses.mainnet['nameRegistry'].address}_actual`);
        await expect(addressBook.lookup(SmartContractType.NameRegistry, 'set_child_record')).resolves.toBe(
            BuiltInAddresses.mainnet['nameRegistry:set_child_record'].address
        );
        await expect(addressBook.lookup(SmartContractType.TLDRegistrar, 'tez')).resolves.toBe(`${BuiltInAddresses.mainnet['tldRegistrar:tez'].address}_actual`);
        await expect(addressBook.lookup(SmartContractType.TLDRegistrar, 'tez', 'buy')).resolves.toBe(BuiltInAddresses.mainnet['tldRegistrar:tez:buy'].address);
    });

    it('should resolve built-in addresses for ghostnet', async () => {
        init({ network: 'ghostnet' });

        await expect(addressBook.lookup(SmartContractType.NameRegistry)).resolves.toBe(`${BuiltInAddresses.ghostnet['nameRegistry'].address}_actual`);
        await expect(addressBook.lookup(SmartContractType.NameRegistry, 'set_child_record')).resolves.toBe(
            BuiltInAddresses.ghostnet['nameRegistry:set_child_record'].address
        );
        await expect(addressBook.lookup(SmartContractType.TLDRegistrar, 'gho')).resolves.toBe(
            `${BuiltInAddresses.ghostnet['tldRegistrar:gho'].address}_actual`
        );
        await expect(addressBook.lookup(SmartContractType.TLDRegistrar, 'gho', 'buy')).resolves.toBe(
            BuiltInAddresses.ghostnet['tldRegistrar:gho:buy'].address
        );
    });

    it('should resolve custom addresses', async () => {
        init({ network: 'custom', contractAddresses: { nameRegistry: { address: 'custom_nr' } }, tlds: [] });

        await expect(addressBook.lookup(SmartContractType.NameRegistry)).resolves.toBe('custom_nr');
    });

    it('should disregard network when resolving custom addresses', async () => {
        init({ network: 'ghostnet', contractAddresses: { nameRegistry: { address: 'custom_nr' } } });

        await expect(addressBook.lookup(SmartContractType.NameRegistry)).resolves.toBe('custom_nr');
    });

    it('should throw when no addresses are specified for custom network', () => {
        expect(() => init({ network: 'custom' } as any)).toThrowError();
    });

    it('should when unknown option network is specified', () => {
        expect(() => init({ network: 'blehnet' as any })).toThrowError();
    });

    describe('lookup()', () => {
        beforeEach(() => {
            init();
        });

        it('should throw if address for type is not found', async () => {
            await expect(addressBook.lookup('???' as SmartContractType)).rejects.toEqual(new Error('Address for contract ??? is not configured.'));
        });

        it('should throw if tld registrar address is not found for specified tld', async () => {
            await expect(addressBook.lookup(SmartContractType.TLDRegistrar, '???')).rejects.toEqual(
                new Error('Address for contract tldRegistrar:??? is not configured.')
            );
        });

        it('should throw if tld registrar tld is not specified', async () => {
            await expect(addressBook.lookup(SmartContractType.TLDRegistrar)).rejects.toEqual(
                new Error('Lookup of address for type tldRegistrar requires at least 1 parameter(s).')
            );
        });
    });
});
