import { TransactionWalletOperation } from '@taquito/taquito';
import { Exact } from '@tezos-domains/core';

import { SetChildRecordRequest, CommitmentInfo, UpdateRecordRequest, CommitmentRequest, BuyRequest, RenewRequest, ReverseRecordRequest, UpdateReverseRecordRequest } from './model';

export interface DomainsManager {
    setChildRecord(request: Exact<SetChildRecordRequest>): Promise<TransactionWalletOperation>;
    updateRecord(request: Exact<UpdateRecordRequest>): Promise<TransactionWalletOperation>;
    commit(tld: string, request: Exact<CommitmentRequest>): Promise<TransactionWalletOperation>;
    buy(tld: string, request: Exact<BuyRequest>): Promise<TransactionWalletOperation>;
    renew(tld: string, request: Exact<RenewRequest>): Promise<TransactionWalletOperation>;
    claimReverseRecord(request: Exact<ReverseRecordRequest>): Promise<TransactionWalletOperation>;
    updateReverseRecord(request: Exact<UpdateReverseRecordRequest>): Promise<TransactionWalletOperation>;

    getCommitment(tld: string, request: Exact<CommitmentRequest>): Promise<CommitmentInfo | null>;
    getPrice(name: string, duration: number): Promise<number>;
}
