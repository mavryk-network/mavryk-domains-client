import {
    Tracer,
    DomainNameValidationResult,
    DomainNameValidator,
    MavrykDomainsResolverDataProvider,
    DomainInfo,
    ReverseRecordDomainInfo,
} from '@mavrykdynamics/mavryk-domains-core';

import { NameResolver } from './name-resolver';

export class BlockchainNameResolver implements NameResolver {
    constructor(private mavrykDomainsDataProvider: MavrykDomainsResolverDataProvider, private tracer: Tracer, private validator: DomainNameValidator) {}

    async resolveDomainRecord(name: string): Promise<DomainInfo | null> {
        this.tracer.trace(`=> Resolving record '${name}'`);

        if (!name) {
            throw new Error(`Argument 'name' was not specified.`);
        }

        if (this.validator.validateDomainName(name) !== DomainNameValidationResult.VALID) {
            throw new Error(`'${name}' is not a valid domain name.`);
        }

        const record = await this.mavrykDomainsDataProvider.resolveDomainInfo(name);

        this.tracer.trace(`<= Resolved record.`, record);

        return record;
    }

    async resolveNameToAddress(name: string): Promise<string | null> {
        this.tracer.trace(`=> Resolving address for '${name}'`);

        const record = await this.resolveDomainRecord(name);

        const address = record?.address || null;

        this.tracer.trace(`<= Resolved address.`, address);

        return address;
    }

    async resolveReverseRecord(address: string): Promise<ReverseRecordDomainInfo | null> {
        this.tracer.trace(`=> Resolving reverse record for '${address}'`);

        if (!address) {
            throw new Error(`Argument 'address' was not specified.`);
        }

        const reverseRecordDomain = await this.mavrykDomainsDataProvider.resolveReverseRecordDomainInfo(address);

        this.tracer.trace(`<= Resolved reverse record.`, reverseRecordDomain);

        return reverseRecordDomain;
    }

    async resolveAddressToName(address: string): Promise<string | null> {
        this.tracer.trace(`=> Resolving name for '${address}'`);

        const reverseRecordDomain = await this.resolveReverseRecord(address);

        if (!reverseRecordDomain) {
            return null;
        }

        this.tracer.trace(`<= Resolved name.`, reverseRecordDomain.name);

        return reverseRecordDomain.name;
    }

    clearCache(): void {
        return void 0;
    }
}
