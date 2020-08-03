import { Tracer } from '@tezos-domains/core';
import NodeCache from 'node-cache';

import { NameResolver } from './name-resolver';
import { CachingConfig } from '../resolver';

export class CachedNameResolver implements NameResolver {
    private cache: NodeCache;

    constructor(private inner: NameResolver, private tracer: Tracer, private config: Pick<Required<CachingConfig>, 'recordTtl' | 'reverseRecordTtl'>) {
        this.cache = new NodeCache({ useClones: false });
    }

    async resolve(name: string): Promise<string | null> {
        this.tracer.trace(`=> Cache decorator: Resolving address for '${name}'.`);

        if (!this.cache.has(name)) {
            this.tracer.trace('!! Cache miss.');

            const promise = this.inner.resolve(name);
            promise.catch(() => {
                this.tracer.trace(`!! Removing ${name} from cache because resolving failed.`);

                this.cache.del(name);
            });

            this.cache.set(name, promise, this.config.recordTtl);
        } else {
            this.tracer.trace('!! Cache hit.');
        }

        const promise = this.cache.get<Promise<string | null>>(name)!;

        const address = await promise;

        this.tracer.trace(`<= Cache decorator: Resolved address.`, address);

        return address;
    }

    async reverseResolve(address: string): Promise<string | null> {
        this.tracer.trace(`=> Cache decorator Resolving name for '${address}'`);

        if (!this.cache.has(address)) {
            this.tracer.trace('!! Cache miss.');

            const promise = this.inner.reverseResolve(address);
            promise.catch(() => {
                this.tracer.trace(`!! Removing ${address} from cache because resolving failed.`);

                this.cache.del(address);
            });

            this.cache.set(address, promise, this.config.reverseRecordTtl);
        } else {
            this.tracer.trace('!! Cache hit.');
        }

        const promise = this.cache.get<Promise<string | null>>(address)!;

        const name = await promise;

        this.tracer.trace(`<= Cache decorator: Resolved name.`, address);

        return name;
    }
}
