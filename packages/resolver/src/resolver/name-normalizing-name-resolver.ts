import { Tracer } from '@tezos-domains/core';
import { toUnicode } from 'idna-uts46-hx';

import { NameResolver, DomainInfo, ReverseRecordInfo } from '../resolver';

export class NameNormalizingNameResolver implements NameResolver {
    constructor(private inner: NameResolver, private tracer: Tracer) {}

    resolve(name: string): Promise<DomainInfo | null> {
        return this.inner.resolve(this.normalizeName(name));
    }

    resolveAddress(name: string): Promise<string | null> {
        return this.inner.resolveAddress(this.normalizeName(name));
    }

    reverseResolve(address: string): Promise<ReverseRecordInfo | null> {
        return this.inner.reverseResolve(address);
    }

    reverseResolveName(address: string): Promise<string | null> {
        return this.inner.reverseResolveName(address);
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
