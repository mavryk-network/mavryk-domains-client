import './resolver/name-resolver';

export { TezosDomainsResolver, ResolverConfig, CachingConfig } from './resolver/tezos-domains-resolver';
export { NullNameResovler } from './resolver/null-name-resolver';
export { BlockchainNameResolver } from './resolver/blockchain-name-resolver';
export { CachedNameResolver } from './resolver/cached-name-resolver';
export { NameResolver } from './resolver/name-resolver';
export { DomainInfo, ReverseRecordInfo } from './resolver/model';