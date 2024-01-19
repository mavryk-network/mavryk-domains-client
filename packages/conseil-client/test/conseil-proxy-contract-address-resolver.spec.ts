import { mock, instance, when } from 'ts-mockito';

import { ConseilMavrykDomainsProxyContractAddressResolver } from '../src/conseil-proxy-contract-address-resolver';
import { ConseilClient } from '../src/conseil/client';

describe('ConseilMavrykDomainsProxyContractAddressResolver', () => {
    let proxyContractAddressResolver: ConseilMavrykDomainsProxyContractAddressResolver;
    let conseilClientMock: ConseilClient;

    beforeEach(() => {
        conseilClientMock = mock(ConseilClient);

        when(conseilClientMock.storage('KT1proxy')).thenResolve({
            prim: 'Pair',
            args: [
                {
                    prim: 'Pair',
                    args: [
                        {
                            string: 'KT1act',
                        },
                        {
                            int: '7687',
                        },
                    ],
                },
                {
                    string: 'KT1Own',
                },
            ],
        });
        when(conseilClientMock.storage('KT1inv')).thenResolve({
            prim: 'Pair',
            args: [],
        });

        proxyContractAddressResolver = new ConseilMavrykDomainsProxyContractAddressResolver(instance(conseilClientMock));
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
