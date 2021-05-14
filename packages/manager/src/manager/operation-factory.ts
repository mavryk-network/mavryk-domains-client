import { WalletTransferParams } from '@taquito/taquito';
import {
    AdditionalOperationParams,
    AddressBook,
    DomainNameValidationResult,
    DomainNameValidator,
    Exact,
    RpcRequestData,
    SmartContractType,
    Tracer,
} from '@tezos-domains/core';
import { TaquitoClient } from '@tezos-domains/taquito';

import { CommitmentGenerator } from './commitment-generator';
import { TaquitoManagerDataProvider } from './data-provider';
import { DEFAULT_STORAGE_LIMITS } from './model';
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
    setChildRecord(request: Exact<SetChildRecordRequest>, operationParams?: AdditionalOperationParams): Promise<TOperationParams>;
    updateRecord(request: Exact<UpdateRecordRequest>, operationParams?: AdditionalOperationParams): Promise<TOperationParams>;
    commit(tld: string, request: Exact<CommitmentRequest>, operationParams?: AdditionalOperationParams): Promise<TOperationParams>;
    buy(tld: string, request: Exact<BuyRequest>, operationParams?: AdditionalOperationParams): Promise<TOperationParams>;
    renew(tld: string, request: Exact<RenewRequest>, operationParams?: AdditionalOperationParams): Promise<TOperationParams>;
    claimReverseRecord(request: Exact<ReverseRecordRequest>, operationParams?: AdditionalOperationParams): Promise<TOperationParams>;
    updateReverseRecord(request: Exact<UpdateReverseRecordRequest>, operationParams?: AdditionalOperationParams): Promise<TOperationParams>;
    bid(tld: string, request: Exact<BidRequest>, operationParams?: AdditionalOperationParams): Promise<TOperationParams>;
    settle(tld: string, request: Exact<SettleRequest>, operationParams?: AdditionalOperationParams): Promise<TOperationParams>;
    withdraw(tld: string, recipient: string, operationParams?: AdditionalOperationParams): Promise<TOperationParams>;
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

    async setChildRecord(request: Exact<SetChildRecordRequest>, operationParams?: AdditionalOperationParams): Promise<WalletTransferParams> {
        this.assertDomainName(`${request.label}.${request.parent}`);

        const entrypoint = 'set_child_record';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(SetChildRecordRequest, request).encode();
        const params = await this.tezos.params(
            address,
            entrypoint,
            [encodedRequest.label, encodedRequest.parent, encodedRequest.address, encodedRequest.owner, encodedRequest.data, encodedRequest.expiry],
            { storageLimit: DEFAULT_STORAGE_LIMITS[entrypoint], ...operationParams }
        );

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async updateRecord(request: Exact<UpdateRecordRequest>, operationParams?: AdditionalOperationParams): Promise<WalletTransferParams> {
        this.assertDomainName(request.name);

        const entrypoint = 'update_record';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(UpdateRecordRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.name, encodedRequest.address, encodedRequest.owner, encodedRequest.data], {
            storageLimit: DEFAULT_STORAGE_LIMITS[entrypoint],
            ...operationParams,
        });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async commit(tld: string, request: Exact<CommitmentRequest>, operationParams?: AdditionalOperationParams): Promise<WalletTransferParams> {
        this.assertDomainName(`${request.label}.${tld}`);

        const entrypoint = 'commit';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const commitmentHash = this.commitmentGenerator.generate(request);
        const params = await this.tezos.params(address, entrypoint, [commitmentHash], { storageLimit: DEFAULT_STORAGE_LIMITS[entrypoint], ...operationParams });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async buy(tld: string, request: Exact<BuyRequest>, operationParams?: AdditionalOperationParams): Promise<WalletTransferParams> {
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
            { amount: price, storageLimit: DEFAULT_STORAGE_LIMITS[entrypoint], ...operationParams }
        );

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async renew(tld: string, request: Exact<RenewRequest>, operationParams?: AdditionalOperationParams): Promise<WalletTransferParams> {
        this.assertDomainName(`${request.label}.${tld}`);

        const entrypoint = 'renew';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const info = await this.dataProvider.getAcquisitionInfo(`${request.label}.${tld}`);
        const price = info.calculatePrice(request.duration);
        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(RenewRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.label, encodedRequest.duration], { amount: price, ...operationParams });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async claimReverseRecord(request: Exact<ReverseRecordRequest>, operationParams?: AdditionalOperationParams): Promise<WalletTransferParams> {
        if (request.name) {
            this.assertDomainName(request.name);
        }

        const entrypoint = 'claim_reverse_record';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(ReverseRecordRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.name, encodedRequest.owner], { storageLimit: DEFAULT_STORAGE_LIMITS[entrypoint], ...operationParams });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async updateReverseRecord(request: Exact<UpdateReverseRecordRequest>, operationParams?: AdditionalOperationParams): Promise<WalletTransferParams> {
        if (request.name) {
            this.assertDomainName(request.name);
        }

        const entrypoint = 'update_reverse_record';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.NameRegistry, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(UpdateReverseRecordRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.address, encodedRequest.name, encodedRequest.owner], {
            storageLimit: DEFAULT_STORAGE_LIMITS[entrypoint],
            ...operationParams,
        });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async bid(tld: string, request: Exact<BidRequest>, operationParams?: AdditionalOperationParams): Promise<WalletTransferParams> {
        this.assertDomainName(`${request.label}.${tld}`);

        const entrypoint = 'bid';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const balance = await this.dataProvider.getBidderBalance(tld, await this.tezos.getPkh());
        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(BidRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.label, encodedRequest.bid], {
            amount: Math.max(0, request.bid - balance),
            storageLimit: DEFAULT_STORAGE_LIMITS[entrypoint],
            ...operationParams,
        });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async settle(tld: string, request: Exact<SettleRequest>, operationParams?: AdditionalOperationParams): Promise<WalletTransferParams> {
        this.assertDomainName(`${request.label}.${tld}`);

        const entrypoint = 'settle';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, request);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const encodedRequest = RpcRequestData.fromObject(SettleRequest, request).encode();
        const params = await this.tezos.params(address, entrypoint, [encodedRequest.label, encodedRequest.owner, encodedRequest.address, encodedRequest.data], {
            storageLimit: DEFAULT_STORAGE_LIMITS[entrypoint],
            ...operationParams,
        });

        this.tracer.trace('<= Prepared.', params);

        return params;
    }

    async withdraw(tld: string, recipient: string, operationParams?: AdditionalOperationParams): Promise<WalletTransferParams> {
        if (!this.validator.supportedTLDs.includes(tld)) {
            throw new Error(`TLD '${tld}' is not supported.`);
        }

        const entrypoint = 'withdraw';

        this.tracer.trace(`=> Preparing operation ${entrypoint}.`, recipient);

        const address = await this.addressBook.lookup(SmartContractType.TLDRegistrar, tld, entrypoint);
        const params = await this.tezos.params(address, entrypoint, [recipient], operationParams);

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
