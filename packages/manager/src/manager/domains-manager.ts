import { TransactionWalletOperation } from '@taquito/taquito';
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
} from './model';

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
     * Gets information about an existing commitment created via [[`commit`]].
     * 
     * @param tld The name of the top level domain (e.g. `tez`).
     */
    getCommitment(tld: string, request: Exact<CommitmentRequest>): Promise<CommitmentInfo | null>;
    /**
     * Gets the price of a domain (i.e. how much it costs to either buy or renew it for the specified period of time).
     * 
     * The price is returned as a number in `TZX`.
     * 
     * @param name The name of the domain (e.g. `alice.tez`)
     * @param duration The duration of registration/renewal in days.
     */
    getPrice(name: string, duration: number): Promise<number>;
}
