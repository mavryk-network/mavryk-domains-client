import { TransactionWalletOperation, WalletTransferParams, WalletOperation } from '@taquito/taquito';
import { Exact } from '@tezos-domains/core';

import {
    SetChildRecordRequest,
    CommitmentInfo,
    UpdateRecordRequest,
    CommitmentRequest,
    BuyRequest,
    RenewRequest,
    ReverseRecordRequest,
    UpdateReverseRecordRequest,
    BidRequest,
    SettleRequest,
} from './model';
import { TezosDomainsOperationFactory } from './operation-factory';
import { TLDConfiguration } from './model';
import { DomainAcquisitionInfo } from './acquisition-info';

/**
 * An interface that defines functions for buying and updating domains and reverse records.
 */
export interface DomainsManager {
    /**
     * Either creates a subdomain under an existing owned domain, or updates an existing domain if you own it's direct parent, but don't own the domain itself.
     *
     *  - Associated contract: [NameRegistry.SetChildRecord](https://docs.tezos.domains/deployed-contracts)
     *  - Associated endpoint: `set_child_record`
     */
    setChildRecord(request: Exact<SetChildRecordRequest>): Promise<TransactionWalletOperation>;

    /**
     * Updates an existing owned domain.
     *
     *  - Associated contract: [NameRegistry.UpdateRecord](https://docs.tezos.domains/deployed-contracts)
     *  - Associated endpoint: `update_record`
     */
    updateRecord(request: Exact<UpdateRecordRequest>): Promise<TransactionWalletOperation>;

    /**
     * Creates and stores a commitment as a first phase of the [Commitment scheme](https://en.wikipedia.org/wiki/Commitment_scheme) to buy a domain using FIFS model.
     *
     *  - Associated contract: [TLDRegistrar.Commit](https://docs.tezos.domains/deployed-contracts)
     *  - Associated endpoint: `commit`
     *
     * @param tld The name of the top level domain (e.g. `tez`).
     */
    commit(tld: string, request: Exact<CommitmentRequest>): Promise<TransactionWalletOperation>;

    /**
     * Buys the specified domain as a second phase of the [Commitment scheme](https://en.wikipedia.org/wiki/Commitment_scheme) using FIFS model.
     * Note that only after [[`commit`]] was called and a period of time that can be discovered from [[`getCommitment`]] has elapsed, `buy` can be executed.
     *
     *  - Associated contract: [TLDRegistrar.Buy](https://docs.tezos.domains/deployed-contracts)
     *  - Associated endpoint: `buy`
     *
     * @param tld The name of the top level domain (e.g. `tez`).
     */
    buy(tld: string, request: Exact<BuyRequest>): Promise<TransactionWalletOperation>;

    /**
     * Renews the specified domain registration for the specified duration.
     *
     *  - Associated contract: [TLDRegistrar.Renew](https://docs.tezos.domains/deployed-contracts)
     *  - Associated endpoint: `renew`
     *
     * @param tld The name of the top level domain (e.g. `tez`).
     */
    renew(tld: string, request: Exact<RenewRequest>): Promise<TransactionWalletOperation>;

    /**
     * Either creates a reverse record for the sender address, or updates the reverse record related to the senders address (in case the sender is different from the reverse record owner).
     *
     *  - Associated contract: [NameRegistry.ClaimReverseRecord](https://docs.tezos.domains/deployed-contracts)
     *  - Associated endpoint: `claim_reverse_record`
     */
    claimReverseRecord(request: Exact<ReverseRecordRequest>): Promise<TransactionWalletOperation>;

    /**
     * Updates an existing owned reverse record.
     *
     *  - Associated contract: [NameRegistry.UpdateReverseRecord](https://docs.tezos.domains/deployed-contracts)
     *  - Associated endpoint: `update_reverse_record`
     */
    updateReverseRecord(request: Exact<UpdateReverseRecordRequest>): Promise<TransactionWalletOperation>;

    /**
     * Gets the information about an existing commitment created via [[`commit`]].
     *
     * @param tld The name of the top level domain (e.g. `tez`).
     */
    getCommitment(tld: string, request: Exact<CommitmentRequest>): Promise<CommitmentInfo | null>;

    /**
     * Gets the information about how domain can be acquired.
     *
     * Possible states are:
     *  - `Unobtainable` - TLD is disabled or auctions weren't launched yet
     *  - `Taken` - The domain is already owned by someone
     *  - `CanBeAuctioned` - An auction for this domain can be started
     *  - `AuctionInProgress` - An auction for this domain is in progress (at least 1 bid has been placed)
     *  - `CanBeSettled` - An auction for this domain has ended and the owner of the winning bid can claim it
     *  - `CanBeBought` - This domain can be bought directly
     *
     * The return value of this method also contains additional information about auction or buy/renewal
     * where applicable.
     *
     * @param name The name of the domain (e.g. `alice.tez`)
     */
    getAcquisitionInfo(name: string): Promise<DomainAcquisitionInfo>;

    /**
     * Gets so called 'bidder balance' of the specified address.
     *
     * When a bid is placed in an auction and then outbid by another bid, the former bid amount is stored in the contract
     * under it's senders address. The original bidder can then use this balance for another bid, or withdraw it by calling
     * [[`withdraw`]].
     *
     * @param tld The name of the top level domain (e.g. `tez`).
     * @param address The address for which to get the balance.
     */
    getBidderBalance(tld: string, address: string): Promise<number>;

    getTldConfiguration(tld: string): Promise<TLDConfiguration>;

    /**
     * Placed a bid on the specified domain label in an auction.
     *
     *  - Associated contract: [TLDRegistrar.Bid](https://docs.tezos.domains/deployed-contracts)
     *  - Associated endpoint: `bid`
     *
     * @param tld The name of the top level domain (e.g. `tez`).
     */
    bid(tld: string, request: Exact<BidRequest>): Promise<TransactionWalletOperation>;

    /**
     * Claims the specified domain after an auction was won.
     *
     *  - Associated contract: [TLDRegistrar.Settle](https://docs.tezos.domains/deployed-contracts)
     *  - Associated endpoint: `settle`
     *
     * @param tld The name of the top level domain (e.g. `tez`).
     */
    settle(tld: string, request: Exact<SettleRequest>): Promise<TransactionWalletOperation>;

    /**
     * Withdraws all funds stored in the contract under the senders balance (see [[`getBidderBalance`]]) and
     * sends them to the specified recipient address.
     *
     *  - Associated contract: [TLDRegistrar.Withdraw](https://docs.tezos.domains/deployed-contracts)
     *  - Associated endpoint: `withdraw`
     *
     * @param tld The name of the top level domain (e.g. `tez`).
     * @param recipient The address of the recipient of the withdrawn funds.
     */
    withdraw(tld: string, recipient: string): Promise<TransactionWalletOperation>;

    /** Execute multiple Tezos Domains operations in a batch. */
    batch(builder: (operationFactory: TezosDomainsOperationFactory<WalletTransferParams>) => Promise<WalletTransferParams[]>): Promise<WalletOperation>;
}
