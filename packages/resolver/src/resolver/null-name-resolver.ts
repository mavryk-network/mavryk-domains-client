import { NameResolver } from './name-resolver';

export class NullNameResovler implements NameResolver {
    resolve(): Promise<string | null> {
        return Promise.resolve(null);
    }
    reverseResolve(): Promise<string | null> {
        return Promise.resolve(null);
    }
}
