import { TransactionWalletOperation, WalletTransferParams, WalletOperation } from '@taquito/taquito';
import { Tracer, Exact, AdditionalOperationParams } from '@tezos-domains/core';
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
    TLDConfiguration,
} from './model';
import { DomainsManager } from './domains-manager';
import { TezosDomainsOperationFactory } from './operation-factory';
import { TaquitoManagerDataProvider } from './data-provider';
import { DomainAcquisitionInfo } from './acquisition-info';

export class BlockchainDomainsManager implements DomainsManager {
    constructor(
        private tezos: TaquitoClient,
        private tracer: Tracer,
        private operationFactory: TezosDomainsOperationFactory<WalletTransferParams>,
        private dataProvider: TaquitoManagerDataProvider
    ) {}

    async setChildRecord(request: Exact<SetChildRecordRequest>, operationParams?: AdditionalOperationParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.setChildRecord(request, operationParams);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async updateRecord(request: Exact<UpdateRecordRequest>, operationParams?: AdditionalOperationParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.updateRecord(request, operationParams);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async commit(tld: string, request: Exact<CommitmentRequest>, operationParams?: AdditionalOperationParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.commit(tld, request, operationParams);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async buy(tld: string, request: Exact<BuyRequest>, operationParams?: AdditionalOperationParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.buy(tld, request, operationParams);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async renew(tld: string, request: Exact<RenewRequest>, operationParams?: AdditionalOperationParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.renew(tld, request, operationParams);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async claimReverseRecord(request: Exact<ReverseRecordRequest>, operationParams?: AdditionalOperationParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.claimReverseRecord(request, operationParams);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async updateReverseRecord(request: Exact<UpdateReverseRecordRequest>, operationParams?: AdditionalOperationParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.updateReverseRecord(request, operationParams);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    getCommitment(tld: string, request: Exact<CommitmentRequest>): Promise<CommitmentInfo | null> {
        return this.dataProvider.getCommitment(tld, request);
    }

    getAcquisitionInfo(name: string): Promise<DomainAcquisitionInfo> {
        return this.dataProvider.getAcquisitionInfo(name);
    }

    getBidderBalance(tld: string, address: string): Promise<number> {
        return this.dataProvider.getBidderBalance(tld, address);
    }

    getTldConfiguration(tld: string): Promise<TLDConfiguration> {
        return this.dataProvider.getTldConfiguration(tld);
    }

    async bid(tld: string, request: Exact<BidRequest>, operationParams?: AdditionalOperationParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.bid(tld, request, operationParams);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async settle(tld: string, request: Exact<SettleRequest>, operationParams?: AdditionalOperationParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing.`, request);

        const params = await this.operationFactory.settle(tld, request, operationParams);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async withdraw(tld: string, recipient: string, operationParams?: AdditionalOperationParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing withdraw.`, recipient);

        const params = await this.operationFactory.withdraw(tld, recipient, operationParams);
        const operation = await this.tezos.call(params);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    getTokenId(name: string): Promise<number | null> {
        return this.dataProvider.getTokenId(name);
    }
    
    async transfer(name: string, newOwner: string, operationParams?: AdditionalOperationParams): Promise<TransactionWalletOperation> {
        this.tracer.trace(`=> Executing transfer.`, name, newOwner);

        const params = await this.operationFactory.transfer(name, newOwner, operationParams);
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
