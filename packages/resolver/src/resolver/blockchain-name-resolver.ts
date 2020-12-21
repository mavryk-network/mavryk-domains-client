import { Tracer, DomainNameValidationResult, DomainNameValidator, TezosDomainsDataProvider, DomainRecord } from '@tezos-domains/core';

import { NameResolver } from './name-resolver';
import { DomainInfo, ReverseRecordInfo } from './model';

export class BlockchainNameResolver implements NameResolver {
    constructor(private tezosDomainsDataProvider: TezosDomainsDataProvider, private tracer: Tracer, private validator: DomainNameValidator) {}

    async resolveDomainRecord(name: string): Promise<DomainInfo | null> {
        this.tracer.trace(`=> Resolving record '${name}'`);

        if (!name) {
            throw new Error(`Argument 'name' was not specified.`);
        }

        if (this.validator.validateDomainName(name) !== DomainNameValidationResult.VALID) {
            throw new Error(`'${name}' is not a valid domain name.`);
        }

        const info = await this.getValidRecord(name);

        this.tracer.trace(`<= Resolved record.`, info?.record);

        if (!info) {
            return null;
        }

        return this.makeDomainInfo({ ...info, name });
    }

    async resolveNameToAddress(name: string): Promise<string | null> {
        this.tracer.trace(`=> Resolving address for '${name}'`);

        const record = await this.resolveDomainRecord(name);

        const address = record?.address || null;

        this.tracer.trace(`<= Resolved address.`, address);

        return address;
    }

    async resolveReverseRecord(address: string): Promise<ReverseRecordInfo | null> {
        this.tracer.trace(`=> Resolving reverse record for '${address}'`);

        if (!address) {
            throw new Error(`Argument 'address' was not specified.`);
        }

        const reverseRecord = await this.tezosDomainsDataProvider.getReverseRecord(address);

        if (!reverseRecord || !reverseRecord.name) {
            this.tracer.trace(`!! Reverse record is empty.`);

            return null;
        }

        const info = await this.getValidRecord(reverseRecord.name);
        if (!info) {
            return null;
        }

        this.tracer.trace(`<= Resolved reverse record.`, reverseRecord);

        return {
            domain: this.makeDomainInfo({ ...info, name: reverseRecord.name }),
            owner: reverseRecord.owner,
            data: reverseRecord.data,
        };
    }

    async resolveAddressToName(address: string): Promise<string | null> {
        this.tracer.trace(`=> Resolving name for '${address}'`);

        const reverseRecord = await this.resolveReverseRecord(address);

        if (!reverseRecord) {
            return null;
        }

        this.tracer.trace(`<= Resolved name.`, reverseRecord.domain.name);

        return reverseRecord.domain.name;
    }

    private async getValidRecord(name: string) {
        const record = await this.tezosDomainsDataProvider.getDomainRecord(name);

        if (!record) {
            this.tracer.trace('!! Record is null.');
            return null;
        }

        if (!record.expiry_key) {
            this.tracer.trace(`!! Validity key is null, record never expires.`);
        }

        const expiry = record.expiry_key ? await this.tezosDomainsDataProvider.getDomainExpiry(record.expiry_key) : null;

        if (expiry && expiry < new Date()) {
            this.tracer.trace('!! Record is expired.');
            // expired
            return null;
        }

        this.tracer.trace('!! Record is valid.');

        return { record, expiry };
    }

    private makeDomainInfo(info: { name: string; record: DomainRecord; expiry: Date | null }): DomainInfo {
        return {
            name: info.name,
            address: info.record.address,
            data: info.record.data,
            owner: info.record.owner,
            expiry: info.expiry,
        };
    }

    clearCache(): void {
        return void 0;
    }
}
