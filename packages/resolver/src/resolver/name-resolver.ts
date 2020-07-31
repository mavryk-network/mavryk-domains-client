export interface NameResolver {
    resolve(name: string): Promise<string | null>;
    reverseResolve(address: string): Promise<string | null>;
}
