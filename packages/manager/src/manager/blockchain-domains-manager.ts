import { TransactionWalletOperation, InvalidParameterError } from '@taquito/taquito';
import {
    Tracer,
    TezosClient,
    AddressBook,
    Exact,
    SmartContractType,
    RpcRequestData,
    TLDRegistrarStorage,
    DateEncoder,
    getTld,
    MapEncoder,
    RpcResponseData,
    BigNumberEncoder,
} from '@tezos-domains/core';
import { BytesEncoder } from '@tezos-domains/core';
import BigNumber from 'bignumber.js';

import {
    SetChildRecordRequest,
    UpdateRecordRequest,
    CommitmentRequest,
    BuyRequest,
    RenewRequest,
    ReverseRecordRequest,
    CommitmentInfo,
    TLDRecord,
    UpdateReverseRecordRequest,
} from './model';
import { DomainsManager } from './domains-manager';
import { CommitmentGenerator } from './commitment-generator';

export class BlockchainDomainsManager implements DomainsManager {
    constructor(private tezos: TezosClient, private addressBook: AddressBook, private tracer: Tracer, private commitmentGenerator: CommitmentGenerator) {}

    async setChildRecord(request: Exact<SetChildRecordRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'set_child_record';

        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(SetChildRecordRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [
            encodedRequest.label,
            encodedRequest.parent,
            encodedRequest.address,
            encodedRequest.owner,
            encodedRequest.data,
            encodedRequest.expiry,
        ]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async updateRecord(request: Exact<UpdateRecordRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'update_record';
        this.tracer.trace(`=> Executing ${entrypoint}.`, request);
        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(UpdateRecordRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [encodedRequest.name, encodedRequest.address, encodedRequest.owner, encodedRequest.data]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async commit(tld: string, request: Exact<CommitmentRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'commit';
        this.tracer.trace(`=> Executing ${entrypoint}.`, request);
        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const commitmentHash = await this.commitmentGenerator.generate(request);
        const operation = await this.tezos.call(address, entrypoint, [commitmentHash]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async buy(tld: string, request: Exact<BuyRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'buy';

        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const price = await this.getPrice(`${request.label}.${tld}`, request.duration);
        const encodedRequest = RpcRequestData.fromObject(BuyRequest, request).encode();

        let operation: TransactionWalletOperation;

        try {
            operation = await this.tezos.call(
                address,
                entrypoint,
                [encodedRequest.label, encodedRequest.duration, encodedRequest.owner, encodedRequest.address, encodedRequest.data],
                price
            );
        } catch (err) {
            if (err instanceof InvalidParameterError) {
                operation = await this.tezos.call(address, entrypoint, [encodedRequest.label, encodedRequest.duration, encodedRequest.owner], price);
            } else {
                throw err;
            }
        }

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async renew(tld: string, request: Exact<RenewRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'renew';

        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const price = await this.getPrice(`${request.label}.${tld}`, request.duration);
        const encodedRequest = RpcRequestData.fromObject(RenewRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [encodedRequest.label, encodedRequest.duration], price);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async claimReverseRecord(request: Exact<ReverseRecordRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'claim_reverse_record';

        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(ReverseRecordRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [encodedRequest.name, encodedRequest.owner, encodedRequest.data]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async updateReverseRecord(request: Exact<UpdateReverseRecordRequest>): Promise<TransactionWalletOperation> {
        const entrypoint = 'update_reverse_record';

        this.tracer.trace(`=> Executing ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(UpdateReverseRecordRequest, request).encode();
        const operation = await this.tezos.call(address, entrypoint, [encodedRequest.address, encodedRequest.name, encodedRequest.owner, encodedRequest.data]);

        this.tracer.trace('<= Executed.', operation.opHash);

        return operation;
    }

    async getCommitment(tld: string, request: Exact<CommitmentRequest>): Promise<CommitmentInfo | null> {
        this.tracer.trace('=> Getting existing commitment.', tld, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld);
        const commitmentHash = await this.commitmentGenerator.generate(request);

        this.tracer.trace('!! Calculated commitment hash for given parameters.', commitmentHash);

        const commitmentResponse = await this.tezos.getBigMapValue<TLDRegistrarStorage>(
            address,
            s => s.store.commitments,
            RpcRequestData.fromValue(commitmentHash)
        );
        const commitment = commitmentResponse.scalar(DateEncoder);

        if (!commitment) {
            this.tracer.trace('<= Commitment not found.');

            return null;
        }

        const tldStorage = await this.tezos.storage<TLDRegistrarStorage>(address);
        const config = new RpcResponseData(tldStorage.store.config).scalar(MapEncoder);
        // TODO: remove fallback to legacy value
        const minAge = config ? config.get('min_commitment_age', BigNumberEncoder)! : tldStorage.store.min_commitment_age.toNumber();
        const maxAge = config ? config.get('max_commitment_age', BigNumberEncoder)! : tldStorage.store.max_commitment_age.toNumber();

        const usableFrom = new Date(commitment.getTime() + minAge * 1000);
        const usableUntil = new Date(commitment.getTime() + maxAge * 1000);

        this.tracer.trace(
            `<= Commitment found with timestamp ${commitment.toISOString()}. Based on TLDRegistrar it's usable from ${usableFrom.toISOString()} to ${usableUntil.toISOString()}.`
        );

        return { usableFrom, usableUntil, created: commitment };
    }

    async getPrice(name: string, duration: number): Promise<number> {
        this.tracer.trace(`=> Calculating price for '${name}' for duration of ${duration} days.`);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, getTld(name));

        const response = await this.tezos.getBigMapValue<TLDRegistrarStorage>(address, s => s.store.records, RpcRequestData.fromValue(name, BytesEncoder));
        const tldRecord = response.decode(TLDRecord);

        let pricePerDay: BigNumber;

        if (tldRecord && tldRecord.expiration_date > new Date()) {
            this.tracer.trace(`!! Found existing record in TLDRegistrar with price ${tldRecord.price_per_day.toNumber()} XTZ per day.`);

            pricePerDay = tldRecord.price_per_day;
        } else {
            const tldStorage = await this.tezos.storage<TLDRegistrarStorage>(address);
            const config = new RpcResponseData(tldStorage.store.config).scalar(MapEncoder);
            // TODO: remove fallback to legacy value
            const minBidPerDay = config ? config.get<BigNumber>('min_bid_per_day')! : tldStorage.store.min_bid_per_day;

            this.tracer.trace(`!! Existing record not found, falling back to TLDRegistrar default price ${minBidPerDay.toNumber()} XTZ per day.`);

            pricePerDay = minBidPerDay;
        }

        const price = pricePerDay.dividedBy(1e12).multipliedBy(duration).precision(6).toNumber();

        this.tracer.trace('<= Price calculated.', price);

        return price;
    }
}
