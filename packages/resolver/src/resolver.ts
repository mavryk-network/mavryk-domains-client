import './resolver/name-resolver';
import './resolver/model';

export { NullNameResolver } from './resolver/null-name-resolver';
export { NameResolver } from './resolver/name-resolver';
export { DomainInfo, ReverseRecordInfo } from './resolver/model';
export { createResolver } from './resolver/factory';
