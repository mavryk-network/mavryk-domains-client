import { ProxyAddressConfig, SmartContractType } from '@tezos-domains/core';

import { BuiltInProxyAddresses } from '../../src/proxy-contract-address-resolver/built-in-proxy-addresses';

describe('ProxyAddressConfig', () => {
    let config: ProxyAddressConfig;

    it('should resolve built-in addresses for mainnet', () => {
        config = new ProxyAddressConfig();

        expect(config.get(SmartContractType.NameRegistry)).toBe(BuiltInProxyAddresses.mainnet.nameRegistry);
        expect(config.get(`${SmartContractType.TLDRegistrar}:tez`)).toBe(BuiltInProxyAddresses.mainnet['tldRegistrar:tez']);
    });

    it('should resolve built-in addresses for carthagenet', () => {
        config = new ProxyAddressConfig({ network: 'carthagenet' });

        expect(config.get(SmartContractType.NameRegistry)).toBe(BuiltInProxyAddresses.carthagenet.nameRegistry);
        expect(config.get(`${SmartContractType.TLDRegistrar}:tez`)).toBe(BuiltInProxyAddresses.carthagenet['tldRegistrar:tez']);
    });

    it('should resolve custom addresses', () => {
        config = new ProxyAddressConfig({ network: 'custom', contractAddresses: { nameRegistry: 'custom_nr', customContract: 'customc' } });

        expect(config.get(SmartContractType.NameRegistry)).toBe('custom_nr');
        expect(config.get('customContract')).toBe('customc');
    });

    it('should disregarding network when resolving custom addresses', () => {
        config = new ProxyAddressConfig({ network: 'carthagenet', contractAddresses: { nameRegistry: 'custom_nr', customContract: 'customc' } });

        expect(config.get(SmartContractType.NameRegistry)).toBe('custom_nr');
        expect(config.get('customContract')).toBe('customc');
    });

    it('should throw when no addresses are specified for custom network', () => {
        expect(() => new ProxyAddressConfig({ network: 'custom' } as any)).toThrowError();
    });

    it('should when unknown option network is specified', () => {
        expect(() => new ProxyAddressConfig({ network: 'blehnet' as any })).toThrowError();
    });

    describe('get()', () => {
        beforeEach(() => {
            config = new ProxyAddressConfig();
        });

        it('should throw if address for type is not found', () => {
            expect(() => config.get('???')).toThrowError(new Error('Address for contract ??? is not configured.'));
        });
    });
});
