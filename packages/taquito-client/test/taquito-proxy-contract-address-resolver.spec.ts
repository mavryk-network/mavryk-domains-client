import { TaquitoClient } from '@tezos-domains/taquito';

import { TaquitoTezosDomainsProxyContractAddressResolver } from '../src/taquito-proxy-contract-address-resolver';
import { mock, instance, when } from 'ts-mockito';

describe('TaquitoTezosDomainsProxyContractAddressResolver', () => {
    let proxyContractAddressResolver: TaquitoTezosDomainsProxyContractAddressResolver;
    let taquitoClientMock: TaquitoClient;

    beforeEach(() => {
        taquitoClientMock = mock(TaquitoClient);

        when(taquitoClientMock.storage('KT1proxy')).thenResolve({ contract: 'KT1act' });
        when(taquitoClientMock.storage('KT1inv')).thenResolve({ la: 'x' });

        proxyContractAddressResolver = new TaquitoTezosDomainsProxyContractAddressResolver(instance(taquitoClientMock));
    });

    describe('getAddress', () => {
        it('should get storage and return stored address', async () => {
            const address = await proxyContractAddressResolver.getAddress('KT1proxy');

            expect(address).toBe('KT1act');
        });

        it('should throw if contract does not return correct storage', async () => {
            await expect(proxyContractAddressResolver.getAddress('404')).rejects.toThrowError();
            await expect(proxyContractAddressResolver.getAddress('KT1inv')).rejects.toThrowError();
        });
    });
});
