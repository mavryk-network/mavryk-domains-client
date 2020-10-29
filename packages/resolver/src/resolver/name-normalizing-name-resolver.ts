import { Tracer } from '@tezos-domains/core';
import { toUnicode } from 'idna-uts46-hx';

import { NameResolver, DomainInfo, ReverseRecordInfo } from '../resolver';

export class NameNormalizingNameResolver implements NameResolver {
    constructor(private inner: NameResolver, private tracer: Tracer) {}

    resolveDomainRecord(name: string): Promise<DomainInfo | null> {
        return this.inner.resolveDomainRecord(this.normalizeName(name));
    }

    resolveNameToAddress(name: string): Promise<string | null> {
        return this.inner.resolveNameToAddress(this.normalizeName(name));
    }

    resolveReverseRecord(address: string): Promise<ReverseRecordInfo | null> {
        return this.inner.resolveReverseRecord(address);
    }

    resolveAddressToName(address: string): Promise<string | null> {
        return this.inner.resolveAddressToName(address);
    }

    clearCache(): void {
        this.inner.clearCache();
    }

    private normalizeName(name: string) {
        const normalized = toUnicode(name, { useStd3ASCII: false });

        if (name !== normalized) {
            this.tracer.trace(`!! Normalized name '${name}' to '${normalized}'.`);
        }

        return normalized;
    }
}
