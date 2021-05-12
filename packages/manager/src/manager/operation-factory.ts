import { WalletTransferParams } from '@taquito/taquito';
import { AddressBook, DomainNameValidationResult, DomainNameValidator, Exact, RpcRequestData, SmartContractType, Tracer } from '@tezos-domains/core';
import { TaquitoClient } from '@tezos-domains/taquito';

import { CommitmentGenerator } from './commitment-generator';
import { TaquitoManagerDataProvider } from './data-provider';
import {
    BidRequest,
    BuyRequest,
    CommitmentRequest,
    RenewRequest,
    ReverseRecordRequest,
    SetChildRecordRequest,
    SettleRequest,
    UpdateRecordRequest,
    UpdateReverseRecordRequest,
} from './model';

export interface TezosDomainsOperationFactory<TOperationParams> {
    setChildRecord(request: Exact<SetChildRecordRequest>): Promise<TOperationParams>;
    updateRecord(request: Exact<UpdateRecordRequest>): Promise<TOperationParams>;
    commit(tld: string, request: Exact<CommitmentRequest>): Promise<TOperationParams>;
    buy(tld: string, request: Exact<BuyRequest>): Promise<TOperationParams>;
    renew(tld: string, request: Exact<RenewRequest>): Promise<TOperationParams>;
    claimReverseRecord(request: Exact<ReverseRecordRequest>): Promise<TOperationParams>;
    updateReverseRecord(request: Exact<UpdateReverseRecordRequest>): Promise<TOperationParams>;
    bid(tld: string, request: Exact<BidRequest>): Promise<TOperationParams>;
    settle(tld: string, request: Exact<SettleRequest>): Promise<TOperationParams>;
    withdraw(tld: string, recipient: string): Promise<TOperationParams>;
}

export class TaquitoTezosDomainsOperationFactory implements TezosDomainsOperationFactory<WalletTransferParams> {
    constructor(
        private tezos: TaquitoClient,
        private addressBook: AddressBook,
        private tracer: Tracer,
        private commitmentGenerator: CommitmentGenerator,
        private dataProvider: TaquitoManagerDataProvider,
        private validator: DomainNameValidator
    ) {}

    async setChildRecord(request: Exact<SetChildRecordRequest>): Promise<WalletTransferParams> {
        this.assertDomainName(`${request.label}.${request.parent}`);

        const entrypoint = 'set_child_record';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(SetChildRecordRequest, request).encode();
        const params = await this.tezos.params(
            address,
            entrypoint,
            [encodedRequest.label, encodedRequest.parent, encodedRequest.address, encodedRequest.owner, encodedRequest.data, encodedRequest.expiry],
            { storageLimit: 400 }
        );

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async updateRecord(request: Exact<UpdateRecordRequest>): Promise<WalletTransferParams> {
        this.assertDomainName(request.name);

        const entrypoint = 'update_record';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(UpdateRecordRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.name, encodedRequest.address, encodedRequest.owner, encodedRequest.data], {
            storageLimit: 400,
        });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async commit(tld: string, request: Exact<CommitmentRequest>): Promise<WalletTransferParams> {
        this.assertDomainName(`${request.label}.${tld}`);

        const entrypoint = 'commit';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const commitmentHash = this.commitmentGenerator.generate(request);
        const params = await this.tezos.params(address, entrypoint, [commitmentHash], { storageLimit: 200 });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async buy(tld: string, request: Exact<BuyRequest>): Promise<WalletTransferParams> {
        this.assertDomainName(`${request.label}.${tld}`);

        const entrypoint = 'buy';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const info = await this.dataProvider.getAcquisitionInfo(`${request.label}.${tld}`);
        const price = info.calculatePrice(request.duration);
        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(BuyRequest, request).encode();

        const params = await this.tezos.params(
            address,
            entrypoint,
            [encodedRequest.label, encodedRequest.duration, encodedRequest.owner, encodedRequest.address, encodedRequest.data, encodedRequest.nonce],
            { amount: price, storageLimit: 800 }
        );

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async renew(tld: string, request: Exact<RenewRequest>): Promise<WalletTransferParams> {
        this.assertDomainName(`${request.label}.${tld}`);

        const entrypoint = 'renew';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const info = await this.dataProvider.getAcquisitionInfo(`${request.label}.${tld}`);
        const price = info.calculatePrice(request.duration);
        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(RenewRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.label, encodedRequest.duration], { amount: price });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async claimReverseRecord(request: Exact<ReverseRecordRequest>): Promise<WalletTransferParams> {
        if (request.name) {
            this.assertDomainName(request.name);
        }

        const entrypoint = 'claim_reverse_record';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(ReverseRecordRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.name, encodedRequest.owner], { storageLimit: 400 });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async updateReverseRecord(request: Exact<UpdateReverseRecordRequest>): Promise<WalletTransferParams> {
        if (request.name) {
            this.assertDomainName(request.name);
        }

        const entrypoint = 'update_reverse_record';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(UpdateReverseRecordRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.address, encodedRequest.name, encodedRequest.owner], {
            storageLimit: 200,
        });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async bid(tld: string, request: Exact<BidRequest>): Promise<WalletTransferParams> {
        this.assertDomainName(`${request.label}.${tld}`);

        const entrypoint = 'bid';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const balance = await this.dataProvider.getBidderBalance(tld, await this.tezos.getPkh());
        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(BidRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.label, encodedRequest.bid], {
            amount: Math.max(0, request.bid - balance),
            storageLimit: 200,
        });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async settle(tld: string, request: Exact<SettleRequest>): Promise<WalletTransferParams> {
        this.assertDomainName(`${request.label}.${tld}`);

        const entrypoint = 'settle';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(SettleRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.label, encodedRequest.owner, encodedRequest.address, encodedRequest.data], {
            storageLimit: 800,
        });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async withdraw(tld: string, recipient: string): Promise<WalletTransferParams> {
        if (!this.validator.supportedTLDs.includes(tld)) {
            throw new Error(`TLD '${tld}' is not supported.`);
        }

        const entrypoint = 'withdraw';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, recipient);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const params = await this.tezos.params(address, entrypoint, [recipient]);

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    private assertDomainName(name: string) {
        const validation = this.validator.validateDomainName(name);

        if (validation === DomainNameValidationResult.VALID) {
            return;
        }

        this.tracer.trace('!! Domain name validation failed.', validation);

        throw new Error(`'${name}' is not a valid domain name.`);
    }
}
