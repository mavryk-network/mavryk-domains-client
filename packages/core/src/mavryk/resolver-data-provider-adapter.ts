import { DomainInfo, ReverseRecordDomainInfo } from '../model';
import { MavrykDomainsDataProvider } from './mavryk-domains-data-provider';
import { MavrykDomainsResolverDataProvider } from './mavryk-domains-resolver-data-provider';
import { Tracer } from '../tracing/tracer';

export class ResolverDataProviderAdapter implements MavrykDomainsResolverDataProvider {
    constructor(private mavrykDomainsDataProvider: MavrykDomainsDataProvider, private tracer: Tracer) {}

    async resolveDomainInfo(name: string): Promise<DomainInfo | null> {
        this.tracer.trace(`=> Resolving record '${name} with big map based resolution algorithm'`);

        const info = await this.getValidRecord(name);

        this.tracer.trace(`<= Resolved record.`, info?.record);

        if (!info) {
            return null;
        }

        return {
            name,
            address: info.record.address,
            data: info.record.data,
            expiry: info.expiry,
        };
    }

    async resolveReverseRecordDomainInfo(address: string): Promise<ReverseRecordDomainInfo | null> {
        this.tracer.trace(`=> Resolving reverse record for '${address} with big map based resolution algorithm'`);

        const reverseRecord = await this.mavrykDomainsDataProvider.getReverseRecord(address);

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
            address,
            name: reverseRecord.name,
            data: info.record.data,
            expiry: info.expiry,
        };
    }

    private async getValidRecord(name: string) {
        const record = await this.mavrykDomainsDataProvider.getDomainRecord(name);

        if (!record) {
            this.tracer.trace('!! Record is null.');
            return null;
        }

        if (!record.expiry_key) {
            this.tracer.trace(`!! Validity key is null, record never expires.`);
        }

        const expiry = record.expiry_key ? await this.mavrykDomainsDataProvider.getDomainExpiry(record.expiry_key) : null;

        if (expiry && expiry < new Date()) {
            this.tracer.trace('!! Record is expired.');
            // expired
            return null;
        }

        this.tracer.trace('!! Record is valid.');

        return { record, expiry };
    }
}
