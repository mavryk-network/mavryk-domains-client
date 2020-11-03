import { TransactionWalletOperation } from '@taquito/taquito';
import { TezosDomainsConfig, TezosClient, AddressBook, ConsoleTracer, NoopTracer, Exact } from '@tezos-domains/core';

import { BlockchainDomainsManager } from './blockchain-domains-manager';
import { DomainsManager } from './domains-manager';
import {
    SetChildRecordRequest,
    UpdateRecordRequest,
    CommitmentRequest,
    BuyRequest,
    RenewRequest,
    ReverseRecordRequest,
    CommitmentInfo,
    UpdateReverseRecordRequest,
    DomainAcquisitionInfo,
    BidRequest,
    SettleRequest,
} from './model';
import { CommitmentGenerator } from './commitment-generator';

export type ManagerConfig = TezosDomainsConfig;

export class TezosDomainsManager implements DomainsManager {
    private manager: DomainsManager;

    constructor(config: ManagerConfig) {
        const tracer = config.tracing ? new ConsoleTracer() : new NoopTracer();
        const tezosToolkit = config.tezos;
        const tezos = new TezosClient(config.tezos, tracer);
        const addressBook = new AddressBook(tezos, config);
        const commitmentGenerator = new CommitmentGenerator(tezosToolkit);
        this.manager = new BlockchainDomainsManager(tezos, addressBook, tracer, commitmentGenerator);
    }

    setChildRecord(request: Exact<SetChildRecordRequest>): Promise<TransactionWalletOperation> {
        return this.manager.setChildRecord(request);
    }

    updateRecord(request: Exact<UpdateRecordRequest>): Promise<TransactionWalletOperation> {
        return this.manager.updateRecord(request);
    }

    commit(tld: string, request: Exact<CommitmentRequest>): Promise<TransactionWalletOperation> {
        return this.manager.commit(tld, request);
    }

    buy(tld: string, request: Exact<BuyRequest>): Promise<TransactionWalletOperation> {
        return this.manager.buy(tld, request);
    }

    renew(tld: string, request: Exact<RenewRequest>): Promise<TransactionWalletOperation> {
        return this.manager.renew(tld, request);
    }

    claimReverseRecord(request: Exact<ReverseRecordRequest>): Promise<TransactionWalletOperation> {
        return this.manager.claimReverseRecord(request);
    }

    updateReverseRecord(request: Exact<UpdateReverseRecordRequest>): Promise<TransactionWalletOperation> {
        return this.manager.updateReverseRecord(request);
    }

    getCommitment(tld: string, request: Exact<CommitmentRequest>): Promise<CommitmentInfo | null> {
        return this.manager.getCommitment(tld, request);
    }

    getAcquisitionInfo(name: string): Promise<DomainAcquisitionInfo> {
        return this.manager.getAcquisitionInfo(name);
    }

    getBidderBalance(tld: string, address: string): Promise<number> {
        return this.manager.getBidderBalance(tld, address);
    }

    bid(tld: string, request: Exact<BidRequest>): Promise<TransactionWalletOperation> {
        return this.manager.bid(tld, request);
    }

    settle(tld: string, request: Exact<SettleRequest>): Promise<TransactionWalletOperation> {
        return this.manager.settle(tld, request);
    }

    withdraw(tld: string, recipient: string): Promise<TransactionWalletOperation> {
        return this.manager.withdraw(tld, recipient);
    }
}
