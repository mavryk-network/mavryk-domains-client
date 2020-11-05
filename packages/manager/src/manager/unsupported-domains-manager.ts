import { TransactionWalletOperation } from '@taquito/taquito';

import { DomainsManager } from '../manager';
import { CommitmentInfo, DomainAcquisitionInfo } from './model';

export class UnsupportedDomainsManager implements DomainsManager {
    setChildRecord(): Promise<TransactionWalletOperation> {
        throw new Error('Method not supported.');
    }

    updateRecord(): Promise<TransactionWalletOperation> {
        throw new Error('Method not supported.');
    }

    commit(): Promise<TransactionWalletOperation> {
        throw new Error('Method not supported.');
    }

    buy(): Promise<TransactionWalletOperation> {
        throw new Error('Method not supported.');
    }

    renew(): Promise<TransactionWalletOperation> {
        throw new Error('Method not supported.');
    }

    claimReverseRecord(): Promise<TransactionWalletOperation> {
        throw new Error('Method not supported.');
    }

    updateReverseRecord(): Promise<TransactionWalletOperation> {
        throw new Error('Method not supported.');
    }

    getCommitment(): Promise<CommitmentInfo> {
        throw new Error('Method not supported.');
    }

    getAcquisitionInfo(): Promise<DomainAcquisitionInfo> {
        throw new Error('Method not supported.');
    }

    getBidderBalance(): Promise<number> {
        throw new Error('Method not supported.');
    }

    bid(): Promise<TransactionWalletOperation> {
        throw new Error('Method not supported.');
    }

    settle(): Promise<TransactionWalletOperation> {
        throw new Error('Method not supported.');
    }

    withdraw(): Promise<TransactionWalletOperation> {
        throw new Error('Method not supported.');
    }
}
