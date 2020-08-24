import { Tracer, DomainRecord, ReverseRecord } from '@tezos-domains/core';
import NodeCache from 'node-cache';

import { NameResolver } from './name-resolver';
import { CachingConfig } from '../resolver';

export class CachedNameResolver implements NameResolver {
    private cache: NodeCache;

    constructor(
        private inner: NameResolver,
        private tracer: Tracer,
        private config: Pick<Required<CachingConfig>, 'defaultRecordTtl' | 'defaultReverseRecordTtl'>
    ) {
        this.cache = new NodeCache({ useClones: false });
    }

    async resolve(name: string): Promise<DomainRecord | null> {
        this.tracer.trace(`=> Cache decorator: Resolving record '${name}'.`);

        if (!this.cache.has(name)) {
            this.tracer.trace('!! Cache miss.');

            const promise = this.inner.resolve(name);
            promise
                .then(r => {
                    if (!r) {
                        return null;
                    }

                    const ttl = r.data.ttl;
                    if (ttl) {
                        this.cache.ttl(name, ttl);
                    }
                })
                .catch(() => {
                    this.tracer.trace(`!! Removing ${name} from cache because resolving failed.`);

                    this.cache.del(name);
                });

            this.cache.set(name, promise, this.config.defaultRecordTtl);
        } else {
            this.tracer.trace('!! Cache hit.');
        }

        const promise = this.cache.get<Promise<DomainRecord | null>>(name)!;

        const record = await promise;

        this.tracer.trace(`<= Cache decorator: Resolved address.`, record);

        return record;
    }

    async resolveAddress(name: string): Promise<string | null> {
        this.tracer.trace(`=> Cache decorator: Resolving address for '${name}'`);

        const record = await this.resolve(name);

        const address = record?.address || null;

        this.tracer.trace(`<= Cache decorator: Resolved address.`, address);

        return address;
    }

    async reverseResolve(address: string): Promise<ReverseRecord | null> {
        this.tracer.trace(`=> Cache decorator Resolving reverse record '${address}'`);

        if (!this.cache.has(address)) {
            this.tracer.trace('!! Cache miss.');

            const promise = this.inner.reverseResolve(address);
            promise.catch(() => {
                this.tracer.trace(`!! Removing ${address} from cache because resolving failed.`);

                this.cache.del(address);
            });

            this.cache.set(address, promise, this.config.defaultReverseRecordTtl);
        } else {
            this.tracer.trace('!! Cache hit.');
        }

        const promise = this.cache.get<Promise<ReverseRecord | null>>(address)!;

        const reverseRecord = await promise;

        this.tracer.trace(`<= Cache decorator: Resolved reverse record.`, reverseRecord);

        return reverseRecord;
    }

    async reverseResolveName(address: string): Promise<string | null> {
        this.tracer.trace(`=> Cache decorator: Resolving name for '${address}'`);

        const reverseRecord = await this.reverseResolve(address);

        const name = reverseRecord?.name || null;

        this.tracer.trace(`<= Cache decorator: Resolved name.`, name);

        return name;
    }
}
