import { TransactionWalletOperation, WalletTransferParams, WalletOperation } from '@taquito/taquito';
import { Tracer, Exact } from '@tezos-domains/core';
import { TaquitoClient } from '@tezos-domains/taquito';

import {
    SetChildRecordRequest,
    UpdateRecordRequest,
    CommitmentRequest,
    BuyRequest,
    RenewRequest,
    ReverseRecordRequest,
    CommitmentInfo,
    UpdateReverseRecordRequest,
    BidRequest,
    SettleRequest,
    DomainAcquisitionInfo,
} from './model';
import { DomainsManager } from './domains-manager';
import { TezosDomainsOperationFactory } from './operation-factory';
import { TaquitoManagerDataProvider } from './data-provider';

export class BlockchainDomainsManager implements DomainsManager {
    constructor(
        private tezos: TaquitoClient,
        private tracer: Tracer,
        private operationFactory: TezosDomainsOperationFactory<WalletTransferParams>,
        private dataProvider: TaquitoManagerDataProvider
    ) {}

    async setChildRecord(request: Exact<SetChildRecordRequest>): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.setChildRecord(request);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async updateRecord(request: Exact<UpdateRecordRequest>): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.updateRecord(request);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async commit(tld: string, request: Exact<CommitmentRequest>): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.commit(tld, request);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async buy(tld: string, request: Exact<BuyRequest>): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.buy(tld, request);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async renew(tld: string, request: Exact<RenewRequest>): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.renew(tld, request);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async claimReverseRecord(request: Exact<ReverseRecordRequest>): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.claimReverseRecord(request);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async updateReverseRecord(request: Exact<UpdateReverseRecordRequest>): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.updateReverseRecord(request);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async getCommitment(tld: string, request: Exact<CommitmentRequest>): Promise<CommitmentInfo | null> {
        return this.dataProvider.getCommitment(tld, request);
    }

    async getAcquisitionInfo(name: string): Promise<DomainAcquisitionInfo> {
        return this.dataProvider.getAcquisitionInfo(name);
    }

    async getBidderBalance(tld: string, address: string): Promise<number> {
        return this.dataProvider.getBidderBalance(tld, address);
    }

    async bid(tld: string, request: Exact<BidRequest>): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.bid(tld, request);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async settle(tld: string, request: Exact<SettleRequest>): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.settle(tld, request);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async withdraw(tld: string, recipient: string): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing withdraw.`, recipient);

        const params = await this.operationFactory.withdraw(tld, recipient);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async batch(builder: (operationFactory: TezosDomainsOperationFactory<WalletTransferParams>) => Promise<WalletTransferParams[]>): Promise<WalletOperation> {
        this.tracer.trace(`=> Executing batch.`);

        const operations = await builder(this.operationFactory);

        this.tracer.trace('!! Operations in batch', operations);

        const operation = await this.tezos.batch(operations);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }
}
