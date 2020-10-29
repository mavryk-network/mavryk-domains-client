jest.mock('@tezos-domains/core');
jest.mock('../../src/manager/blockchain-domains-manager');
jest.mock('../../src/manager/commitment-generator');
jest.mock('@taquito/taquito');

import { TezosClient, ConsoleTracer, NoopTracer, AddressBook } from '@tezos-domains/core';
import { TezosDomainsManager, BlockchainDomainsManager, CommitmentGenerator, ManagerConfig } from '@tezos-domains/manager';
import { mock, instance, when } from 'ts-mockito';
import { TezosToolkit, TransactionWalletOperation } from '@taquito/taquito';

describe('TezosDomainsManager', () => {
    let manager: TezosDomainsManager;
    let tezosClientMock: TezosClient;
    let addressBookMock: AddressBook;
    let noopTracerMock: NoopTracer;
    let consoleTracerMock: ConsoleTracer;
    let blockchainDomainsManagerMock: BlockchainDomainsManager;
    let commitmentGeneratorMock: CommitmentGenerator;
    let data: any;
    let operation: TransactionWalletOperation;
    let tezosToolkitMock: TezosToolkit;

    beforeEach(() => {
        tezosClientMock = mock(TezosClient);
        addressBookMock = mock(AddressBook);
        noopTracerMock = mock(NoopTracer);
        consoleTracerMock = mock(ConsoleTracer);
        blockchainDomainsManagerMock = mock(BlockchainDomainsManager);
        commitmentGeneratorMock = mock(CommitmentGenerator);
        operation = mock(TransactionWalletOperation);
        tezosToolkitMock = mock(TezosToolkit);

        data = { a: 1 };

        (TezosClient as jest.Mock).mockReturnValue(instance(tezosClientMock));
        (AddressBook as jest.Mock).mockReturnValue(instance(addressBookMock));
        (ConsoleTracer as jest.Mock).mockReturnValue(instance(consoleTracerMock));
        (NoopTracer as jest.Mock).mockReturnValue(instance(noopTracerMock));
        (BlockchainDomainsManager as jest.Mock).mockReturnValue(instance(blockchainDomainsManagerMock));
        (CommitmentGenerator as jest.Mock).mockReturnValue(instance(commitmentGeneratorMock));
    });

    describe('config', () => {
        it('should setup with default config', () => {
            const config = { tezos: instance(tezosToolkitMock) };
            new TezosDomainsManager(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(tezosToolkitMock), instance(noopTracerMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(tezosClientMock), config);
            expect(CommitmentGenerator).toHaveBeenCalledWith(instance(tezosToolkitMock));
            expect(BlockchainDomainsManager).toHaveBeenCalledWith(
                instance(tezosClientMock),
                instance(addressBookMock),
                instance(noopTracerMock),
                instance(commitmentGeneratorMock)
            );
        });

        it('should setup with custom config', () => {
            const config: ManagerConfig = {
                tezos: instance(tezosToolkitMock),
                network: 'delphinet',
                tracing: true,
            };
            new TezosDomainsManager(config);

            expect(TezosClient).toHaveBeenCalledWith(instance(tezosToolkitMock), instance(consoleTracerMock));
            expect(AddressBook).toHaveBeenCalledWith(instance(tezosClientMock), config);
            expect(CommitmentGenerator).toHaveBeenCalledWith(instance(tezosToolkitMock));
            expect(BlockchainDomainsManager).toHaveBeenCalledWith(
                instance(tezosClientMock),
                instance(addressBookMock),
                instance(consoleTracerMock),
                instance(commitmentGeneratorMock)
            );
        });
    });

    describe('functionality', () => {
        beforeEach(() => {
            manager = new TezosDomainsManager({ tezos: instance(tezosToolkitMock) });
        });

        describe('setChildRecord()', () => {
            it('should call actual manager', async () => {
                when(blockchainDomainsManagerMock.setChildRecord(data)).thenResolve(instance(operation));

                const op = await manager.setChildRecord(data);

                expect(op).toBe(instance(operation));
            });
        });

        describe('updateRecord()', () => {
            it('should call actual manager', async () => {
                when(blockchainDomainsManagerMock.updateRecord(data)).thenResolve(instance(operation));

                const op = await manager.updateRecord(data);

                expect(op).toBe(instance(operation));
            });
        });

        describe('commit()', () => {
            it('should call actual manager', async () => {
                when(blockchainDomainsManagerMock.commit('tez', data)).thenResolve(instance(operation));

                const op = await manager.commit('tez', data);

                expect(op).toBe(instance(operation));
            });
        });

        describe('buy()', () => {
            it('should call actual manager', async () => {
                when(blockchainDomainsManagerMock.buy('tez', data)).thenResolve(instance(operation));

                const op = await manager.buy('tez', data);

                expect(op).toBe(instance(operation));
            });
        });

        describe('renew()', () => {
            it('should call actual manager', async () => {
                when(blockchainDomainsManagerMock.renew('tez', data)).thenResolve(instance(operation));

                const op = await manager.renew('tez', data);

                expect(op).toBe(instance(operation));
            });
        });

        describe('claimReverseRecord()', () => {
            it('should call actual manager', async () => {
                when(blockchainDomainsManagerMock.claimReverseRecord(data)).thenResolve(instance(operation));

                const op = await manager.claimReverseRecord(data);

                expect(op).toBe(instance(operation));
            });
        });

        describe('updateReverseRecord()', () => {
            it('should call actual manager', async () => {
                when(blockchainDomainsManagerMock.updateReverseRecord(data)).thenResolve(instance(operation));

                const op = await manager.updateReverseRecord(data);

                expect(op).toBe(instance(operation));
            });
        });

        describe('getCommitment()', () => {
            it('should call actual manager', async () => {
                const commitment: any = { b: 1 };
                when(blockchainDomainsManagerMock.getCommitment('tez', data)).thenResolve(commitment);

                const result = await manager.getCommitment('tez', data);

                expect(result).toBe(commitment);
            });
        });

        describe('getAcquisitionInfo()', () => {
            it('should call actual manager', async () => {
                const info: any = { b: 1 };
                when(blockchainDomainsManagerMock.getAcquisitionInfo('necroskillz.tez')).thenResolve(info);

                const result = await manager.getAcquisitionInfo('necroskillz.tez');

                expect(result).toBe(info);
            });
        });

        describe('getBidderBalance()', () => {
            it('should call actual manager', async () => {
                when(blockchainDomainsManagerMock.getBidderBalance('tez', 'tz1xxx')).thenResolve(2);

                const result = await manager.getBidderBalance('tez', 'tz1xxx');

                expect(result).toBe(2);
            });
        });

        describe('bid()', () => {
            it('should call actual manager', async () => {
                when(blockchainDomainsManagerMock.bid('tez', data)).thenResolve(instance(operation));

                const op = await manager.bid('tez', data);

                expect(op).toBe(instance(operation));
            });
        });

        describe('settle()', () => {
            it('should call actual manager', async () => {
                when(blockchainDomainsManagerMock.settle('tez', data)).thenResolve(instance(operation));

                const op = await manager.settle('tez', data);

                expect(op).toBe(instance(operation));
            });
        });

        describe('withdraw()', () => {
            it('should call actual manager', async () => {
                when(blockchainDomainsManagerMock.withdraw('tez', data)).thenResolve(instance(operation));

                const op = await manager.withdraw('tez', data);

                expect(op).toBe(instance(operation));
            });
        });
    });
});
