import { Tracer, StandardRecordMetadataKey, CachingConfig, DomainInfo, ReverseRecordDomainInfo } from '@tezos-domains/core';
import NodeCache from 'node-cache';

import { NameResolver } from './name-resolver';

export class CachedNameResolver implements NameResolver {
    private cache: NodeCache;

    constructor(
        private inner: NameResolver,
        private tracer: Tracer,
        private config: Pick<Required<CachingConfig>, 'defaultRecordTtl' | 'defaultReverseRecordTtl'>
    ) {
        this.cache = new NodeCache({ useClones: false });
    }

    async resolveDomainRecord(name: string): Promise<DomainInfo | null> {
        this.tracer.trace(`=> Cache decorator: Resolving record '${name}'.`);

        if (!this.cache.has(name)) {
            this.tracer.trace('!! Cache miss.');

            const promise = this.inner.resolveDomainRecord(name);
            promise
                .then(r => {
                    if (!r) {
                        return null;
                    }

                    const ttl = r.data.getJson<number>(StandardRecordMetadataKey.TTL);
                    if (ttl) {
                        this.cache.ttl(name, ttl);
                    }
                })
                .catch((err) => {
                    this.tracer.trace(`!! Removing ${name} from cache because resolving failed.`, err);

                    this.cache.del(name);
                });

            this.cache.set(name, promise, this.config.defaultRecordTtl);
        } else {
            this.tracer.trace('!! Cache hit.');
        }

        const promise = this.cache.get<Promise<DomainInfo | null>>(name)!;

        const record = await promise;

        this.tracer.trace(`<= Cache decorator: Resolved address.`, record);

        return record;
    }

    async resolveNameToAddress(name: string): Promise<string | null> {
        this.tracer.trace(`=> Cache decorator: Resolving address for '${name}'`);

        const record = await this.resolveDomainRecord(name);

        const address = record?.address || null;

        this.tracer.trace(`<= Cache decorator: Resolved address.`, address);

        return address;
    }

    async resolveReverseRecord(address: string): Promise<ReverseRecordDomainInfo | null> {
        this.tracer.trace(`=> Cache decorator Resolving reverse record '${address}'`);

        if (!this.cache.has(address)) {
            this.tracer.trace('!! Cache miss.');

            const promise = this.inner.resolveReverseRecord(address);
            promise
                .then(r => {
                    if (!r) {
                        return null;
                    }

                    const ttl = r.data.getJson<number>(StandardRecordMetadataKey.TTL);
                    if (ttl) {
                        this.cache.ttl(address, ttl);
                    }
                })
                .catch((err) => {
                    this.tracer.trace(`!! Removing ${address} from cache because resolving failed.`, err);

                    this.cache.del(address);
                });

            this.cache.set(address, promise, this.config.defaultReverseRecordTtl);
        } else {
            this.tracer.trace('!! Cache hit.');
        }

        const promise = this.cache.get<Promise<ReverseRecordDomainInfo | null>>(address)!;

        const reverseRecord = await promise;

        this.tracer.trace(`<= Cache decorator: Resolved reverse record.`, reverseRecord);

        return reverseRecord;
    }

    async resolveAddressToName(address: string): Promise<string | null> {
        this.tracer.trace(`=> Cache decorator: Resolving name for '${address}'`);

        const reverseRecordDomain = await this.resolveReverseRecord(address);

        const name = reverseRecordDomain?.name || null;

        this.tracer.trace(`<= Cache decorator: Resolved name.`, name);

        return name;
    }

    clearCache(): void {
        this.cache.flushAll();
    }
}
