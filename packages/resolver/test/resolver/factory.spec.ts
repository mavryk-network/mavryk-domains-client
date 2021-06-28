jest.mock('@tezos-domains/core');
jest.mock('../../src/resolver/blockchain-name-resolver');
jest.mock('../../src/resolver/cached-name-resolver');
jest.mock('../../src/resolver/name-normalizing-name-resolver');

import { DomainNameValidator, Tracer, TezosDomainsConfig, TezosDomainsResolverDataProvider } from '@tezos-domains/core';
import { createResolver } from '@tezos-domains/resolver';
import { mock, instance } from 'ts-mockito';

import { BlockchainNameResolver } from '../../src/resolver/blockchain-name-resolver';
import { CachedNameResolver } from '../../src/resolver/cached-name-resolver';
import { NameNormalizingNameResolver } from '../../src/resolver/name-normalizing-name-resolver';

class T {}
class V {}
class DP {}

describe('createResolver()', () => {
    let tracerMock: Tracer;
    let blockchainNameResolverMock: BlockchainNameResolver;
    let cachedNameResolverMock: CachedNameResolver;
    let nameNormalizingNameResolver: NameNormalizingNameResolver;
    let domainNameValidatorMock: DomainNameValidator;
    let dataProviderMock: TezosDomainsResolverDataProvider;

    beforeEach(() => {
        blockchainNameResolverMock = mock(BlockchainNameResolver);
        cachedNameResolverMock = mock(CachedNameResolver);
        nameNormalizingNameResolver = mock(NameNormalizingNameResolver);
        tracerMock = mock(T) as any;
        domainNameValidatorMock = mock(V) as any;
        dataProviderMock = mock(DP) as any;

        (BlockchainNameResolver as jest.Mock).mockReturnValue(instance(blockchainNameResolverMock));
        (CachedNameResolver as jest.Mock).mockReturnValue(instance(cachedNameResolverMock));
        (NameNormalizingNameResolver as jest.Mock).mockReturnValue(instance(nameNormalizingNameResolver));
    });

    it('should setup with default config', () => {
        const resolver = createResolver({}, instance(dataProviderMock), instance(tracerMock), instance(domainNameValidatorMock));

        expect(BlockchainNameResolver).toHaveBeenCalledWith(instance(dataProviderMock), instance(tracerMock), instance(domainNameValidatorMock));
        expect(CachedNameResolver).not.toHaveBeenCalled();
        expect(NameNormalizingNameResolver).toHaveBeenCalledWith(instance(blockchainNameResolverMock), instance(tracerMock));

        expect(resolver).toBe(instance(nameNormalizingNameResolver));
    });

    it('should setup with custom config', () => {
        const config: TezosDomainsConfig = {
            network: 'florencenet',
            tracing: true,
            caching: { enabled: true, defaultRecordTtl: 50, defaultReverseRecordTtl: 60 },
        };
        const resolver = createResolver(config, instance(dataProviderMock), instance(tracerMock), instance(domainNameValidatorMock));

        expect(BlockchainNameResolver).toHaveBeenCalledWith(instance(dataProviderMock), instance(tracerMock), instance(domainNameValidatorMock));
        expect(CachedNameResolver).toHaveBeenCalledWith(instance(blockchainNameResolverMock), instance(tracerMock), {
            defaultRecordTtl: 50,
            defaultReverseRecordTtl: 60,
        });
        expect(NameNormalizingNameResolver).toHaveBeenCalledWith(instance(cachedNameResolverMock), instance(tracerMock));

        expect(resolver).toBe(instance(nameNormalizingNameResolver));
    });
});
