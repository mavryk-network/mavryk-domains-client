jest.mock('@tezos-domains/core');
jest.mock('@tezos-domains/resolver');
jest.mock('@tezos-domains/manager');
jest.mock('@taquito/taquito');

import { Tezos, TezosToolkit } from '@taquito/taquito';
import { TezosClient, ConsoleTracer, NoopTracer, AddressBook } from '@tezos-domains/core';
import { BlockchainDomainsManager, CommitmentGenerator } from '@tezos-domains/manager';
import { TezosDomainsClient, ClientConfig } from '@tezos-domains/client';
import { BlockchainNameResolver, CachedNameResolver } from '@tezos-domains/resolver';
import { mock, instance } from 'ts-mockito';

describe('TezosDomainsClient', () => {
    let tezosClientMock: TezosClient;
    let addressBookMock: AddressBook;
    let noopTracerMock: NoopTracer;
    let consoleTracerMock: ConsoleTracer;
    let blockchainDomainsManagerMock: BlockchainDomainsManager;
    let commitmentGeneratorMock: CommitmentGenerator;
    let blockchainNameResolverMock: BlockchainNameResolver;
    let cachedNameResolverMock: CachedNameResolver;

    beforeEach(() => {
        tezosClientMock = mock(TezosClient);
        addressBookMock = mock(AddressBook);
        noopTracerMock = mock(NoopTracer);
        consoleTracerMock = mock(ConsoleTracer);
        blockchainDomainsManagerMock = mock(BlockchainDomainsManager);
        commitmentGeneratorMock = mock(CommitmentGenerator);
        blockchainNameResolverMock = mock(BlockchainNameResolver);
        cachedNameResolverMock = mock(CachedNameResolver);

        (TezosClient as jest.Mock).mockReturnValue(instance(tezosClientMock));
        (AddressBook as jest.Mock).mockReturnValue(instance(addressBookMock));
        (ConsoleTracer as jest.Mock).mockReturnValue(instance(consoleTracerMock));
        (NoopTracer as jest.Mock).mockReturnValue(instance(noopTracerMock));
        (BlockchainDomainsManager as jest.Mock).mockReturnValue(instance(blockchainDomainsManagerMock));
        (CommitmentGenerator as jest.Mock).mockReturnValue(instance(commitmentGeneratorMock));
        (BlockchainNameResolver as jest.Mock).mockReturnValue(instance(blockchainNameResolverMock));
        (CachedNameResolver as jest.Mock).mockReturnValue(instance(cachedNameResolverMock));
    });

    describe('config', () => {
        it('should setup with default config', () => {
            new TezosDomainsClient();

            expect(TezosClient).toHaveBeenCalledWith(Tezos, instance(noopTracerMock));
            expect(AddressBook).toHaveBeenCalledWith(undefined);
            expect(CommitmentGenerator).toHaveBeenCalledWith(Tezos);
            expect(BlockchainDomainsManager).toHaveBeenCalledWith(
                instance(tezosClientMock),
                instance(addressBookMock),
                instance(noopTracerMock),
                instance(commitmentGeneratorMock)
            );

            expect(BlockchainNameResolver).toHaveBeenCalledWith(instance(tezosClientMock), instance(addressBookMock), instance(noopTracerMock));
            expect(CachedNameResolver).not.toHaveBeenCalled();
        });

        it('should setup with custom config', () => {
            const customTezosToolkit = mock(TezosToolkit);
            const config: ClientConfig = {
                tezos: instance(customTezosToolkit),
                network: 'carthagenet',
                tracing: true,
                caching: { enabled: true, recordTtl: 50, reverseRecordTtl: 60 },
            };
            new TezosDomainsClient(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(customTezosToolkit), instance(consoleTracerMock));
            expect(AddressBook).toHaveBeenCalledWith(config);
            expect(CommitmentGenerator).toHaveBeenCalledWith(instance(customTezosToolkit));
            expect(BlockchainDomainsManager).toHaveBeenCalledWith(
                instance(tezosClientMock),
                instance(addressBookMock),
                instance(consoleTracerMock),
                instance(commitmentGeneratorMock)
            );

            expect(BlockchainNameResolver).toHaveBeenCalledWith(instance(tezosClientMock), instance(addressBookMock), instance(consoleTracerMock));
            expect(CachedNameResolver).toHaveBeenCalledWith(instance(blockchainNameResolverMock), instance(consoleTracerMock), {
                recordTtl: 50,
                reverseRecordTtl: 60,
            });
        });

        describe('setConfig()', () => {
            it('should recreate parts', () => {
                const client = new TezosDomainsClient();

                const newManager = mock(BlockchainDomainsManager);
                (BlockchainDomainsManager as jest.Mock).mockReturnValue(instance(newManager));
                
                client.setConfig({ caching: { enabled: true } });

                expect(client.manager).toBe(instance(newManager));
                expect(client.resolver).toBe(instance(cachedNameResolverMock));
            });
        });
    });

    describe('functionality', () => {
        let client: TezosDomainsClient;

        beforeEach(() => {
            client = new TezosDomainsClient();
        });

        it('should expose manager', () => {
            expect(client.manager).toBe(instance(blockchainDomainsManagerMock));
        });

        it('should expose resolver', () => {
            expect(client.resolver).toBe(instance(blockchainNameResolverMock));
        });
    });
});
