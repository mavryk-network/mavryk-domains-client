import { TransactionWalletOperation, WalletOperation } from '@taquito/taquito';
import { NotSupportedError } from '@tezos-domains/core';

import { DomainAcquisitionInfo, DomainsManager } from '../manager';
import { CommitmentInfo, TLDConfiguration } from './model';

export class UnsupportedDomainsManager implements DomainsManager {
    setChildRecord(): Promise<TransactionWalletOperation> {
        throw new NotSupportedError();
    }

    updateRecord(): Promise<TransactionWalletOperation> {
        throw new NotSupportedError();
    }

    commit(): Promise<TransactionWalletOperation> {
        throw new NotSupportedError();
    }

    buy(): Promise<TransactionWalletOperation> {
        throw new NotSupportedError();
    }

    renew(): Promise<TransactionWalletOperation> {
        throw new NotSupportedError();
    }

    claimReverseRecord(): Promise<TransactionWalletOperation> {
        throw new NotSupportedError();
    }

    updateReverseRecord(): Promise<TransactionWalletOperation> {
        throw new NotSupportedError();
    }

    getCommitment(): Promise<CommitmentInfo> {
        throw new NotSupportedError();
    }

    getAcquisitionInfo(): Promise<DomainAcquisitionInfo> {
        throw new NotSupportedError();
    }

    getBidderBalance(): Promise<number> {
        throw new NotSupportedError();
    }

    getTldConfiguration(): Promise<TLDConfiguration> {
        throw new NotSupportedError();
    }

    bid(): Promise<TransactionWalletOperation> {
        throw new NotSupportedError();
    }

    settle(): Promise<TransactionWalletOperation> {
        throw new NotSupportedError();
    }

    withdraw(): Promise<TransactionWalletOperation> {
        throw new NotSupportedError();
    }

    batch(): Promise<WalletOperation> {
        throw new NotSupportedError();
    }
}
