import { normalizeDomainName, Tracer, DomainInfo, ReverseRecordDomainInfo } from '@tezos-domains/core';

import { NameResolver } from './name-resolver';


export class NameNormalizingNameResolver implements NameResolver {
    constructor(private inner: NameResolver, private tracer: Tracer) {}

    resolveDomainRecord(name: string): Promise<DomainInfo | null> {
        return this.inner.resolveDomainRecord(this.normalizeName(name));
    }

    resolveNameToAddress(name: string): Promise<string | null> {
        return this.inner.resolveNameToAddress(this.normalizeName(name));
    }

    resolveReverseRecord(address: string): Promise<ReverseRecordDomainInfo | null> {
        return this.inner.resolveReverseRecord(address);
    }

    resolveAddressToName(address: string): Promise<string | null> {
        return this.inner.resolveAddressToName(address);
    }

    clearCache(): void {
        this.inner.clearCache();
    }

    private normalizeName(name: string) {
        const normalized = normalizeDomainName(name);

        if (name !== normalized) {
            this.tracer.trace(`!! Normalized name '${name}' to '${normalized}'.`);
        }

        return normalized;
    }
}
