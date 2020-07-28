import { ProxyContractAddressResolver, TezosClient, ProxyAddressConfig, SmartContractType, smartContract } from '@tezos-domains/core';
import { mock, instance, when, anyString, verify } from 'ts-mockito';
import FakePromise from 'fake-promise';

import { ProxyStorage } from '../../src/model';

describe('ProxyContractAddressResolver', () => {
    let resolver: ProxyContractAddressResolver;
    let proxyAddressConfigMock: ProxyAddressConfig;
    let tezosClientMock: TezosClient;
    let storage: FakePromise<ProxyStorage>;

    beforeEach(() => {
        proxyAddressConfigMock = mock(ProxyAddressConfig);
        tezosClientMock = mock(TezosClient);
        storage = new FakePromise();

        when(tezosClientMock.storage(anyString())).thenReturn(storage);
        when(proxyAddressConfigMock.get(SmartContractType.NameRegistry)).thenReturn('nra');
        when(proxyAddressConfigMock.get(`${SmartContractType.TLDRegistrar}:tez`)).thenReturn('tld_tez');

        resolver = new ProxyContractAddressResolver(instance(proxyAddressConfigMock), instance(tezosClientMock));
    });

    it('should return smart contract address for current network by type', async () => {
        const address = resolver.resolve(smartContract(SmartContractType.NameRegistry));

        verify(tezosClientMock.storage('nra')).called();

        storage.resolve({ contract: 'KT1xxx' });

        await expect(address).resolves.toBe('KT1xxx');
    });

    it('should resolve tld registrar address by tld', async () => {
        const address = resolver.resolve(smartContract(SmartContractType.TLDRegistrar, 'tez'));

        verify(tezosClientMock.storage('tld_tez')).called();

        storage.resolve({ contract: 'KT1xxx' });

        await expect(address).resolves.toBe('KT1xxx');
    });

    it('should throw if tld registrar tld is not specified', () => {
        expect(() => smartContract(SmartContractType.TLDRegistrar)).toThrowError(
            new Error('Resolution of address for type tldRegistrar requires 1 parameter.')
        );
    });
});
